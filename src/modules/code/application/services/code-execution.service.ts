import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type { SupportedLanguage } from '../dtos/execute-code.dto';

const execAsync = promisify(exec);

interface LanguageConfig {
  extension: string;
  command: (filePath: string) => string;
  template: (code: string) => string;
}

function resolveTempDir(): string {
  const envDir = process.env.CODE_EXEC_TEMP_DIR;
  if (envDir && envDir.trim().length > 0) {
    return envDir;
  }

  if (process.platform === 'win32') {
    return path.join(process.cwd(), 'tmp', 'code_execution');
  }

  return '/tmp/code_execution';
}

const TEMP_DIR = resolveTempDir();

const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    extension: 'js',
    command: (filePath) => `node "${filePath}"`,
    template: (code) => code, // JS не требует обертки
  },
  python: {
    extension: 'py',
    command: (filePath) => `python3 "${filePath}"`,
    template: (code) => code, // Python не требует обертки
  },
  csharp: {
    extension: 'cs',
    command: (filePath) => `dotnet run --project "${path.dirname(filePath)}"`,
    template: (code) => code, // C# код уже содержит Program.Main
  },
  golang: {
    extension: 'go',
    command: (filePath) => `cd "${path.dirname(filePath)}" && go run "${path.basename(filePath)}"`,
    template: (code) => code, // Go код уже содержит package main и func main
  },
  java: {
    extension: 'java',
    command: (filePath) => {
      const dir = path.dirname(filePath);
      // Извлекаем имя класса из файла
      return `cd "${dir}" && javac *.java && java -cp . Main`;
    },
    template: (code) => code, // Java код уже содержит свой класс
  },
};

@Injectable()
export class CodeExecutionService {
  constructor() {
    this.ensureTempDir();
  }

