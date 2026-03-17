import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  CodeTaskOrmEntity,
  TestCaseArgument,
  ArgumentSchema,
} from '../../infra/typeorm/code-task.orm-entity';
import { StudentLevelOrmEntity } from '../../infra/typeorm/student-level.orm-entity';
import { SolvedTaskOrmEntity } from '../../infra/typeorm/solved-task.orm-entity';
import { CreateCodeTaskDto } from '../dtos/create-code-task.dto';
import { UpdateCodeTaskDto } from '../dtos/update-code-task.dto';
import { CodeExecutionService } from '@modules/code/application/services/code-execution.service';
import type { SupportedLanguage } from '@modules/code/application/dtos/execute-code.dto';

@Injectable()
export class CodingTasksService {
  constructor(
    @InjectRepository(CodeTaskOrmEntity)
    private readonly codeTaskRepo: Repository<CodeTaskOrmEntity>,
    @InjectRepository(StudentLevelOrmEntity)
    private readonly studentLevelRepo: Repository<StudentLevelOrmEntity>,
    @InjectRepository(SolvedTaskOrmEntity)
    private readonly solvedTaskRepo: Repository<SolvedTaskOrmEntity>,
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  async createTask(
    dto: CreateCodeTaskDto,
    adminId: string,
    authorName: string,
  ): Promise<CodeTaskOrmEntity> {
    const task = this.codeTaskRepo.create({
      id: uuidv4(),
      ...dto,
      constraints: dto.constraints ?? [],
      adminId,
      authorName,
    });
    return this.codeTaskRepo.save(task);
  }

  async updateTask(
    id: string,
    dto: UpdateCodeTaskDto,
    adminId: string,
  ): Promise<CodeTaskOrmEntity> {
    const task = await this.codeTaskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.adminId !== adminId)
      throw new ForbiddenException('You can only edit your own tasks');

    Object.assign(task, dto);
    return this.codeTaskRepo.save(task);
  }

  async deleteTask(id: string, adminId: string): Promise<{ success: boolean }> {
    const task = await this.codeTaskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.adminId !== adminId)
      throw new ForbiddenException('You can only delete your own tasks');

