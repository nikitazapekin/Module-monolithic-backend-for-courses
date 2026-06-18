import { BadRequestException, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type { SupportedLanguage } from '../dtos/execute-code-with-time.dto';

const execAsync = promisify(exec);

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'code_execution');

interface ExecutionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
}

@Injectable()
export class CodeExecutionWithTimeService {
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

  async executeCodeWithTime(
    language: SupportedLanguage,
    code: string,
  ): Promise<ExecutionResult> {
    const timestamp = Date.now();
    const uniqueId = `${language}_${timestamp}_${Math.random().toString(36).substring(7)}`;
    const workDir = path.join(TEMP_DIR, uniqueId);

    try {
      fs.mkdirSync(workDir, { recursive: true });
      console.log(`Work directory created: ${workDir}`);

      const startTime = Date.now();
      let result: { output: string; error?: string };

      switch (language) {
        case 'javascript':
          result = await this.runJavaScript(code, workDir);
          break;
        case 'python':
          result = await this.runPython(code, workDir);
          break;
        case 'java':
          result = await this.runJava(code, workDir);
          break;
        case 'csharp':
          result = await this.runCSharp(code, workDir);
          break;
        default:
          throw new BadRequestException(`Unsupported language: ${language}`);
      }

      const endTime = Date.now();

      const timeMatch = result.output.match(/__EXECUTION_TIME_MS__:(\d+(?:\.\d+)?)/);
      const preciseExecutionTimeMs = timeMatch ? parseFloat(timeMatch[1]) : 0;

      const executionTimeMs = preciseExecutionTimeMs > 0 ? preciseExecutionTimeMs : (endTime - startTime);

      const cleanOutput = result.output.replace(/__EXECUTION_TIME_MS__:\d+(?:\.\d+)?\n?/, '').trim();

      return {
        output: cleanOutput,
        error: result.error,
        executionTimeMs,
      };
    } catch (error: any) {
      console.error(`Execution error for ${language}:`, error);

      try {
        fs.rmSync(workDir, { recursive: true, force: true, maxRetries: 3 });
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }

      return {
        output: '',
        error:
          error?.stderr ||
          error?.stdout ||
          error?.message ||
          'Ошибка выполнения кода',
        executionTimeMs: 0,
      };
    }
  }

