import { LessonDetails } from '../entities/lesson-details.entity';

export interface ILessonDetailsRepository {
  create(details: LessonDetails): Promise<LessonDetails>;
  findById(id: string): Promise<LessonDetails | null>;
  findByLessonId(lessonId: string): Promise<LessonDetails | null>;
  update(id: string, updates: Partial<LessonDetails>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByLessonId(lessonId: string): Promise<boolean>;
}
