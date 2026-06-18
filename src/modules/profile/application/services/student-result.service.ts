import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IStudentResultRepository } from '../../domain/interfaces/student-result.repository.interface';
import { StudentResult } from '../../domain/entities/student-result.entity';
import { CreateStudentResultDto } from '../dtos/create-student-result.dto';
import { UpdateStudentResultDto } from '../dtos/update-student-result.dto';
import { ILessonRepository } from '../../../lesson/domain/interfaces/lesson.repository.interface';
import { ICourseMapRepository } from '../../../map/domain/interfaces/course-map.repository.interface';
import { ICheckpointRepository } from '../../../checkpoint/domain/interfaces/checkpoint.repository.interface';

@Injectable()
export class StudentResultService {
  constructor(
    @Inject('IStudentResultRepository')
    private readonly studentResultRepository: IStudentResultRepository,
    @Inject('ILessonRepository')
    private readonly lessonRepository: ILessonRepository,
    @Inject('ICourseMapRepository')
    private readonly courseMapRepository: ICourseMapRepository,
    @Inject('ICheckpointRepository')
    private readonly checkpointRepository: ICheckpointRepository,
  ) {}

  async create(
    createStudentResultDto: CreateStudentResultDto,
  ): Promise<StudentResult> {
  
    const clientId = createStudentResultDto.clientId!;

    const result = new StudentResult(
      clientId,
      {
        lessonId: createStudentResultDto.lessonId,
        checkpointId: createStudentResultDto.checkpointId,
      },
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

  async findByCheckpointId(checkpointId: string): Promise<StudentResult[]> {
    return this.studentResultRepository.findByCheckpointId(checkpointId);
  }

  async update(
    id: string,
    updateStudentResultDto: UpdateStudentResultDto,
  ): Promise<StudentResult> {
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

    const totalStars = results.reduce(
      (sum, result) => sum + result.countOfStars,
      0,
    );
    const averageStars = totalStars / results.length;

    return {
      totalLessons: results.length,
      averageStars: Math.round(averageStars * 100) / 100,
      results,
    };
  }

  async getBestResultByClientAndLesson(
    clientId: string,
    lessonId: string,
  ): Promise<StudentResult | null> {
    const results =
      await this.studentResultRepository.findByClientIdAndLessonId(
        clientId,
        lessonId,
      );

    if (!results || results.length === 0) {
      return null;
    }
 
    return results.reduce((best, current) =>
      current.countOfStars > best.countOfStars ? current : best,
    );
  }

  async getBestResultByClientAndCheckpoint(
    clientId: string,
    checkpointId: string,
  ): Promise<StudentResult | null> {
    const results =
      await this.studentResultRepository.findByClientIdAndCheckpointId(
        clientId,
        checkpointId,
      );

    if (!results || results.length === 0) {
      return null;
    }

    return results.reduce((best, current) =>
      current.countOfStars > best.countOfStars ? current : best,
    );
  }

  async getBestResultsForCourse(
    clientId: string,
    courseId: string,
  ): Promise<
    {
      targetId: string;
      targetType: 'lesson' | 'checkpoint';
      mapElementId: string;
      orderIndex: number;
      bestResult: StudentResult | null;
    }[]
  > {
  
    const courseMap = await this.courseMapRepository.findByCourseId(courseId);

    if (!courseMap) {
      throw new NotFoundException(
        `Course map for course ${courseId} not found`,
      );
    }
 
    const [lessons, checkpoints] = await Promise.all([
      this.lessonRepository.findAllByCourseMapId(courseMap.id),
      this.checkpointRepository.findAllByCourseMapId(courseMap.id),
    ]);

    const results = await this.studentResultRepository.findByClientId(clientId);

    const resultsByTarget = new Map<string, StudentResult[]>();
    for (const result of results) {
      const targetKey = `${result.targetType}:${result.targetId}`;
      const existing = resultsByTarget.get(targetKey) || [];
      existing.push(result);
      resultsByTarget.set(targetKey, existing);
    }

    const courseUnits = [
      ...lessons.map((lesson) => ({
        targetId: lesson.id,
        targetType: 'lesson' as const,
        mapElementId: lesson.mapElementId,
        orderIndex: lesson.orderIndex,
      })),
      ...checkpoints.map((checkpoint) => ({
        targetId: checkpoint.id,
        targetType: 'checkpoint' as const,
        mapElementId: checkpoint.mapElementId,
        orderIndex: checkpoint.orderIndex,
      })),
    ].sort((left, right) => left.orderIndex - right.orderIndex);

    return courseUnits.map((unit) => {
      const targetKey = `${unit.targetType}:${unit.targetId}`;
      const unitResults = resultsByTarget.get(targetKey) || [];
      const bestResult =
        unitResults.length > 0
          ? unitResults.reduce((best, current) =>
              current.countOfStars > best.countOfStars ? current : best,
            )
          : null;

      return {
        targetId: unit.targetId,
        targetType: unit.targetType,
        mapElementId: unit.mapElementId,
        orderIndex: unit.orderIndex,
        bestResult,
      };
    });
  }
}