  private ensureTempDir(): void {
    try {
      if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
      }
    } catch (error: any) {
      console.error('Failed to create temp dir for code execution:', error?.message);
    }
  }

  async executeCode(language: SupportedLanguage, code: string): Promise<{ output: string; error?: string }> {
    const config = LANGUAGE_CONFIG[language];

    if (!config) {
      throw new BadRequestException({
        message: `Unsupported language: ${language}`,
        supported: Object.keys(LANGUAGE_CONFIG),
      });
    }

    const ts = Date.now();
    let filePath: string | undefined;

    try {
      // Специальная обработка для разных языков
      switch (language) {
        case 'java': {
          const javaDir = path.join(TEMP_DIR, `java_${ts}`);
          fs.mkdirSync(javaDir, { recursive: true });

          // Определяем имя класса из кода
          const classNameMatch = code.match(/public\s+class\s+(\w+)/);
          const className = classNameMatch ? classNameMatch[1] : 'Main';
          filePath = path.join(javaDir, `${className}.java`);

          await fs.promises.writeFile(filePath, code, 'utf8');

          const command = `cd "${javaDir}" && javac *.java && java -cp . ${className}`;
          const { stdout, stderr } = await execAsync(command, { timeout: 15_000, cwd: javaDir });

          this.cleanupFiles(filePath, language);

          const stderrTrim = stderr?.trim() ?? '';
          const stdoutTrim = stdout?.trim() ?? '';

          if (stderrTrim && !stdoutTrim && !stderrTrim.toLowerCase().includes('warning')) {
            return { output: '', error: stderrTrim };
          }

          return { output: stdoutTrim || stderrTrim || 'Код выполнен успешно' };
        }

        case 'csharp': {
          const csDir = path.join(TEMP_DIR, `csharp_${ts}`);
          fs.mkdirSync(csDir, { recursive: true });

          filePath = path.join(csDir, 'Program.cs');
          await fs.promises.writeFile(filePath, code, 'utf8');

          // Создаем проект, только если его нет
          await this.createCSharpProject(csDir);

          const command = `dotnet run --project "${csDir}"`;
          const { stdout, stderr } = await execAsync(command, { timeout: 15_000, cwd: csDir });

          this.cleanupFiles(filePath, language);

          const stderrTrim = stderr?.trim() ?? '';
          const stdoutTrim = stdout?.trim() ?? '';

          if (stderrTrim && !stdoutTrim && !stderrTrim.toLowerCase().includes('warning')) {
            return { output: '', error: stderrTrim };
          }

          return { output: stdoutTrim || stderrTrim || 'Код выполнен успешно' };
        }

        case 'golang': {
          const goDir = path.join(TEMP_DIR, `go_${ts}`);
          fs.mkdirSync(goDir, { recursive: true });

          filePath = path.join(goDir, 'main.go');
          await fs.promises.writeFile(filePath, code, 'utf8');

          const command = `go run "${filePath}"`;
          const { stdout, stderr } = await execAsync(command, { timeout: 15_000, cwd: goDir });

          this.cleanupFiles(filePath, language);

          const stderrTrim = stderr?.trim() ?? '';
          const stdoutTrim = stdout?.trim() ?? '';

          if (stderrTrim && !stdoutTrim) {
            return { output: '', error: stderrTrim };
          }

          return { output: stdoutTrim || stderrTrim || 'Код выполнен успешно' };
        }

        default: {
          // JavaScript и Python
          filePath = path.join(TEMP_DIR, `code_${ts}.${config.extension}`);
          await fs.promises.writeFile(filePath, code, 'utf8');

          const command = config.command(filePath);
          const { stdout, stderr } = await execAsync(command, { timeout: 15_000, cwd: TEMP_DIR });

          this.cleanupFiles(filePath, language);

          const stderrTrim = stderr?.trim() ?? '';
          const stdoutTrim = stdout?.trim() ?? '';

          if (stderrTrim && !stdoutTrim) {
            return { output: '', error: stderrTrim };
          }

          return { output: stdoutTrim || stderrTrim || 'Код выполнен успешно' };
        }
      }
    } catch (error: any) {
      if (filePath) {
        this.cleanupFiles(filePath, language);
      }

      const execErr = error?.stderr ?? error?.stdout ?? error?.message ?? 'Ошибка при выполнении кода';
      const errStr = typeof execErr === 'string' ? execErr : String(execErr);
      return { output: '', error: errStr };
    }
  }

  private async createCSharpProject(projectDir: string): Promise<void> {
    const csprojPath = path.join(projectDir, 'csharp_project.csproj');

    // Проверяем, существует ли уже файл проекта
    if (fs.existsSync(csprojPath)) {
      return;
    }

    const projectContent = `<?xml version="1.0" encoding="utf-8"?>
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>`;

    await fs.promises.writeFile(csprojPath, projectContent, 'utf8');
  }

  private cleanupFiles(filePath: string, language: SupportedLanguage): void {
    try {
      if (language === 'java') {
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.class') || file.endsWith('.java')) {
              fs.unlinkSync(path.join(dir, file));
            }
          }
          fs.rmdirSync(dir);
        }
        return;
      }

      if (language === 'csharp') {
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.cs') || file.endsWith('.csproj') || file.endsWith('.dll') || file.endsWith('.exe')) {
              try {
                fs.unlinkSync(path.join(dir, file));
              } catch (e) {
                // Игнорируем ошибки удаления
              }
            }
          }
          try {
            fs.rmdirSync(dir);
          } catch (e) {
            // Игнорируем ошибки удаления директории
          }
        }
        return;
      }

      if (language === 'golang') {
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            try {
              fs.unlinkSync(path.join(dir, file));
            } catch (e) {
              // Игнорируем ошибки удаления
            }
          }
          try {
            fs.rmdirSync(dir);
          } catch (e) {
            // Игнорируем ошибки удаления директории
          }
        }
        return;
      }

      // Для JS и Python - удаляем только файл
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e: any) {
      console.warn('Cleanup warning:', e?.message);
    }
  }

  async getHealth() {
    const languageStatus: Record<string, string> = {};

    const testCodes: Partial<Record<SupportedLanguage, string>> = {
      javascript: 'console.log("JS OK")',
      python: 'print("Python OK")',
      csharp: `using System;

public class Program {
    public static void Main() {
        Console.WriteLine("C# OK");
    }
}`,
      golang: `package main

import "fmt"

func main() {
    fmt.Println("Go OK")
}`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Java OK");
    }
}`,
    };

    for (const lang of Object.keys(LANGUAGE_CONFIG) as SupportedLanguage[]) {
      try {
        await this.checkLanguageAvailability(lang);

        if (testCodes[lang]) {
          const res = await this.executeCode(lang, testCodes[lang] as string);
          languageStatus[lang] = res.error ? `Error: ${res.error}` : 'Working';
        } else {
          languageStatus[lang] = 'Available';
        }
      } catch (error: any) {
        languageStatus[lang] = error?.message || 'Unavailable';
      }
    }

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      languages: languageStatus,
      tempDir: TEMP_DIR,
    };
  }

  private async checkLanguageAvailability(language: SupportedLanguage): Promise<void> {
    const testCommands: Record<SupportedLanguage, string> = {
      javascript: 'node --version',
      python: 'python3 --version',
      csharp: 'dotnet --version',
      golang: 'go version',
      java: 'javac -version',
    };

    try {
      const { stdout, stderr } = await execAsync(testCommands[language], { timeout: 5000 });
      const out = (stdout || stderr || '').trim();
      console.log(`${language} version: ${out}`);
    } catch (error) {
      console.error(`${language} not available:`, error);
      throw new Error(`${language} is not installed or not in PATH`);
    }
  }
}