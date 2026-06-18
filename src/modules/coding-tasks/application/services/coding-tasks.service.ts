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
import { CodeExecutionWithTimeService } from '@modules/codeWithTime/application/services/code-execution-with-time.service';
import { CodeTaskSolutionOrmEntity } from '@modules/codeWithTime/infra/typeorm/code-task-solution.orm-entity';
import type { SupportedLanguage } from '@modules/code/application/dtos/execute-code.dto';
import type { SupportedLanguage as SupportedLanguageWithTime } from '@modules/codeWithTime/application/dtos/execute-code-with-time.dto';
import {
  compareOutputsWithType,
  getExpectedOutputFromTestCase,
  type ReturnSchema,
} from '../utils/typed-output-comparison';
import {
  JAVA_SERIALIZATION_HELPERS,
  JS_TYPED_SERIALIZATION_HELPERS,
  PYTHON_TYPED_SERIALIZATION_HELPERS,
} from '../utils/result-serialization';

@Injectable()
export class CodingTasksService {
  constructor(
    @InjectRepository(CodeTaskOrmEntity)
    private readonly codeTaskRepo: Repository<CodeTaskOrmEntity>,
    @InjectRepository(StudentLevelOrmEntity)
    private readonly studentLevelRepo: Repository<StudentLevelOrmEntity>,
    @InjectRepository(SolvedTaskOrmEntity)
    private readonly solvedTaskRepo: Repository<SolvedTaskOrmEntity>,
    @InjectRepository(CodeTaskSolutionOrmEntity)
    private readonly codeTaskSolutionRepo: Repository<CodeTaskSolutionOrmEntity>,
    private readonly codeExecutionService: CodeExecutionService,
    private readonly codeExecutionWithTimeService: CodeExecutionWithTimeService,
  ) {}