    await this.codeTaskRepo.remove(task);
    return { success: true };
  }

  async getAllTasks(): Promise<CodeTaskOrmEntity[]> {
    return this.codeTaskRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getTaskById(id: string): Promise<CodeTaskOrmEntity> {
    const task = await this.codeTaskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async getTasksByDifficulty(difficulty: string): Promise<CodeTaskOrmEntity[]> {
    return this.codeTaskRepo.find({
      where: { difficulty },
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentLevel(clientId: string): Promise<StudentLevelOrmEntity> {
    let level = await this.studentLevelRepo.findOne({
      where: { clientId },
      relations: ['solvedTasks'],
    });

    if (!level) {
      level = this.studentLevelRepo.create({
        id: uuidv4(),
        clientId,
        level: 1,
        experience: 0,
      });
      level = await this.studentLevelRepo.save(level);
      level.solvedTasks = [];
    }

    return level;
  }

  async submitSolution(
    clientId: string,
    taskId: string,
    code: string,
    language: string,
  ): Promise<{
    allPassed: boolean;
    results: Array<{
      index: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }>;
    experienceGained: number;
    newLevel: number;
    newExperience: number;
    constraintsPassed: boolean;
    constraintErrors: string[];
  }> {
    const task = await this.getTaskById(taskId);

    if (!task.languages.includes(language)) {
      throw new BadRequestException(
        `Language "${language}" is not supported for this task. Supported: ${task.languages.join(', ')}`,
      );
    }

    const langTestCases =
      task.testCasesByLanguage?.[language] || task.testCases || [];
    if (!langTestCases || langTestCases.length === 0) {
      throw new BadRequestException('Task has no test cases');
    }

    // Проверка ограничений
    const constraintErrors: string[] = [];
    if (task.constraints && task.constraints.length > 0) {
      for (const constraint of task.constraints) {
        switch (constraint.type) {
          case 'maxLines': {
            const maxLines = constraint.value as number;
            const codeLines = code.split('\n').filter(line => line.trim().length > 0).length;
            if (codeLines > maxLines) {
              constraintErrors.push(`Превышено максимальное количество строк: ${codeLines} > ${maxLines}`);
            }
            break;
          }
          case 'forbiddenTokens': {
            const tokens = constraint.value as string[];
            for (const token of tokens) {
              const tokenRegex = new RegExp(`\\b${token}\\b`, 'g');
              if (tokenRegex.test(code)) {
                constraintErrors.push(`Использование запрещенного токена: "${token}"`);
              }
            }
            break;
          }
          case 'noComments': {
            if (constraint.value === true) {
              const hasComments = language === 'python'
                ? /#.*/.test(code)
                : /\/\/.*|\/\*[\s\S]*?\*\//.test(code);
              if (hasComments) {
                constraintErrors.push('Использование комментариев запрещено');
              }
            }
            break;
          }
          case 'noConsoleLog': {
            if (constraint.value === true) {
              let hasConsoleOutput = false;
              if (language === 'javascript') {
                hasConsoleOutput = /\bconsole\.(log|error|warn|info)\s*\(/.test(code);
              } else if (language === 'python') {
                hasConsoleOutput = /\bprint\s*\(/.test(code);
              } else if (language === 'java') {
                hasConsoleOutput = /\bSystem\.out\.(print|println)\s*\(/.test(code);
              } else if (language === 'csharp') {
                hasConsoleOutput = /\bConsole\.(WriteLine|Write)\s*\(/.test(code);
              }
              if (hasConsoleOutput) {
                if (language === 'javascript') {
                  constraintErrors.push('Использование console.log запрещено');
                } else if (language === 'python') {
                  constraintErrors.push('Использование print запрещено');
                } else {
                  constraintErrors.push('Использование вывода в консоль запрещено');
                }
              }
            }
            break;
          }
          case 'requiredKeywords': {
            const keywords = constraint.value as string[];
            for (const keyword of keywords) {
              if (!code.toLowerCase().includes(keyword.toLowerCase())) {
                constraintErrors.push(`Отсутствует обязательное ключевое слово: "${keyword}"`);
              }
            }
            break;
          }
        }
      }
    }

    const constraintsPassed = constraintErrors.length === 0;

    const results: Array<{
      index: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }> = [];

    for (let i = 0; i < langTestCases.length; i++) {
      const tc = langTestCases[i];
      const args = this.parseTestArgs(tc.input, tc.args, language);
      const testCode = this.buildTestCode(code, tc.input, language, i, args, task.argumentScheme);

      const execResult = await this.codeExecutionService.executeCode(
        language as SupportedLanguage,
        testCode,
      );

      const actual = this.parseResult(execResult.output, i);
      const passed = this.compareOutputs(
        actual.trim(),
        tc.expectedOutput.trim(),
      );

      results.push({
        index: i,
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual,
      });
    }

    const allTestsPassed = results.every((r) => r.passed);
    const allPassed = allTestsPassed && constraintsPassed;
    let experienceGained = 0;
    const studentLevel = await this.getStudentLevel(clientId);

    if (allPassed) {
      const alreadySolved = await this.solvedTaskRepo.findOne({
        where: { studentLevelId: studentLevel.id, codeTaskId: taskId },
      });

      if (!alreadySolved) {
        experienceGained = task.experienceReward;
        studentLevel.experience += experienceGained;

        const requiredExp = this.getRequiredExperience(studentLevel.level);
        while (studentLevel.experience >= requiredExp) {
          studentLevel.experience -= this.getRequiredExperience(
            studentLevel.level,
          );
          studentLevel.level += 1;
        }

        await this.studentLevelRepo.save(studentLevel);

        const solved = this.solvedTaskRepo.create({
          studentLevelId: studentLevel.id,
          codeTaskId: taskId,
        });
        await this.solvedTaskRepo.save(solved);
      }
    }

    return {
      allPassed,
      results,
      experienceGained,
      newLevel: studentLevel.level,
      newExperience: studentLevel.experience,
      constraintsPassed,
      constraintErrors,
    };
  }

  /**
   * Level N requires 10^(N-1) experience.
   * Level 2 = 10, Level 3 = 100, Level 4 = 1000, etc.
   */
  private getRequiredExperience(level: number): number {
    return Math.pow(10, level - 1);
  }

  private buildTestCode(
    userCode: string,
    input: string,
    language: string,
    index: number,
    args?: TestCaseArgument[],
    argumentScheme?: ArgumentSchema[],
  ): string {
    const fnName = this.extractFunctionName(userCode, language);
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    const argsStr = args ? this.formatArgsForCode(args, language, argumentScheme) : input;

    switch (language) {
      case 'javascript':
        return `${userCode}\nconst __res__ = ${fnName}(${argsStr});\nconsole.log("${marker}");\nconsole.log(JSON.stringify(__res__));\nconsole.log("${markerEnd}");`;

      case 'python':
        return `import json\n${userCode}\n__res__ = ${fnName}(${argsStr})\nprint("${marker}")\nprint(json.dumps(__res__))\nprint("${markerEnd}")`;

      case 'java':
        return this.buildJavaTestCode(userCode, fnName, args, input, index, argumentScheme);

      case 'csharp':
        return this.buildCSharpTestCode(userCode, fnName, args, input, index, argumentScheme);

      case 'golang':
        return this.buildGoTestCode(userCode, fnName, args, input, index, argumentScheme);

      default:
        return `${userCode}\nconst __res__ = ${fnName}(${input});\nconsole.log("${marker}");\nconsole.log(JSON.stringify(__res__));\nconsole.log("${markerEnd}");`;
    }
  }

  private buildJavaTestCode(
    userCode: string,
    fnName: string,
    args: TestCaseArgument[] | undefined,
    input: string,
    index: number,
    argumentScheme?: ArgumentSchema[],
  ): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    const argsStr = args ? this.formatArgsForCode(args, 'java', argumentScheme) : input;

    // Проверяем, есть ли уже класс в коде
    const hasClass = userCode.includes('public class');
    const hasMain = userCode.includes('public static void main');

    if (hasMain) {
      // Если есть main метод, заменяем его на наш тестовый
      return userCode.replace(
        /public\s+static\s+void\s+main\s*\(String\[\]\s*args\)\s*\{[\s\S]*?\}/,
        `public static void main(String[] args) {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));

            try {
                Object result = ${fnName}(${argsStr});
                System.setOut(originalOut);
                
                String logs = baos.toString();
                if (!logs.isEmpty()) {
                    System.out.println("===LOGS_START===");
                    System.out.print(logs);
                    System.out.println("===LOGS_END===");
                }
                
                System.out.println("${marker}");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print("\\"" + result + "\\"");
                } else if (result.getClass().isArray()) {
                    if (result instanceof int[]) {
                        System.out.print(java.util.Arrays.toString((int[])result));
                    } else if (result instanceof Integer[]) {
                        System.out.print(java.util.Arrays.toString((Integer[])result));
                    } else if (result instanceof String[]) {
                        System.out.print(java.util.Arrays.toString((String[])result));
                    } else {
                        System.out.print(java.util.Arrays.toString((Object[])result));
                    }
                } else {
                    System.out.print(result);
                }
                System.out.println();
                System.out.println("${markerEnd}");
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("${marker}");
                System.out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
                System.out.println("${markerEnd}");
            }
        }`,
      );
    } else if (hasClass) {
      // Если есть класс, добавляем main метод в конец
      const codeWithoutLastBrace = userCode.trim().replace(/\}\s*$/, '');
      return `${codeWithoutLastBrace}

    public static void main(String[] args) {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        java.io.PrintStream originalOut = System.out;
        System.setOut(new java.io.PrintStream(baos));

        try {
            Object result = ${fnName}(${argsStr});
            System.setOut(originalOut);
            
            String logs = baos.toString();
            if (!logs.isEmpty()) {
                System.out.println("===LOGS_START===");
                System.out.print(logs);
                System.out.println("===LOGS_END===");
            }
            
            System.out.println("${marker}");
            if (result == null) {
                System.out.print("null");
            } else if (result instanceof String) {
                System.out.print("\\"" + result + "\\"");
            } else if (result.getClass().isArray()) {
                if (result instanceof int[]) {
                    System.out.print(java.util.Arrays.toString((int[])result));
                } else if (result instanceof Integer[]) {
                    System.out.print(java.util.Arrays.toString((Integer[])result));
                } else if (result instanceof String[]) {
                    System.out.print(java.util.Arrays.toString((String[])result));
                } else {
                    System.out.print(java.util.Arrays.toString((Object[])result));
                }
            } else {
                System.out.print(result);
            }
            System.out.println();
            System.out.println("${markerEnd}");
        } catch (Exception e) {
            System.setOut(originalOut);
            System.out.println("${marker}");
            System.out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
            System.out.println("${markerEnd}");
        }
    }
}`;
    } else {
      // Если нет класса, оборачиваем в класс
      return `public class Main {
${userCode}

    public static void main(String[] args) {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        java.io.PrintStream originalOut = System.out;
        System.setOut(new java.io.PrintStream(baos));

        try {
            Object result = ${fnName}(${argsStr});
            System.setOut(originalOut);
            
            String logs = baos.toString();
            if (!logs.isEmpty()) {
                System.out.println("===LOGS_START===");
                System.out.print(logs);
                System.out.println("===LOGS_END===");
            }
            
            System.out.println("${marker}");
            if (result == null) {
                System.out.print("null");
            } else if (result instanceof String) {
                System.out.print("\\"" + result + "\\"");
            } else if (result.getClass().isArray()) {
                if (result instanceof int[]) {
                    System.out.print(java.util.Arrays.toString((int[])result));
                } else if (result instanceof Integer[]) {
                    System.out.print(java.util.Arrays.toString((Integer[])result));
                } else if (result instanceof String[]) {
                    System.out.print(java.util.Arrays.toString((String[])result));
                } else {
                    System.out.print(java.util.Arrays.toString((Object[])result));
                }
            } else {
                System.out.print(result);
            }
            System.out.println();
            System.out.println("${markerEnd}");
        } catch (Exception e) {
            System.setOut(originalOut);
            System.out.println("${marker}");
            System.out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
            System.out.println("${markerEnd}");
        }
    }
}`;
    }
  }

  private buildCSharpTestCode(
    userCode: string,
    fnName: string,
    args: TestCaseArgument[] | undefined,
    input: string,
    index: number,
    argumentScheme?: ArgumentSchema[],
  ): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    const argsStr = args ? this.formatArgsForCode(args, 'csharp', argumentScheme) : input;

    // Проверяем, есть ли уже класс в коде
    const hasClass =
      userCode.includes('class Program') || userCode.includes('class Solution');
    const hasMain =
      userCode.includes('static void Main') ||
      userCode.includes('public static void Main');

    const usings = `using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
`;

    if (hasMain) {
      // Если есть Main метод, заменяем его на наш тестовый
      return (
        usings +
        userCode.replace(
          /(?:public\s+)?static\s+void\s+Main\s*\([^)]*\)\s*\{[\s\S]*?\}/,
          `static void Main() {
            var originalOut = Console.Out;
            var originalError = Console.Error;
            var outWriter = new StringWriter();
            var errorWriter = new StringWriter();
            Console.SetOut(outWriter);
            Console.SetError(errorWriter);

            try {
                var result = Program.${fnName}(${argsStr});
                
                Console.SetOut(originalOut);
                Console.SetError(originalError);
                
                var outLogs = outWriter.ToString();
                var errorLogs = errorWriter.ToString();
                
                if (!string.IsNullOrEmpty(outLogs) || !string.IsNullOrEmpty(errorLogs)) {
                    Console.WriteLine("===LOGS_START===");
                    if (!string.IsNullOrEmpty(outLogs)) {
                        Console.Write(outLogs);
                    }
                    if (!string.IsNullOrEmpty(errorLogs)) {
                        Console.Write("ERROR: " + errorLogs);
                    }
                    if (!outLogs.EndsWith("\\n") && !errorLogs.EndsWith("\\n")) {
                        Console.WriteLine();
                    }
                    Console.WriteLine("===LOGS_END===");
                }
                
                Console.WriteLine("${marker}");
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result));
                Console.WriteLine("${markerEnd}");
            } catch (Exception e) {
                Console.SetOut(originalOut);
                Console.SetError(originalError);
                Console.WriteLine("${marker}");
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new { error = e.Message }));
                Console.WriteLine("${markerEnd}");
            }
        }`,
        )
      );
    } else if (hasClass) {
      // Если есть класс, добавляем Main метод
      return (
        usings +
        userCode.replace(
          /\}\s*$/,
          `
    public static void Main() {
        var originalOut = Console.Out;
        var originalError = Console.Error;
        var outWriter = new StringWriter();
        var errorWriter = new StringWriter();
        Console.SetOut(outWriter);
        Console.SetError(errorWriter);

        try {
            var result = Program.${fnName}(${argsStr});
            
            Console.SetOut(originalOut);
            Console.SetError(originalError);
            
            var outLogs = outWriter.ToString();
            var errorLogs = errorWriter.ToString();
            
            if (!string.IsNullOrEmpty(outLogs) || !string.IsNullOrEmpty(errorLogs)) {
                Console.WriteLine("===LOGS_START===");
                if (!string.IsNullOrEmpty(outLogs)) {
                    Console.Write(outLogs);
                }
                if (!string.IsNullOrEmpty(errorLogs)) {
                    Console.Write("ERROR: " + errorLogs);
                }
                if (!outLogs.EndsWith("\\n") && !errorLogs.EndsWith("\\n")) {
                    Console.WriteLine();
                }
                Console.WriteLine("===LOGS_END===");
            }
            
            Console.WriteLine("${marker}");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result));
            Console.WriteLine("${markerEnd}");
        } catch (Exception e) {
            Console.SetOut(originalOut);
            Console.SetError(originalError);
            Console.WriteLine("${marker}");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new { error = e.Message }));
            Console.WriteLine("${markerEnd}");
        }
    }
}`,
        )
      );
    } else {
      // Если нет класса, создаём класс Program
      return (
        usings +
        `${userCode}

public class Program {
    public static void Main() {
        var originalOut = Console.Out;
        var originalError = Console.Error;
        var outWriter = new StringWriter();
        var errorWriter = new StringWriter();
        Console.SetOut(outWriter);
        Console.SetError(errorWriter);

        try {
            var result = Program.${fnName}(${argsStr});
            
            Console.SetOut(originalOut);
            Console.SetError(originalError);
            
            var outLogs = outWriter.ToString();
            var errorLogs = errorWriter.ToString();
            
            if (!string.IsNullOrEmpty(outLogs) || !string.IsNullOrEmpty(errorLogs)) {
                Console.WriteLine("===LOGS_START===");
                if (!string.IsNullOrEmpty(outLogs)) {
                    Console.Write(outLogs);
                }
                if (!string.IsNullOrEmpty(errorLogs)) {
                    Console.Write("ERROR: " + errorLogs);
                }
                if (!outLogs.EndsWith("\\n") && !errorLogs.EndsWith("\\n")) {
                    Console.WriteLine();
                }
                Console.WriteLine("===LOGS_END===");
            }
            
            Console.WriteLine("${marker}");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result));
            Console.WriteLine("${markerEnd}");
        } catch (Exception e) {
            Console.SetOut(originalOut);
            Console.SetError(originalError);
            Console.WriteLine("${marker}");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new { error = e.Message }));
            Console.WriteLine("${markerEnd}");
        }
    }
}`
      );
    }
  }

  private buildGoTestCode(
    userCode: string,
    fnName: string,
    args: TestCaseArgument[] | undefined,
    input: string,
    index: number,
    argumentScheme?: ArgumentSchema[],
  ): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    const argsStr = args ? this.formatArgsForCode(args, 'golang', argumentScheme) : input;

    return `package main
import (
  "fmt"
  "encoding/json"
)
${userCode
  .replace(/^package main\s*/, '')
  .replace(/import\s*\([\s\S]*?\)/, '')
  .replace(/import\s+"[^"]*"/, '')}
func main() {
  result := ${fnName}(${argsStr})
  fmt.Println("${marker}")
  bytes, _ := json.Marshal(result)
  fmt.Println(string(bytes))
  fmt.Println("${markerEnd}")
}`;
  }

  private extractFunctionName(code: string, language: string): string {
    let match: RegExpMatchArray | null;
    switch (language) {
      case 'javascript':
        match =
          code.match(/function\s+(\w+)\s*\(/) ||
          code.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:\(|function)/) ||
          code.match(/(\w+)\s*=\s*\([^)]*\)\s*=>/) ||
          code.match(/export\s+(?:const|let|var|function)\s+(\w+)/);
        break;
      case 'python':
        match = code.match(/def\s+(\w+)\s*\(/);
        break;
      case 'java':
        match = code.match(/(?:public|private|static)\s+\S+\s+(\w+)\s*\(/);
        break;
      case 'csharp':
        match = code.match(/(?:public|private|static)\s+\S+\s+(\w+)\s*\(/);
        break;
      case 'golang':
        match = code.match(/func\s+(\w+)\s*\(/);
        break;
      default:
        match = code.match(/function\s+(\w+)\s*\(/);
    }
    return match?.[1] ?? 'solution';
  }

  private parseResult(output: string, index: number): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;
    const startIdx = output.indexOf(marker);
    const endIdx = output.indexOf(markerEnd);

    if (startIdx === -1 || endIdx === -1) {
      // Если не нашли маркеры с индексом, пробуем без индекса
      const startIdx2 = output.indexOf('===RESULT_START===');
      const endIdx2 = output.indexOf('===RESULT_END===');
      if (startIdx2 === -1 || endIdx2 === -1) return output.trim();
      return output
        .substring(startIdx2 + '===RESULT_START==='.length, endIdx2)
        .trim();
    }

    return output.substring(startIdx + marker.length, endIdx).trim();
  }

  private compareOutputs(actual: string, expected: string): boolean {
    if (actual === expected) return true;

    try {
      const a = JSON.parse(actual);
      const e = JSON.parse(expected);
      return JSON.stringify(a) === JSON.stringify(e);
    } catch {
      return actual === expected;
    }
  }

  private parseTestArgs(
    input: string,
    args: TestCaseArgument[] | undefined,
    language: string,
  ): TestCaseArgument[] {
    if (args && args.length > 0) {
      return args;
    }
    if (!input.trim()) return [];
    return this.parseArguments(input);
  }

  private parseArguments(input: string): TestCaseArgument[] {
    if (!input.trim()) return [];

    try {
      if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.map((val, idx) => ({
            index: idx,
            value: typeof val === 'string' ? val : JSON.stringify(val),
          }));
        }
      }
    } catch {}

    const parsedArgs: TestCaseArgument[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let braceCount = 0;
    let bracketCount = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (
        (char === '"' || char === "'" || char === '`') &&
        input[i - 1] !== '\\'
      ) {
        if (!inString) {
          inString = true;
          stringChar = char;
          current += char;
        } else if (char === stringChar) {
          inString = false;
          current += char;
        } else {
          current += char;
        }
      } else if (char === '{' && !inString) {
        braceCount++;
        current += char;
      } else if (char === '}' && !inString) {
        braceCount--;
        current += char;
      } else if (char === '[' && !inString) {
        bracketCount++;
        current += char;
      } else if (char === ']' && !inString) {
        bracketCount--;
        current += char;
      } else if (
        char === ',' &&
        !inString &&
        braceCount === 0 &&
        bracketCount === 0
      ) {
        const trimmed = current.trim();
        if (trimmed) {
          parsedArgs.push({
            index: parsedArgs.length,
            value: trimmed,
          });
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      parsedArgs.push({
        index: parsedArgs.length,
        value: current.trim(),
      });
    }

    return parsedArgs;
  }

  private parseValue(value: string): any {
    if (value === '') return '';

    try {
      return JSON.parse(value);
    } catch {}

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('`') && value.endsWith('`'))
    ) {
      return value.slice(1, -1);
    }

    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  }

  private formatArgsForCode(
    args: TestCaseArgument[],
    language: string,
    argumentScheme?: ArgumentSchema[],
  ): string {
    // Для Java и C# используем специальное форматирование
    if (language === 'java' || language === 'csharp') {
      return this.formatArgsForTypedLanguages(args, language, argumentScheme);
    }

    return args
      .map((arg) => {
        const parsedValue = this.parseValue(arg.value);
        if (typeof parsedValue === 'string') {
          return `"${parsedValue}"`;
        }
        if (typeof parsedValue === 'object') {
          return JSON.stringify(parsedValue);
        }
        return String(parsedValue);
      })
      .join(', ');
  }

  private formatArgsForTypedLanguages(
    args: TestCaseArgument[],
    language: string,
    argumentScheme?: ArgumentSchema[],
  ): string {
    return args
      .map((arg, idx) => {
        const scheme = argumentScheme?.[idx];

        const cleanValue = (val: string) => {
          if ((val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))) {
            return val.slice(1, -1);
          }
          return val;
        };

        const cleanVal = cleanValue(arg.value);

        // Если есть objectValues и схема с типом object
        if (arg.objectValues && Object.keys(arg.objectValues).length > 0 && scheme?.type === 'object') {
          const fields = Object.values(arg.objectValues).join(', ');

          // Используем имя класса из схемы или генерируем
          const className = scheme.className || scheme.name.charAt(0).toUpperCase() + scheme.name.slice(1);

          return `new ${className}(${fields})`;
        }

        // Строки в кавычках
        if (arg.value && arg.value.startsWith('"')) {
          return cleanVal;
        }

        // Булевы
        if (cleanVal.toLowerCase() === 'true') return 'true';
        if (cleanVal.toLowerCase() === 'false') return 'false';

        // Числа
        if (/^-?\d+(\.\d+)?$/.test(cleanVal)) {
          return cleanVal;
        }

        // Строки без кавычек - добавляем кавычки
        if (cleanVal && !cleanVal.startsWith('[') && !cleanVal.startsWith('{')) {
          return `"${cleanVal}"`;
        }

        return cleanVal;
      })
      .join(', ');
  }
}
