import { BadRequestException, Injectable } from '@nestjs/common';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type { SupportedLanguage } from '../dtos/execute-code.dto';

const execAsync = promisify(exec);

const TEMP_DIR = process.env.CODE_EXEC_TEMP_DIR
  ? path.resolve(process.env.CODE_EXEC_TEMP_DIR)
  : path.join(process.cwd(), 'tmp', 'code_execution');

type ExecutionResult = {
  output: string;
  error?: string;
};

const DOCKER_IMAGES: Record<string, string> = {
  javascript: 'code-runner-javascript',
  typescript: 'code-runner-typescript',
  java: 'code-runner-java',
  csharp: 'code-runner-csharp',
  rust: 'code-runner-rust',
  ruby: 'code-runner-ruby',
  php: 'code-runner-php',
  golang: 'code-runner-golang',
};

@Injectable()
export class CodeExecutionService {
  private dockerAvailable = false;

  constructor() {
    this.ensureTempDir();
    this.checkDocker();
  }

  private checkDocker(): void {
    try {
      execSync('docker info --format "{{.ServerVersion}}"', {
        timeout: 5000,
        stdio: 'pipe',
      });
      this.dockerAvailable = true;
    } catch {
      this.dockerAvailable = false;
    }
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

  async executeCode(
    language: SupportedLanguage,
    code: string,
  ): Promise<ExecutionResult> {
    const timestamp = Date.now();
    const uniqueId = `${language}_${timestamp}_${Math.random().toString(36).substring(7)}`;
    const workDir = path.join(TEMP_DIR, uniqueId);

    try {
      fs.mkdirSync(workDir, { recursive: true });

      switch (language) {
        case 'javascript':
          return await this.runJavaScript(code, workDir);
        case 'typescript':
          return await this.runTypeScript(code, workDir);
        case 'python':
          return await this.runPython(code, workDir);
        case 'php':
          return await this.runPhp(code, workDir);
        case 'ruby':
          return await this.runRuby(code, workDir);
        case 'rust':
          return await this.runRust(code, workDir);
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
      this.cleanupWorkDir(workDir);

      return {
        output: '',
        error:
          error?.stderr ||
          error?.stdout ||
          error?.message ||
          'Ошибка выполнения кода',
      };
    }
  }

  private cleanupWorkDir(workDir: string): void {
    try {
      fs.rmSync(workDir, { recursive: true, force: true, maxRetries: 5 });
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError);
    }
  }

  private async executeWithCleanup(
    workDir: string,
    action: () => Promise<ExecutionResult>,
  ): Promise<ExecutionResult> {
    try {
      return await action();
    } finally {
      this.cleanupWorkDir(workDir);
    }
  }

  private async findExecutable(candidates: string[]): Promise<string | null> {
    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      if (path.isAbsolute(candidate)) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
        continue;
      }

      try {
        const { stdout } = await execAsync(`command -v ${candidate}`, {
          timeout: 5000,
        });
        const resolved = stdout.trim().split(/\r?\n/).pop();
        if (resolved) {
          return resolved;
        }
      } catch {
      }
    }

