import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStudentResultRepository } from '../../domain/interfaces/student-result.repository.interface';
import { StudentResult } from '../../domain/entities/student-result.entity';
import { CreateStudentResultDto } from '../dtos/create-student-result.dto';
import { UpdateStudentResultDto } from '../dtos/update-student-result.dto';
import { ILessonRepository } from '../../../lesson/domain/interfaces/lesson.repository.interface';
import { ICourseMapRepository } from '../../../map/domain/interfaces/course-map.repository.interface';

@Injectable()
export class StudentResultService {
  constructor(
    @Inject('IStudentResultRepository')
    private readonly studentResultRepository: IStudentResultRepository,
    @Inject('ILessonRepository')
    private readonly lessonRepository: ILessonRepository,
    @Inject('ICourseMapRepository')
    private readonly courseMapRepository: ICourseMapRepository,
  ) {}

  async create(createStudentResultDto: CreateStudentResultDto): Promise<StudentResult> {
    // Используем clientId из DTO
    const clientId = createStudentResultDto.clientId!;
    
    const result = new StudentResult(
      clientId,
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

  async getBestResultByClientAndLesson(clientId: string, lessonId: string): Promise<StudentResult | null> {
    const results = await this.studentResultRepository.findByClientIdAndLessonId(clientId, lessonId);
    
    if (!results || results.length === 0) {
      return null;
    }

    // Возвращаем результат с наибольшим количеством звезд
    return results.reduce((best, current) => 
      current.countOfStars > best.countOfStars ? current : best
    );
  }

  async getBestResultsForCourse(clientId: string, courseId: string): Promise<{
    lessonId: string;
    bestResult: StudentResult | null;
  }[]> {
    // Получаем карту курса по courseId
    const courseMap = await this.courseMapRepository.findByCourseId(courseId);
    
    if (!courseMap) {
      throw new NotFoundException(`Course map for course ${courseId} not found`);
    }

    // Получаем все уроки для этого курса
    const lessons = await this.lessonRepository.findAllByCourseMapId(courseMap.id);
    const lessonIds = lessons.map(lesson => lesson.id);

    // Получаем все результаты студента
    const results = await this.studentResultRepository.findByClientId(clientId);
    
    // Группируем результаты по lessonId
    const resultsByLesson = new Map<string, StudentResult[]>();
    for (const result of results) {
      const existing = resultsByLesson.get(result.lessonId) || [];
      existing.push(result);
      resultsByLesson.set(result.lessonId, existing);
    }

    // Для каждого урока находим лучший результат
    return lessonIds.map(lessonId => {
      const lessonResults = resultsByLesson.get(lessonId) || [];
      const bestResult = lessonResults.length > 0
        ? lessonResults.reduce((best, current) =>
            current.countOfStars > best.countOfStars ? current : best
          )
        : null;

      return { lessonId, bestResult };
    });
  }
}
