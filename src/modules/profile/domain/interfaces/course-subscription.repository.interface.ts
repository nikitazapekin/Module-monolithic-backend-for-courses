import { CourseSubscription } from '../entities/course-subscription.entity';

export interface ICourseSubscriptionRepository {
  findByAuditoryId(auditoryId: string): Promise<CourseSubscription[]>;
  findByAuditoryIdAndCourseId(auditoryId: string, courseId: string): Promise<CourseSubscription | null>;
  save(subscription: CourseSubscription): Promise<void>;
  delete(subscription: CourseSubscription): Promise<void>;
}