  private async runJavaScript(
    code: string,
    workDir: string,
  ): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'main.js');

    const timedCode = `
const start = performance.now();
${code}
const executionTimeMs = performance.now() - start;
console.log('__EXECUTION_TIME_MS__:' + executionTimeMs.toFixed(3));
`.trim();

    fs.writeFileSync(filePath, timedCode);

    try {
      const { stdout, stderr } = await execAsync(`node "${filePath}"`, {
        cwd: workDir,
        timeout: 10000,
      });
      const output = stdout.trim();
      const cleanOutput = output.replace(/__EXECUTION_TIME_MS__:\d+\.\d+\n?/, '').trim();
      return { output: cleanOutput, error: stderr.trim() || undefined };
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  private async runPython(
    code: string,
    workDir: string,
  ): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'main.py');

    const timedCode = `
import time
import sys

start = time.perf_counter()
${code}
execution_time_ms = (time.perf_counter() - start) * 1000
print('__EXECUTION_TIME_MS__:' + str(execution_time_ms))
`.trim();

    fs.writeFileSync(filePath, timedCode);

    let pythonCmd = 'python3';

    try {
      await execAsync('which python3', { timeout: 5000 });
      pythonCmd = 'python3';
    } catch {
      try {
        await execAsync('which python', { timeout: 5000 });
        pythonCmd = 'python';
      } catch {
        return {
          output: '',
          error: 'Python not found. Please install Python 3.',
        };
      }
    }

    console.log(`Using Python command: ${pythonCmd}`);

    try {
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${filePath}"`, {
        cwd: workDir,
        timeout: 10000,
      });
      const output = stdout.trim();
      const cleanOutput = output.replace(/__EXECUTION_TIME_MS__:\d+\.\d+\n?/, '').trim();
      return { output: cleanOutput, error: stderr.trim() || undefined };
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  private async runJava(
    code: string,
    workDir: string,
  ): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'Main.java');

    const mainMatch = code.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\}/);
    const hasMain = mainMatch !== null;

    let timedCode = code;
    if (hasMain) {
      timedCode = code.replace(
        /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/,
        `public static void main(String[] args) {
    long startTime = System.nanoTime();`
      );
      timedCode = timedCode.replace(
        /(\s*\}\s*)$/,
        `
    long executionTimeMs = (System.nanoTime() - startTime) / 1_000_000;
    System.out.println("__EXECUTION_TIME_MS__:" + executionTimeMs);
}`
      );
    }

    fs.writeFileSync(filePath, timedCode);

    try {
      const { stderr: compileError } = await execAsync(`javac "${filePath}"`, {
        cwd: workDir,
        timeout: 10000,
      });

      if (compileError) {
        return { output: '', error: compileError };
      }

      const { stdout, stderr } = await execAsync(`java -cp "${workDir}" Main`, {
        cwd: workDir,
        timeout: 10000,
      });

      const output = stdout.trim();
      const cleanOutput = output.replace(/__EXECUTION_TIME_MS__:\d+\n?/, '').trim();

      return {
        output: cleanOutput,
        error: stderr.trim() || undefined,
      };
    } catch (error: any) {
      return {
        output: '',
        error:
          error?.stderr ||
          error?.stdout ||
          error?.message ||
          'Ошибка выполнения Java',
      };
    }
  }

  private async runCSharp(
    code: string,
    workDir: string,
  ): Promise<{ output: string; error?: string }> {
    const filePath = path.join(workDir, 'Program.cs');

    const hasMain =
      code.includes('static void Main') || code.includes('static int Main');
    const hasRunner =
      code.includes('class Runner') || code.includes('class Runner {');

    if (!hasMain && !hasRunner) {
      code =
        code.trim() +
        '\n\nclass EntryPoint {\n    static void Main(string[] args) { }\n}';
    }

    if (code.includes('static void Main') || code.includes('static int Main')) {
      code = code.replace(
        /static\s+(void|int)\s+Main\s*\([^)]*\)\s*\{/,
        `static $1 Main(string[] args) {
    var sw = System.Diagnostics.Stopwatch.StartNew();`
      );
      code = code.replace(
        /(\s*\}\s*)$/,
        `
    sw.Stop();
    Console.WriteLine("__EXECUTION_TIME_MS__:" + sw.ElapsedMilliseconds);
}`
      );
    }

    fs.writeFileSync(filePath, code);

    const csprojPath = path.join(workDir, 'app.csproj');
    const csprojContent = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net7.0</TargetFramework>
  </PropertyGroup>
</Project>`;

    fs.writeFileSync(csprojPath, csprojContent);

    console.log('C# code:', code);
    console.log('Work dir:', workDir);

    try {
      try {
        await execAsync('dotnet --version', { timeout: 5000 });
      } catch (e) {
        return {
          output: '',
          error: '.NET SDK not found. Please install .NET SDK 7.0',
        };
      }

      const buildResult = await execAsync(`dotnet build "${csprojPath}"`, {
        cwd: workDir,
        timeout: 30000,
      });

      console.log('C# build stdout:', buildResult.stdout);
      console.log('C# build stderr:', buildResult.stderr);

      if (buildResult.stderr && buildResult.stderr.includes('error')) {
        return {
          output: '',
          error: buildResult.stderr,
        };
      }

      const { stdout, stderr } = await execAsync(
        `dotnet run --project "${csprojPath}" --no-build`,
        {
          cwd: workDir,
          timeout: 30000,
        },
      );

      console.log('C# stdout:', stdout);
      console.log('C# stderr:', stderr);

      const output = stdout.trim();
      const cleanOutput = output.replace(/__EXECUTION_TIME_MS__:\d+\n?/, '').trim();

      return {
        output: cleanOutput,
        error: stderr.trim() || undefined,
      };
    } catch (error: any) {
      console.error('C# execution error:', error);
      return {
        output: '',
        error:
          error?.stderr ||
          error?.stdout ||
          error?.message ||
          'Ошибка выполнения C#',
      };
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        fs.rmSync(workDir, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 100,
        });
      } catch (cleanupError) {
        console.warn('Cleanup warning (non-critical):', cleanupError);
      }
    }
  }

  async getHealth() {
    const languages = [
      'javascript',
      'python',
      'java',
      'csharp',
    ] as SupportedLanguage[];
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
      tempDir: TEMP_DIR,
    };
  }

  private async checkLanguage(language: SupportedLanguage): Promise<void> {
    const commands = {
      javascript: 'node --version',
      python: 'which python3 || which python',
      java: 'javac -version',
      csharp: 'dotnet --version',
    };

    await execAsync(commands[language], { timeout: 5000 });
  }
}
