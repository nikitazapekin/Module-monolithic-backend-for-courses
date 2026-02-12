import { BadRequestException, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type { SupportedLanguage } from '../dtos/execute-code.dto';

const execAsync = promisify(exec);

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'code_execution');

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
      console.error('Failed to create temp dir:', error?.message);
    }
  }

  async executeCode(language: SupportedLanguage, code: string): Promise<{ output: string; error?: string }> {
    const timestamp = Date.now();
    const uniqueId = `${language}_${timestamp}_${Math.random().toString(36).substring(7)}`;
    const workDir = path.join(TEMP_DIR, uniqueId);
    
    try {
      // Создаем рабочую директорию
      fs.mkdirSync(workDir, { recursive: true });
      console.log(`Work directory created: ${workDir}`);

      switch (language) {
        case 'javascript':
          return await this.runJavaScript(code, workDir);
        case 'python':
          return await this.runPython(code, workDir);
        case 'golang':
          return await this.runGolang(code, workDir);
        case 'java':
          return await this.runJava(code, workDir);
        case 'csharp':
          return await this.runCSharp(code, workDir);
        default:
          throw new BadRequestException(`Unsupported language: ${language}`);
      }
    } catch (error: any) {
      console.error(`Execution error for ${language}:`, error);
      
      // Очищаем директорию
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      return {
        output: '',
        error: error?.stderr || error?.stdout || error?.message || 'Ошибка выполнения кода'
      };
    }
  }

  private async runJavaScript(code: string, workDir: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'main.js');
    fs.writeFileSync(filePath, code);
    
    try {
      const { stdout, stderr } = await execAsync(`node "${filePath}"`, { cwd: workDir, timeout: 10000 });
      return { output: stdout.trim(), error: stderr.trim() || undefined };
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  private async runPython(code: string, workDir: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'main.py');
    fs.writeFileSync(filePath, code);
    
    try {
      // Пробуем python3, затем python
      try {
        const { stdout, stderr } = await execAsync(`python3 "${filePath}"`, { cwd: workDir, timeout: 10000 });
        return { output: stdout.trim(), error: stderr.trim() || undefined };
      } catch (python3Error) {
        const { stdout, stderr } = await execAsync(`python "${filePath}"`, { cwd: workDir, timeout: 10000 });
        return { output: stdout.trim(), error: stderr.trim() || undefined };
      }
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  private async runGolang(code: string, workDir: string): Promise<{ output: string; error?: string }> {
    // Проверяем, есть ли package main
    if (!code.includes('package main')) {
      code = `package main\n\n${code}`;
    }
    
    // Проверяем, есть ли func main
    if (!code.includes('func main()')) {
      code = `${code}\n\nfunc main() {\n    \n}`;
    }
    
    const filePath = path.join(workDir, 'main.go');
    fs.writeFileSync(filePath, code);
    
    console.log('Go code to execute:', code);
    
    try {
      const { stdout, stderr } = await execAsync(`go run "${filePath}"`, { cwd: workDir, timeout: 15000 });
      console.log('Go stdout:', stdout);
      console.log('Go stderr:', stderr);
      
      return {
        output: stdout.trim(),
        error: stderr.trim() || undefined
      };
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
// В code-execution.service.ts - исправленный метод для Java


private async runJava(code: string, workDir: string): Promise<{ output: string; error?: string }> {
  const filePath = path.join(workDir, 'Main.java');
  fs.writeFileSync(filePath, code);
  
  try {
    // Компилируем
    const { stderr: compileError } = await execAsync(`javac "${filePath}"`, { 
      cwd: workDir, 
      timeout: 10000 
    });
    
    if (compileError) {
      return { output: '', error: compileError };
    }
    
    // Запускаем Main класс (не Runner!)
    const { stdout, stderr } = await execAsync(`java -cp "${workDir}" Main`, { 
      cwd: workDir, 
      timeout: 10000 
    });
    
    return {
      output: stdout.trim(),
      error: stderr.trim() || undefined
    };
  } catch (error: any) {
    return {
      output: '',
      error: error?.stderr || error?.stdout || error?.message || 'Ошибка выполнения Java'
    };
  }
}
  private async runCSharp(code: string, workDir: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'Program.cs');
    fs.writeFileSync(filePath, code);
    
    // Создаем csproj файл
    const csprojPath = path.join(workDir, 'app.csproj');
    const csprojContent = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`;
    
    fs.writeFileSync(csprojPath, csprojContent);
    
    console.log('C# code:', code);
    console.log('Work dir:', workDir);
    
    try {
      // Сначала проверяем, что dotnet доступен
      try {
        await execAsync('dotnet --version', { timeout: 5000 });
      } catch (e) {
        return { output: '', error: '.NET SDK not found. Please install .NET SDK 8.0' };
      }
      
      // Запускаем
      const { stdout, stderr } = await execAsync(`dotnet run --project "${csprojPath}"`, { 
        cwd: workDir, 
        timeout: 30000 
      });
      
      console.log('C# stdout:', stdout);
      console.log('C# stderr:', stderr);
      
      return {
        output: stdout.trim(),
        error: stderr.trim() || undefined
      };
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  async getHealth() {
    const languages = ['javascript', 'python', 'golang', 'java', 'csharp'] as SupportedLanguage[];
    const status: Record<string, string> = {};
    
    for (const lang of languages) {
      try {
        await this.checkLanguage(lang);
        status[lang] = 'Available';
      } catch (error: any) {
        status[lang] = `Unavailable: ${error.message}`;
      }
    }
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      languages: status,
      tempDir: TEMP_DIR
    };
  }
  
  private async checkLanguage(language: SupportedLanguage): Promise<void> {
    const commands = {
      javascript: 'node --version',
      python: 'python3 --version',
      golang: 'go version',
      java: 'javac -version',
      csharp: 'dotnet --version'
    };
    
    try {
      await execAsync(commands[language], { timeout: 5000 });
    } catch {
      // Пробуем альтернативные команды
      if (language === 'python') {
        await execAsync('python --version', { timeout: 5000 });
      }
    }
  }
}