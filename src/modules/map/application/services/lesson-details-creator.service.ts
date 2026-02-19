// map/application/services/lesson-details-creator.service.ts
import { Injectable } from '@nestjs/common';
import { LessonDetailsFacade } from '../../../lesson-details/application/facades/lesson-details.facade';

@Injectable()
export class LessonDetailsCreatorService {
  constructor(
    private readonly lessonDetailsFacade: LessonDetailsFacade,
  ) {}

  async createLessonDetailsForLesson(lessonId: string, mapElementId: string): Promise<void> {
    try {
      // Проверяем, существует ли уже lesson-details
      try {
        await this.lessonDetailsFacade.getLessonDetailsByLessonId(lessonId);
        console.log(`✅ Lesson details already exist for lesson: ${lessonId}`);
        return;
      } catch (error) {
        // Если 404 - создаем новые
        if (error.status === 404) {
          await this.lessonDetailsFacade.createLessonDetails({
            lessonId,
            slides: [],
            tests: []
          });
          console.log(`✅ Lesson details created for lesson: ${lessonId} (map element: ${mapElementId})`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create lesson details for lesson ${lessonId}:`, error);
      // Не прокидываем ошибку дальше, чтобы не прерывать создание элемента
    }
  }
}