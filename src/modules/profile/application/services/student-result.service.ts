import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStudentResultRepository } from '../../domain/interfaces/student-result.repository.interface';
import { StudentResult } from '../../domain/entities/student-result.entity';
import { CreateStudentResultDto } from '../dtos/create-student-result.dto';
import { UpdateStudentResultDto } from '../dtos/update-student-result.dto';

@Injectable()
export class StudentResultService {
  constructor(
    @Inject('IStudentResultRepository')
    private readonly studentResultRepository: IStudentResultRepository,
  ) {}

  async create(createStudentResultDto: CreateStudentResultDto): Promise<StudentResult> {
    // Check if result already exists for this client and lesson
    const existingResult = await this.studentResultRepository.findByClientIdAndLessonId(
      createStudentResultDto.clientId,
      createStudentResultDto.lessonId,
    );

    if (existingResult) {
      throw new BadRequestException(
        'Result for this client and lesson already exists. Use update endpoint instead.',
      );
    }

    const result = new StudentResult(
      createStudentResultDto.clientId,
      createStudentResultDto.lessonId,
      createStudentResultDto.countOfStars,
    );

    return this.studentResultRepository.save(result);
  }

  async findById(id: string): Promise<StudentResult> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`Student result with ID ${id} not found`);
    }
    return result;
  }

  async findByClientId(clientId: string): Promise<StudentResult[]> {
    return this.studentResultRepository.findByClientId(clientId);
  }

  async findByLessonId(lessonId: string): Promise<StudentResult[]> {
    return this.studentResultRepository.findByLessonId(lessonId);
  }

  async update(id: string, updateStudentResultDto: UpdateStudentResultDto): Promise<StudentResult> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`Student result with ID ${id} not found`);
    }

    if (updateStudentResultDto.countOfStars !== undefined) {
      result.updateStars(updateStudentResultDto.countOfStars);
    }

    await this.studentResultRepository.update(id, {
      countOfStars: result.countOfStars,
      updatedAt: result.updatedAt,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.studentResultRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`Student result with ID ${id} not found`);
    }
    return this.studentResultRepository.delete(id);
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    return this.studentResultRepository.deleteByClientId(clientId);
  }

  async getStudentProgress(clientId: string): Promise<{
    totalLessons: number;
    averageStars: number;
    results: StudentResult[];
  }> {
    const results = await this.findByClientId(clientId);
    
    if (results.length === 0) {
      return {
        totalLessons: 0,
        averageStars: 0,
        results: [],
      };
    }

    const totalStars = results.reduce((sum, result) => sum + result.countOfStars, 0);
    const averageStars = totalStars / results.length;

    return {
      totalLessons: results.length,
      averageStars: Math.round(averageStars * 100) / 100,
      results,
    };
  }
}