    return null;
  }

  private async executeCommand(
    command: string,
    cwd: string,
    timeout = 10000,
  ): Promise<ExecutionResult> {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
    });

    return {
      output: stdout.trim(),
      error: stderr.trim() || undefined,
    };
  }

  private getLocalNodeBin(binaryName: string): string {
    return path.join(process.cwd(), 'node_modules', '.bin', binaryName);
  }

  private getDockerRunBase(imageName: string, workDir: string): string {
    return [
      'docker run --rm',
      '--network none',
      '--memory 256m',
      '--cpus 1',
      '--read-only',
      '--tmpfs /tmp:rw,noexec,nosuid,size=256m',
      '--security-opt no-new-privileges:true',
      '--cap-drop ALL',
      '--pids-limit 100',
      `-v "${workDir}:/tmp/code"`,
      imageName,
    ].join(' ');
  }

  private async runInDocker(
    imageName: string,
    workDir: string,
    command: string,
    timeout = 15000,
  ): Promise<ExecutionResult> {
    const dockerCmd = `${this.getDockerRunBase(imageName, workDir)} ${command}`;
    return this.executeCommand(dockerCmd, workDir, timeout);
  }

  private async runInDockerShell(
    imageName: string,
    workDir: string,
    shellCommand: string,
    timeout = 30000,
  ): Promise<ExecutionResult> {
    const escaped = shellCommand.replace(/"/g, '\\"');
    const dockerCmd = `${this.getDockerRunBase(imageName, workDir)} sh -c "${escaped}"`;
    return this.executeCommand(dockerCmd, workDir, timeout);
  }

  private async safeRunJavaScript(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'main.js');
    fs.writeFileSync(filePath, code);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.javascript,
          workDir,
          'node /tmp/code/main.js',
          10000,
        );
      }

      return this.executeCommand(`node "${filePath}"`, workDir, 10000);
    });
  }

  private async safeRunTypeScript(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'main.ts');
    fs.writeFileSync(filePath, code);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.typescript,
          workDir,
          'npx ts-node /tmp/code/main.ts',
          15000,
        );
      }

      const tsNodeCommand = await this.findExecutable([
        this.getLocalNodeBin('ts-node'),
        'ts-node',
      ]);

      if (tsNodeCommand) {
        return this.executeCommand(
          `"${tsNodeCommand}" "${filePath}"`,
          workDir,
          15000,
        );
      }

      const tscCommand = await this.findExecutable([
        this.getLocalNodeBin('tsc'),
        'tsc',
      ]);

      if (!tscCommand) {
        return {
          output: '',
          error:
            'TypeScript runtime not found. Install ts-node or TypeScript compiler (tsc).',
        };
      }

      await execAsync(
        `"${tscCommand}" "${filePath}" --target ES2020 --module commonjs --skipLibCheck --outDir "${workDir}"`,
        {
          cwd: workDir,
          timeout: 30000,
        },
      );

      const compiledFilePath = path.join(workDir, 'main.js');
      return this.executeCommand(
        `node "${compiledFilePath}"`,
        workDir,
        15000,
      );
    });
  }

  private async safeRunPython(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'main.py');
    fs.writeFileSync(filePath, code);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.javascript,
          workDir,
          'python3 /tmp/code/main.py',
          10000,
        );
      }

      const pythonCommand = await this.findExecutable(['python3', 'python']);

      if (!pythonCommand) {
        return {
          output: '',
          error: 'Python not found. Please install Python 3.',
        };
      }

      return this.executeCommand(
        `"${pythonCommand}" "${filePath}"`,
        workDir,
        10000,
      );
    });
  }

  private async safeRunPhp(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const normalizedCode = code.trimStart().startsWith('<?php')
      ? code
      : `<?php\n\n${code}`;
    const filePath = path.join(workDir, 'main.php');
    fs.writeFileSync(filePath, normalizedCode);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.php,
          workDir,
          'php /tmp/code/main.php',
          10000,
        );
      }

      const phpCommand = await this.findExecutable(['php']);

      if (!phpCommand) {
        return {
          output: '',
          error: 'PHP CLI not found. Please install php-cli.',
        };
      }

      return this.executeCommand(
        `"${phpCommand}" "${filePath}"`,
        workDir,
        10000,
      );
    });
  }

  private async safeRunRuby(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'main.rb');
    fs.writeFileSync(filePath, code);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.ruby,
          workDir,
          'ruby /tmp/code/main.rb',
          10000,
        );
      }

      const rubyCommand = await this.findExecutable(['ruby']);

      if (!rubyCommand) {
        return {
          output: '',
          error: 'Ruby not found. Please install Ruby.',
        };
      }

      return this.executeCommand(
        `"${rubyCommand}" "${filePath}"`,
        workDir,
        10000,
      );
    });
  }

  private async safeRunRust(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const normalizedCode = code.includes('fn main(')
      ? code
      : `${code}\n\nfn main() {}\n`;
    const filePath = path.join(workDir, 'main.rs');
    fs.writeFileSync(filePath, normalizedCode);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDockerShell(
          DOCKER_IMAGES.rust,
          workDir,
          'rustc /tmp/code/main.rs --edition 2021 -O -o /tmp/code/main_exec && /tmp/code/main_exec',
          30000,
        );
      }

      const rustcCommand = await this.findExecutable(['rustc']);

      if (!rustcCommand) {
        return {
          output: '',
          error: 'Rust compiler not found. Please install rustc/cargo.',
        };
      }

      const outputPath = path.join(workDir, 'main_exec');

      await execAsync(
        `"${rustcCommand}" "${filePath}" --edition 2021 -O -o "${outputPath}"`,
        {
          cwd: workDir,
          timeout: 30000,
        },
      );

      return this.executeCommand(`"${outputPath}"`, workDir, 10000);
    });
  }

  private async safeRunGolang(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    let normalizedCode = code;

    if (!normalizedCode.includes('package main')) {
      normalizedCode = `package main\n\n${normalizedCode}`;
    }

    if (!normalizedCode.includes('func main()')) {
      normalizedCode = `${normalizedCode}\n\nfunc main() {\n}\n`;
    }

    const filePath = path.join(workDir, 'main.go');
    fs.writeFileSync(filePath, normalizedCode);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDocker(
          DOCKER_IMAGES.golang,
          workDir,
          'go run /tmp/code/main.go',
          15000,
        );
      }

      const goCommand = await this.findExecutable(['go']);

      if (!goCommand) {
        return {
          output: '',
          error: 'Go runtime not found. Please install Go.',
        };
      }

      return this.executeCommand(
        `"${goCommand}" run "${filePath}"`,
        workDir,
        15000,
      );
    });
  }

  private async safeRunJava(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'Main.java');
    fs.writeFileSync(filePath, code);

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDockerShell(
          DOCKER_IMAGES.java,
          workDir,
          'javac /tmp/code/Main.java && java -cp /tmp/code Main',
          15000,
        );
      }

      const javacCommand = await this.findExecutable(['javac']);
      const javaCommand = await this.findExecutable(['java']);

      if (!javacCommand || !javaCommand) {
        return {
          output: '',
          error: 'Java JDK not found. Please install javac and java.',
        };
      }

      const { stderr: compileError } = await execAsync(
        `"${javacCommand}" "${filePath}"`,
        {
          cwd: workDir,
          timeout: 10000,
        },
      );

      if (compileError) {
        return { output: '', error: compileError };
      }

      return this.executeCommand(
        `"${javaCommand}" -cp "${workDir}" Main`,
        workDir,
        10000,
      );
    });
  }

  private async safeRunCSharp(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    const filePath = path.join(workDir, 'Program.cs');
    const hasMain =
      code.includes('static void Main') || code.includes('static int Main');
    const normalizedCode =
      !hasMain
        ? `${code.trim()}\n\nclass EntryPoint {\n    static void Main(string[] args) { }\n}`
        : code;

    fs.writeFileSync(filePath, normalizedCode);

    const csprojPath = path.join(workDir, 'app.csproj');
    fs.writeFileSync(
      csprojPath,
      `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`,
    );

    return this.executeWithCleanup(workDir, async () => {
      if (this.dockerAvailable) {
        return this.runInDockerShell(
          DOCKER_IMAGES.csharp,
          workDir,
          'dotnet build /tmp/code/app.csproj -o /tmp/build && dotnet exec /tmp/build/app.dll',
          60000,
        );
      }

      const dotnetCommand = await this.findExecutable(['dotnet']);

      if (!dotnetCommand) {
        return {
          output: '',
          error: '.NET SDK not found. Please install .NET SDK 8.0 or newer.',
        };
      }

      const buildResult = await execAsync(
        `"${dotnetCommand}" build "${csprojPath}"`,
        {
          cwd: workDir,
          timeout: 30000,
        },
      );

      if (buildResult.stderr && buildResult.stderr.includes('error')) {
        return {
          output: '',
          error: buildResult.stderr,
        };
      }

      return this.executeCommand(
        `"${dotnetCommand}" run --project "${csprojPath}" --no-build`,
        workDir,
        30000,
      );
    });
  }

  private async runJavaScript(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunJavaScript(code, workDir);
  }

  private async runTypeScript(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunTypeScript(code, workDir);
  }

  private async runPython(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunPython(code, workDir);
  }

  private async runPhp(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunPhp(code, workDir);
  }

  private async runRuby(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunRuby(code, workDir);
  }

  private async runRust(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunRust(code, workDir);
  }

  private async runGolang(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunGolang(code, workDir);
  }

  private async runJava(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunJava(code, workDir);
  }

  private async runCSharp(
    code: string,
    workDir: string,
  ): Promise<ExecutionResult> {
    return this.safeRunCSharp(code, workDir);
  }

  async getHealth() {
    const languages: SupportedLanguage[] = [
      'javascript',
      'typescript',
      'python',
      'php',
      'ruby',
      'rust',
      'golang',
      'java',
      'csharp',
    ];
    const status: Record<string, string> = {};

    for (const language of languages) {
      try {
        await this.checkLanguage(language);
        status[language] = 'Available';
      } catch (error: any) {
        status[language] = `Unavailable: ${error.message}`;
      }
    }

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      languages: status,
      dockerAvailable: this.dockerAvailable,
      tempDir: TEMP_DIR,
    };
  }

  private async checkLanguage(language: SupportedLanguage): Promise<void> {
    if (this.dockerAvailable && language !== 'typescript' && language !== 'python') {
      return;
    }

    switch (language) {
      case 'javascript': {
        await execAsync('node --version', { timeout: 5000 });
        return;
      }
      case 'typescript': {
        const tsRuntime = await this.findExecutable([
          this.getLocalNodeBin('ts-node'),
          this.getLocalNodeBin('tsc'),
          'ts-node',
          'tsc',
        ]);
        if (!tsRuntime) {
          throw new Error('ts-node/tsc not found');
        }
        return;
      }
      case 'python': {
        const pythonCommand = await this.findExecutable(['python3', 'python']);
        if (!pythonCommand) {
          throw new Error('python3/python not found');
        }
        return;
      }
      case 'php': {
        const phpCommand = await this.findExecutable(['php']);
        if (!phpCommand) {
          throw new Error('php not found');
        }
        return;
      }
      case 'ruby': {
        const rubyCommand = await this.findExecutable(['ruby']);
        if (!rubyCommand) {
          throw new Error('ruby not found');
        }
        return;
      }
      case 'rust': {
        const rustCommand = await this.findExecutable(['rustc']);
        if (!rustCommand) {
          throw new Error('rustc not found');
        }
        return;
      }
      case 'golang': {
        const goCommand = await this.findExecutable(['go']);
        if (!goCommand) {
          throw new Error('go not found');
        }
        return;
      }
      case 'java': {
        const javacCommand = await this.findExecutable(['javac']);
        if (!javacCommand) {
          throw new Error('javac not found');
        }
        return;
      }
      case 'csharp': {
        const dotnetCommand = await this.findExecutable(['dotnet']);
        if (!dotnetCommand) {
          throw new Error('dotnet not found');
        }
        return;
      }
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
}
