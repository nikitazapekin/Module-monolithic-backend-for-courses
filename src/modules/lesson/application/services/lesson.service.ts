import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { ILessonRepository } from '../../domain/interfaces/lesson.repository.interface';
import { Lesson } from '../../domain/entities/lesson.entity';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { UpdateLessonDto } from '../dtos/update-lesson.dto';
import { LessonResponseDto } from '../dtos/lesson-response.dto';

@Injectable()
export class LessonService {
  constructor(
    @Inject('ILessonRepository')
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async createLesson(dto: CreateLessonDto): Promise<LessonResponseDto> {
    // Проверяем, нет ли уже урока с таким mapElementId
    const existingLesson = await this.lessonRepository.findByMapElementId(dto.mapElementId);
    if (existingLesson) {
      throw new ConflictException('Lesson already exists for this map element');
    }

    const lesson = new Lesson(
      dto.mapElementId,
      dto.title,
      dto.description,
      dto.orderIndex,
      dto.content,
      dto.duration,
      dto.isPublished || false
    );

    const createdLesson = await this.lessonRepository.create(lesson);
    return this.toResponseDto(createdLesson);
  }

  async getLesson(id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return this.toResponseDto(lesson);
  }

  async getLessonByMapElementId(mapElementId: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findByMapElementId(mapElementId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found for this map element');
    }
    return this.toResponseDto(lesson);
  }

  async getLessonsByCourseMapId(courseMapId: string): Promise<LessonResponseDto[]> {
    const lessons = await this.lessonRepository.findAllByCourseMapId(courseMapId);
    return lessons.map(lesson => this.toResponseDto(lesson));
  }

  async updateLesson(id: string, dto: UpdateLessonDto): Promise<LessonResponseDto> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Если пытаемся изменить mapElementId, проверяем, что он уникален
    if (dto.mapElementId && dto.mapElementId !== lesson.mapElementId) {
      const existingLesson = await this.lessonRepository.findByMapElementId(dto.mapElementId);
      if (existingLesson && existingLesson.id !== id) {
        throw new ConflictException('Another lesson already uses this map element');
      }
    }

    lesson.update(dto);
    const updated = await this.lessonRepository.update(id, lesson);
    if (!updated) {
      throw new BadRequestException('Failed to update lesson');
    }

    const updatedLesson = await this.lessonRepository.findById(id);
    return this.toResponseDto(updatedLesson!);
  }

  async deleteLesson(id: string): Promise<{ success: boolean }> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const deleted = await this.lessonRepository.delete(id);
    return { success: deleted };
  }

  async deleteLessonByMapElementId(mapElementId: string): Promise<{ success: boolean }> {
    const deleted = await this.lessonRepository.deleteByMapElementId(mapElementId);
    return { success: deleted };
  }

  private toResponseDto(lesson: Lesson): LessonResponseDto {
    return {
      id: lesson.id,
      mapElementId: lesson.mapElementId,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      orderIndex: lesson.orderIndex,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}
