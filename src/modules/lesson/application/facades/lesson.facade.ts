import { Injectable } from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { UpdateLessonDto } from '../dtos/update-lesson.dto';
import { LessonResponseDto } from '../dtos/lesson-response.dto';

@Injectable()
export class LessonFacade {
  constructor(private readonly lessonService: LessonService) {}

  async createLesson(dto: CreateLessonDto): Promise<LessonResponseDto> {
    return this.lessonService.createLesson(dto);
  }

  async getLesson(id: string): Promise<LessonResponseDto> {
    return this.lessonService.getLesson(id);
  }

  async getLessonByMapElementId(
    mapElementId: string,
  ): Promise<LessonResponseDto> {
    return this.lessonService.getLessonByMapElementId(mapElementId);
  }

  async getLessonsByCourseMapId(
    courseMapId: string,
  ): Promise<LessonResponseDto[]> {
    return this.lessonService.getLessonsByCourseMapId(courseMapId);
  }

  async updateLesson(
    id: string,
    dto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return this.lessonService.updateLesson(id, dto);
  }

  async deleteLesson(id: string): Promise<{ success: boolean }> {
    return this.lessonService.deleteLesson(id);
  }

  async deleteLessonByMapElementId(
    mapElementId: string,
  ): Promise<{ success: boolean }> {
    return this.lessonService.deleteLessonByMapElementId(mapElementId);
  }
}
