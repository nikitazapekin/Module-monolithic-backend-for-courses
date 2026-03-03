import { StudentResult } from '../entities/student-result.entity';

export interface IStudentResultRepository {
  findById(id: string): Promise<StudentResult | null>;
  findByClientId(clientId: string): Promise<StudentResult[]>;
  findByLessonId(lessonId: string): Promise<StudentResult[]>;
  findByClientIdAndLessonId(clientId: string, lessonId: string): Promise<StudentResult[]>;
  save(result: StudentResult): Promise<StudentResult>;
  update(id: string, updates: Partial<StudentResult>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<boolean>;
}
