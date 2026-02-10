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
    template: (code) => code,
  },
  python: {
    extension: 'py',
    command: (filePath) => `python3 "${filePath}"`,
    template: (code) => code,
  },
  csharp: {
    extension: 'cs',
    command: (filePath) => `dotnet run --project "${path.dirname(filePath)}"`,
    template: (code) => `
using System;

public class Program
{
    public static void Main()
    {
        ${code}
    }
}
    `.trimStart(),
  },
  golang: {
    extension: 'go',
    command: (filePath) => `cd "${path.dirname(filePath)}" && go run "${path.basename(filePath)}"`,
    template: (code) =>
      `package main

import "fmt"

func main() {
${code}
}
`.trimStart(),
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
      // Если не получилось создать директорию, но продолжили работу —
      // при выполнении кода вернём понятную ошибку.
      // Лишний раз не падаем на инициализации приложения.
      // eslint-disable-next-line no-console
      console.error('Failed to create temp dir for code execution:', error?.message);
    }
  }

  async executeCode(language: SupportedLanguage, code: string): Promise<string> {
    const config = LANGUAGE_CONFIG[language];

    if (!config) {
      throw new BadRequestException({
        message: `Unsupported language: ${language}`,
        supported: Object.keys(LANGUAGE_CONFIG),
      });
    }

    const fileName = `code_${Date.now()}.${config.extension}`;
    const filePath = path.join(TEMP_DIR, fileName);

    try {
      const fullCode = config.template(code);

      await fs.promises.writeFile(filePath, fullCode, 'utf8');

      if (language === 'csharp') {
        await this.createCSharpProject(filePath);
      }

      const command = config.command(filePath);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 15_000,
        cwd: TEMP_DIR,
      });

      this.cleanupFiles(filePath, language);

      if (stderr && stderr.trim() && !stdout.trim() && !stderr.includes('warning')) {
        throw new InternalServerErrorException(stderr);
      }

      const result = stdout.trim() || stderr.trim() || 'Код выполнен успешно (без вывода)';
      return result;
    } catch (error: any) {
      this.cleanupFiles(filePath, language);

      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      if (language === 'golang') {
        throw new InternalServerErrorException(
          `Go execution failed: ${error?.message}. Проверьте, что Go установлен в контейнере.`,
        );
      }

      throw new InternalServerErrorException(error?.message || 'Ошибка при выполнении кода');
    }
  }

  private async createCSharpProject(csFilePath: string): Promise<void> {
    const projectPath = csFilePath.replace('.cs', '.csproj');

    const projectContent = `<?xml version="1.0" encoding="utf-8"?>
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>`;

    await fs.promises.writeFile(projectPath, projectContent, 'utf8');

    // Небольшая пауза, чтобы файловая система успела «догнать»
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  }

  private cleanupFiles(filePath: string, language: SupportedLanguage): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (language === 'csharp') {
        const projectPath = filePath.replace('.cs', '.csproj');
        if (fs.existsSync(projectPath)) {
          fs.unlinkSync(projectPath);
        }
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('Cleanup warning:', e?.message);
    }
  }

  async getHealth() {
    const languageStatus: Record<string, string> = {};

    const testCodes: Partial<Record<SupportedLanguage, string>> = {
      javascript: 'console.log("JS OK")',
      python: 'print("Python OK")',
      csharp: 'Console.WriteLine("C# OK");',
      golang: 'fmt.Println("Go OK")',
    };

    for (const lang of Object.keys(LANGUAGE_CONFIG) as SupportedLanguage[]) {
      try {
        await this.checkLanguageAvailability(lang);

        if (testCodes[lang]) {
          await this.executeCode(lang, testCodes[lang] as string);
          languageStatus[lang] = 'Working';
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
      python: 'python --version',
      csharp: 'dotnet --version',
      golang: 'go version',
    };

    const { stdout } = await execAsync(testCommands[language], { timeout: 5000 });

    // eslint-disable-next-line no-console
    console.log(`${language} version: ${stdout.trim()}`);
  }
}