  private normalizeTags(tags?: string[] | null): string[] {
    return Array.from(
      new Set(
        (tags ?? [])
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    );
  }

  private normalizeFunctionName(functionName?: string | null): string | null {
    const normalizedFunctionName = functionName?.trim();

    return normalizedFunctionName ? normalizedFunctionName : null;
  }

  async createTask(
    dto: CreateCodeTaskDto,
    adminId: string,
    authorName: string,
  ): Promise<CodeTaskOrmEntity> {
    const task = this.codeTaskRepo.create({
      id: uuidv4(),
      ...dto,
      functionName: this.normalizeFunctionName(dto.functionName),
      tags: this.normalizeTags(dto.tags),
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

    const normalizedDto: Partial<CodeTaskOrmEntity> = { ...dto };

    if (dto.tags !== undefined) {
      normalizedDto.tags = this.normalizeTags(dto.tags);
    }

    if (dto.functionName !== undefined) {
      normalizedDto.functionName = this.normalizeFunctionName(dto.functionName);
    }

    Object.assign(task, normalizedDto);
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
      relations: ['solvedTasks', 'client'],
    });

    if (!level) {
      level = this.studentLevelRepo.create({
        id: uuidv4(),
        clientId,
        level: 1,
        experience: 0,
      });
      level = await this.studentLevelRepo.save(level);
      level =
        (await this.studentLevelRepo.findOne({
          where: { id: level.id },
          relations: ['solvedTasks', 'client'],
        })) || level;
      level.solvedTasks = level.solvedTasks || [];
    }

    return level;
  }

  private resolveStudentName(
    client?: {
      firstName?: string;
      lastName?: string;
      middleName?: string | null;
    } | null,
    fallbackName?: string | null,
  ): string {
    const normalizedFallback = fallbackName?.trim();

    if (normalizedFallback && normalizedFallback.toLowerCase() !== 'unknown') {
      return normalizedFallback;
    }

    const fullName = [client?.lastName, client?.firstName, client?.middleName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Unknown';
  }

  private applyResolvedStudentName(
    solution: CodeTaskSolutionOrmEntity,
  ): CodeTaskSolutionOrmEntity {
    solution.studentName = this.resolveStudentName(
      solution.client,
      solution.studentName,
    );

    return solution;
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
    executionTimeMs: number;
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
    let totalExecutionTime = 0;

    const supportedLanguagesWithTime: SupportedLanguageWithTime[] = ['javascript', 'python', 'csharp', 'java'];
    const useCodeWithTime = supportedLanguagesWithTime.includes(language as SupportedLanguageWithTime);

    for (let i = 0; i < langTestCases.length; i++) {
      const tc = langTestCases[i];
      const args = this.parseTestArgs(tc.input, tc.args, language);
      const testCode = this.buildTestCode(
        code,
        tc.input,
        language,
        i,
        args,
        task.argumentScheme,
        task.functionName,
      );

      const startTime = Date.now();
      let execResult;

      if (useCodeWithTime) {
        execResult = await this.codeExecutionWithTimeService.executeCodeWithTime(
          language as SupportedLanguageWithTime,
          testCode,
        );
      } else {
        execResult = await this.codeExecutionService.executeCode(
          language as SupportedLanguage,
          testCode,
        );
      }

      const endTime = Date.now();
      const executionTime = useCodeWithTime ? execResult.executionTimeMs : (endTime - startTime);
      totalExecutionTime += executionTime;

      const actual = this.parseResult(execResult.output, i);
      const actualValue = this.normalizeOutputValue(actual);
      const expectedRaw = getExpectedOutputFromTestCase(
        tc,
        task.returnType,
        (task.returnSchema ?? undefined) as ReturnSchema | undefined,
      );
      const expectedValue = this.normalizeOutputValue(expectedRaw);
      const passed = this.compareOutputs(
        actualValue,
        expectedValue,
        task.returnType,
        (task.returnSchema ?? undefined) as ReturnSchema | undefined,
      );

      results.push({
        index: i,
        passed,
        input: tc.input,
        expected: this.stringifyOutputValue(expectedValue),
        actual: this.stringifyOutputValue(actualValue),
      });
    }

    const allTestsPassed = results.every((r) => r.passed);
    const allPassed = allTestsPassed && constraintsPassed;
    let experienceGained = 0;
    const studentLevel = await this.getStudentLevel(clientId);

    const solution = this.codeTaskSolutionRepo.create({
      id: uuidv4(),
      code,
      language,
      executionTimeMs: totalExecutionTime,
      passed: allTestsPassed,
      testCasesPassed: results.filter(r => r.passed).length,
      totalTestCases: results.length,
      testResults: results,
      allPassed,
      experienceGained: 0,
      studentLevelId: studentLevel.id,
      studentName: this.resolveStudentName(studentLevel.client),
      taskId,
      clientId,
    });
    await this.codeTaskSolutionRepo.save(solution);

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

        solution.experienceGained = experienceGained;
        await this.codeTaskSolutionRepo.save(solution);
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
      executionTimeMs: totalExecutionTime,
    };
  }

  
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
    explicitFunctionName?: string | null,
  ): string {
    const fnName = this.resolveTargetFunctionName(
      explicitFunctionName,
      userCode,
      language,
    );
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    const argsStr = args ? this.formatArgsForCode(args, language, argumentScheme) : input;

    switch (language) {
      case 'javascript':
        return `${userCode}\n${JS_TYPED_SERIALIZATION_HELPERS}\nconst __res__ = ${fnName}(${argsStr});\nconsole.log("${marker}");\nconsole.log(JSON.stringify(__codexSerializeTyped(__res__)));\nconsole.log("${markerEnd}");`;

      case 'python':
        return `import json\n${PYTHON_TYPED_SERIALIZATION_HELPERS}\n${userCode}\n__res__ = ${fnName}(${argsStr})\nprint("${marker}")\nprint(json.dumps(__codex_serialize_typed(__res__)))\nprint("${markerEnd}")`;

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
    const hasClass = userCode.includes('public class');
    const hasMain = userCode.includes('public static void main');
    const mainMethod = `${JAVA_SERIALIZATION_HELPERS}

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
                if (!logs.endsWith("\\n")) {
                    System.out.println();
                }
                System.out.println("===LOGS_END===");
            }

            System.out.println("${marker}");
            System.out.print(__codexSerializeResult(result));
            System.out.println();
            System.out.println("${markerEnd}");
        } catch (Exception e) {
            System.setOut(originalOut);
            System.out.println("${marker}");
            System.out.print(__codexSerializeError(e));
            System.out.println();
            System.out.println("${markerEnd}");
        }
    }`;

    if (hasMain) {
      return userCode.replace(
        /public\s+static\s+void\s+main\s*\(String\[\]\s*args\)\s*\{[\s\S]*?\}/,
        mainMethod,
      );
    } else if (hasClass) {
      const codeWithoutLastBrace = userCode.trim().replace(/\}\s*$/, '');
      return `${codeWithoutLastBrace}

${mainMethod}
}`;
    } else {
      return `public class Main {
${userCode}

${mainMethod}
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
    const baseCode = userCode.includes('using System;')
      ? userCode.replace(/^using.*;(\r\n|\r|\n)?/g, '')
      : userCode;
    const mainMethod = `    public static void Main() {
        var originalOut = Console.Out;
        var originalError = Console.Error;
        var outWriter = new StringWriter();
        var errorWriter = new StringWriter();
        var jsonOptions = new System.Text.Json.JsonSerializerOptions { IncludeFields = true };
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
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result, jsonOptions));
            Console.WriteLine("${markerEnd}");
        } catch (Exception e) {
            Console.SetOut(originalOut);
            Console.SetError(originalError);
            Console.WriteLine("${marker}");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new { error = e.Message }, jsonOptions));
            Console.WriteLine("${markerEnd}");
        }
    }`;

    if (hasMain) {
      return (
        usings +
        baseCode.replace(
          /(?:public\s+)?static\s+void\s+Main\s*\([^)]*\)\s*\{[\s\S]*?\}/,
          mainMethod,
        )
      );
    } else if (hasClass) {
      return (
        usings +
        baseCode.replace(
          /\}\s*$/,
          `
