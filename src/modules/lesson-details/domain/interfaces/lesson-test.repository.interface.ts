import { LessonTest } from '../entities/lesson-test.entity';

export interface ILessonTestRepository {
  create(test: LessonTest): Promise<LessonTest>;
  createMany(tests: LessonTest[]): Promise<LessonTest[]>;
  findById(id: string): Promise<LessonTest | null>;
  findAllByLessonDetailsId(lessonDetailsId: string): Promise<LessonTest[]>;
  update(id: string, updates: Partial<LessonTest>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteAllByLessonDetailsId(lessonDetailsId: string): Promise<boolean>;
}
