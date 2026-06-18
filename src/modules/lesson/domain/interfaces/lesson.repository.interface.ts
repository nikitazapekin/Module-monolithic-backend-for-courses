import { Lesson } from '../entities/lesson.entity';

export interface ILessonRepository {
  create(lesson: Lesson): Promise<Lesson>;
  findById(id: string): Promise<Lesson | null>;
  findByMapElementId(mapElementId: string): Promise<Lesson | null>;
  findAllByCourseMapId(courseMapId: string): Promise<Lesson[]>;
  update(id: string, updates: Partial<Lesson>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByMapElementId(mapElementId: string): Promise<boolean>;
}
