import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CodeTaskOrmEntity } from '../../infra/typeorm/code-task.orm-entity';
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

  async createTask(dto: CreateCodeTaskDto, adminId: string, authorName: string): Promise<CodeTaskOrmEntity> {
    const task = this.codeTaskRepo.create({
      id: uuidv4(),
      ...dto,
      constraints: dto.constraints ?? [],
      adminId,
      authorName,
    });
    return this.codeTaskRepo.save(task);
  }

  async updateTask(id: string, dto: UpdateCodeTaskDto, adminId: string): Promise<CodeTaskOrmEntity> {
    const task = await this.codeTaskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.adminId !== adminId) throw new ForbiddenException('You can only edit your own tasks');

    Object.assign(task, dto);
    return this.codeTaskRepo.save(task);
  }

  async deleteTask(id: string, adminId: string): Promise<{ success: boolean }> {
    const task = await this.codeTaskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.adminId !== adminId) throw new ForbiddenException('You can only delete your own tasks');

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
    return this.codeTaskRepo.find({ where: { difficulty }, order: { createdAt: 'DESC' } });
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
    results: Array<{ index: number; passed: boolean; input: string; expected: string; actual: string }>;
    experienceGained: number;
    newLevel: number;
    newExperience: number;
  }> {
    const task = await this.getTaskById(taskId);

    if (!task.languages.includes(language)) {
      throw new BadRequestException(`Language "${language}" is not supported for this task. Supported: ${task.languages.join(', ')}`);
    }

    if (!task.testCases || task.testCases.length === 0) {
      throw new BadRequestException('Task has no test cases');
    }

    const results: Array<{
      index: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }> = [];

    for (let i = 0; i < task.testCases.length; i++) {
      const tc = task.testCases[i];
      const testCode = this.buildTestCode(code, tc.input, language, i);

      const execResult = await this.codeExecutionService.executeCode(
        language as SupportedLanguage,
        testCode,
      );

      const actual = this.parseResult(execResult.output, i);
      const passed = this.compareOutputs(actual.trim(), tc.expectedOutput.trim());

      results.push({
        index: i,
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual,
      });
    }

    const allPassed = results.every((r) => r.passed);
    let experienceGained = 0;
    let studentLevel = await this.getStudentLevel(clientId);

    if (allPassed) {
      const alreadySolved = await this.solvedTaskRepo.findOne({
        where: { studentLevelId: studentLevel.id, codeTaskId: taskId },
      });

      if (!alreadySolved) {
        experienceGained = task.experienceReward;
        studentLevel.experience += experienceGained;

        const requiredExp = this.getRequiredExperience(studentLevel.level);
        while (studentLevel.experience >= requiredExp) {
          studentLevel.experience -= this.getRequiredExperience(studentLevel.level);
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
    };
  }

  /**
   * Level N requires 10^(N-1) experience.
   * Level 2 = 10, Level 3 = 100, Level 4 = 1000, etc.
   */
  private getRequiredExperience(level: number): number {
    return Math.pow(10, level - 1);
  }

  private buildTestCode(userCode: string, input: string, language: string, index: number): string {
    const fnName = this.extractFunctionName(userCode, language);
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;

    switch (language) {
      case 'javascript':
        return `${userCode}\nconst __res__ = ${fnName}(${input});\nconsole.log("${marker}");\nconsole.log(JSON.stringify(__res__));\nconsole.log("${markerEnd}");`;

      case 'python':
        return `import json\n${userCode}\n__res__ = ${fnName}(${input})\nprint("${marker}")\nprint(json.dumps(__res__))\nprint("${markerEnd}")`;

      case 'java':
        return this.buildJavaTestCode(userCode, fnName, input, index);

      case 'csharp':
        return this.buildCSharpTestCode(userCode, fnName, input, index);

      case 'golang':
        return this.buildGoTestCode(userCode, fnName, input, index);

      default:
        return `${userCode}\nconst __res__ = ${fnName}(${input});\nconsole.log("${marker}");\nconsole.log(JSON.stringify(__res__));\nconsole.log("${markerEnd}");`;
    }
  }

  private buildJavaTestCode(userCode: string, fnName: string, input: string, index: number): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;
    const cleanCode = userCode
      .replace(/public\s+class\s+\w+\s*\{/, '')
      .replace(/public\s+static\s+void\s+main\s*\(String\[\]\s*args\)\s*\{[\s\S]*?\}/, '')
      .replace(/\}\s*$/, '');

    return `import java.util.*;
public class Solution {
${cleanCode}
  public static void main(String[] args) {
    Object result = ${fnName}(${input});
    System.out.println("${marker}");
    System.out.println(result instanceof int[] ? Arrays.toString((int[])result) : String.valueOf(result));
    System.out.println("${markerEnd}");
  }
}`;
  }

  private buildCSharpTestCode(userCode: string, fnName: string, input: string, index: number): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;
    return `using System;
using System.Linq;
using System.Collections.Generic;
class Solution {
  ${userCode}
  static void Main(string[] args) {
    var result = ${fnName}(${input});
    Console.WriteLine("${marker}");
    Console.WriteLine(result);
    Console.WriteLine("${markerEnd}");
  }
}`;
  }

  private buildGoTestCode(userCode: string, fnName: string, input: string, index: number): string {
    const marker = `===RESULT_START_${index}===`;
    const markerEnd = `===RESULT_END_${index}===`;
    return `package main
import (
  "fmt"
  "encoding/json"
)
${userCode.replace(/^package main\s*/, '').replace(/import\s*\([\s\S]*?\)/, '').replace(/import\s+"[^"]*"/, '')}
func main() {
  result := ${fnName}(${input})
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
        match = code.match(/function\s+(\w+)\s*\(/) || code.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:\(|function)/);
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

    if (startIdx === -1 || endIdx === -1) return output.trim();

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
}
