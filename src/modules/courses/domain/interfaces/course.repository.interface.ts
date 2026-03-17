import { Course, CourseStatus } from '../entities/course.entity';

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findAll(options?: {
    adminId?: string;
    status?: CourseStatus;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }>;
  update(id: string, updates: Partial<Course>): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // Специфические запросы
  findByAdminId(adminId: string): Promise<Course[]>;
  findByStatus(status: CourseStatus): Promise<Course[]>;
  findByTag(tag: string): Promise<Course[]>;
  existsByTitle(title: string): Promise<boolean>;
}