${mainMethod}
}`,
        )
      );
    } else {
      return (
        usings +
        `${baseCode}

public class Program {
${mainMethod}
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

  private resolveTargetFunctionName(
    explicitFunctionName: string | null | undefined,
    code: string,
    language: string,
  ): string {
    const normalizedFunctionName = explicitFunctionName?.trim();

    if (normalizedFunctionName) {
      return normalizedFunctionName;
    }

    return this.extractFunctionName(code, language);
  }

  private parseResult(output: string, index: number): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;
    const startIdx = output.indexOf(marker);
    const endIdx = output.indexOf(markerEnd);

    if (startIdx === -1 || endIdx === -1) {
      
      const startIdx2 = output.indexOf('===RESULT_START===');
      const endIdx2 = output.indexOf('===RESULT_END===');
      if (startIdx2 === -1 || endIdx2 === -1) return output.trim();
      return output
        .substring(startIdx2 + '===RESULT_START==='.length, endIdx2)
        .trim();
    }

    return output.substring(startIdx + marker.length, endIdx).trim();
  }

  private normalizeOutputValue(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return '';
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  private stringifyOutputValue(value: unknown): string {
    const normalized = this.normalizeOutputValue(value);

    if (normalized === undefined) {
      return 'undefined';
    }

    if (typeof normalized === 'string') {
      return normalized;
    }

    try {
      return JSON.stringify(normalized);
    } catch {
      return String(normalized);
    }
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private compareNormalizedOutputs(actual: unknown, expected: unknown): boolean {
    if (actual == null && expected == null) return true;

    if (actual == null || expected == null) return false;

    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || actual.length !== expected.length) {
        return false;
      }

      return expected.every((item, index) => this.compareNormalizedOutputs(actual[index], item));
    }

    if (this.isPlainObject(expected)) {
      if (!this.isPlainObject(actual)) {
        return false;
      }

      return Object.entries(expected).every(([key, value]) => (
        this.compareNormalizedOutputs(actual[key], value)
      ));
    }

    if (Array.isArray(actual) || this.isPlainObject(actual)) {
      return false;
    }

    return String(actual).trim() === String(expected).trim();
  }

  private compareOutputs(
    actual: unknown,
    expected: unknown,
    returnType?: string,
    returnSchema?: ReturnSchema,
  ): boolean {
    const normalizedActual = this.normalizeOutputValue(actual);
    const normalizedExpected = this.normalizeOutputValue(expected);

    if (returnType) {
      return compareOutputsWithType(
        normalizedActual,
        normalizedExpected,
        returnType,
        returnSchema,
      );
    }

    return this.compareNormalizedOutputs(normalizedActual, normalizedExpected);
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

      
        if (arg.objectValues && Object.keys(arg.objectValues).length > 0 && scheme?.type === 'object') {
          const fields = Object.values(arg.objectValues).join(', ');
 
          const className = scheme.className || scheme.name.charAt(0).toUpperCase() + scheme.name.slice(1);

          return `new ${className}(${fields})`;
        }
 
        if (arg.value && arg.value.startsWith('"')) {
          return cleanVal;
        }

       
        if (cleanVal.toLowerCase() === 'true') return 'true';
        if (cleanVal.toLowerCase() === 'false') return 'false';
 
        if (/^-?\d+(\.\d+)?$/.test(cleanVal)) {
          return cleanVal;
        }
 
        if (cleanVal && !cleanVal.startsWith('[') && !cleanVal.startsWith('{')) {
          return `"${cleanVal}"`;
        }

        return cleanVal;
      })
      .join(', ');
  }

  async getTaskSolutions(taskId: string): Promise<CodeTaskSolutionOrmEntity[]> {
    await this.getTaskById(taskId);
    const solutions = await this.codeTaskSolutionRepo.find({
      where: { taskId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });

    return solutions.map((solution) => this.applyResolvedStudentName(solution));
  }

  async getTaskSolutionsByLanguage(
    taskId: string,
    language: string,
  ): Promise<CodeTaskSolutionOrmEntity[]> {
    const solutions = await this.codeTaskSolutionRepo.find({
      where: { taskId, language },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });

    return solutions.map((solution) => this.applyResolvedStudentName(solution));
  }

  async getTaskStatistics(taskId: string): Promise<{
    totalSolutions: number;
    passedSolutions: number;
    averageExecutionTimeMs: number;
    fastestExecutionTimeMs: number;
    slowestExecutionTimeMs: number;
    languageStats: Array<{
      language: string;
      count: number;
      avgExecutionTimeMs: number;
      executionTimeDistribution: Array<{
        timeRange: string;
        count: number;
      }>;
    }>;
  }> {
    const solutions = await this.codeTaskSolutionRepo.find({
      where: { taskId },
    });

    const passedSolutions = solutions.filter(s => s.allPassed);
    const executionTimes = passedSolutions.map(s => s.executionTimeMs).filter(t => t > 0);
 
    const languageStatsMap = new Map<string, {
      count: number;
      totalTime: number;
      executionTimes: number[];
    }>();

    for (const solution of passedSolutions) {
      const stats = languageStatsMap.get(solution.language) || {
        count: 0,
        totalTime: 0,
        executionTimes: [],
      };
      stats.count++;
      stats.totalTime += solution.executionTimeMs;
      stats.executionTimes.push(solution.executionTimeMs);
      languageStatsMap.set(solution.language, stats);
    }
 
    const languageStats = Array.from(languageStatsMap.entries()).map(([language, stats]) => {
      const sortedTimes = stats.executionTimes.sort((a, b) => a - b);
      const minTime = Math.min(...sortedTimes);
      const maxTime = Math.max(...sortedTimes);
 
      const intervalCount = Math.min(10, stats.count);
      const intervalSize = maxTime > minTime ? (maxTime - minTime) / intervalCount : 1;

      const distribution: Array<{ timeRange: string; count: number }> = [];

      for (let i = 0; i < intervalCount; i++) {
        const rangeStart = minTime + i * intervalSize;
        const rangeEnd = rangeStart + intervalSize;

        const count = sortedTimes.filter(
          t => t >= rangeStart && (i === intervalCount - 1 ? t <= rangeEnd : t < rangeEnd)
        ).length;

        distribution.push({
          timeRange: `${Math.round(rangeStart)}-${Math.round(rangeEnd)}мс`,
          count,
        });
      }

      return {
        language,
        count: stats.count,
        avgExecutionTimeMs: stats.count > 0 ? stats.totalTime / stats.count : 0,
        executionTimeDistribution: distribution,
      };
    });

    return {
      totalSolutions: solutions.length,
      passedSolutions: passedSolutions.length,
      averageExecutionTimeMs: executionTimes.length > 0
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        : 0,
      fastestExecutionTimeMs: executionTimes.length > 0 ? Math.min(...executionTimes) : 0,
      slowestExecutionTimeMs: executionTimes.length > 0 ? Math.max(...executionTimes) : 0,
      languageStats,
    };
  }

  async getUserSolutions(clientId: string): Promise<CodeTaskSolutionOrmEntity[]> {
    return this.codeTaskSolutionRepo.find({
      where: { clientId },
      relations: ['task'],
      order: { createdAt: 'DESC' },
    });
  }

  async getExecutionTimeRanking(
    taskId: string,
    language: string,
  ): Promise<Array<{
    studentName: string;
    executionTimeMs: number;
    rank: number;
  }>> {
    const solutions = await this.codeTaskSolutionRepo.find({
      where: { taskId, language, allPassed: true },
      relations: ['client'],
      order: { executionTimeMs: 'ASC' },
    });

    return solutions.map((solution, index) => ({
      studentName: this.resolveStudentName(solution.client, solution.studentName),
      executionTimeMs: solution.executionTimeMs,
      rank: index + 1,
    }));
  }

  async getUserRank(
    clientId: string,
    taskId: string,
    language: string,
  ): Promise<{
    rank: number;
    executionTimeMs: number;
    totalParticipants: number;
  }> {
    const userSolution = await this.codeTaskSolutionRepo.findOne({
      where: { clientId, taskId, language },
    });

    if (!userSolution || !userSolution.allPassed) {
      return {
        rank: 0,
        executionTimeMs: 0,
        totalParticipants: 0,
      };
    }

    const fasterSolutions = await this.codeTaskSolutionRepo.count({
      where: {
        taskId,
        language,
        allPassed: true,
        executionTimeMs: { $lt: userSolution.executionTimeMs } as any,
      },
    });

    const totalParticipants = await this.codeTaskSolutionRepo.count({
      where: {
        taskId,
        language,
        allPassed: true,
      },
    });

    return {
      rank: fasterSolutions + 1,
      executionTimeMs: userSolution.executionTimeMs,
      totalParticipants,
    };
  }

  async likeSolution(solutionId: string, clientId: string): Promise<CodeTaskSolutionOrmEntity> {
    const solution = await this.codeTaskSolutionRepo.findOne({ where: { id: solutionId } });

    if (!solution) {
      throw new NotFoundException('Solution not found');
    }

    if (!solution.likedBy) {
      solution.likedBy = [];
    }
    if (!solution.dislikedBy) {
      solution.dislikedBy = [];
    }
 
    if (solution.likedBy.includes(clientId)) {
      solution.likedBy = solution.likedBy.filter((id) => id !== clientId);
      solution.likes = Math.max(0, solution.likes - 1);
      return this.codeTaskSolutionRepo.save(solution);
    }
 
    if (solution.dislikedBy.includes(clientId)) {
      solution.dislikedBy = solution.dislikedBy.filter((id) => id !== clientId);
      solution.dislikes = Math.max(0, solution.dislikes - 1);
    }
 
    solution.likedBy.push(clientId);
    solution.likes = (solution.likes || 0) + 1;

    return this.codeTaskSolutionRepo.save(solution);
  }

  async dislikeSolution(solutionId: string, clientId: string): Promise<CodeTaskSolutionOrmEntity> {
    const solution = await this.codeTaskSolutionRepo.findOne({ where: { id: solutionId } });

    if (!solution) {
      throw new NotFoundException('Solution not found');
    }

    if (!solution.likedBy) {
      solution.likedBy = [];
    }
    if (!solution.dislikedBy) {
      solution.dislikedBy = [];
    }
 
    if (solution.dislikedBy.includes(clientId)) {
      solution.dislikedBy = solution.dislikedBy.filter((id) => id !== clientId);
      solution.dislikes = Math.max(0, solution.dislikes - 1);
      return this.codeTaskSolutionRepo.save(solution);
    }
 
    if (solution.likedBy.includes(clientId)) {
      solution.likedBy = solution.likedBy.filter((id) => id !== clientId);
      solution.likes = Math.max(0, solution.likes - 1);
    }

    
    solution.dislikedBy.push(clientId);
    solution.dislikes = (solution.dislikes || 0) + 1;

    return this.codeTaskSolutionRepo.save(solution);
  }
}
