import { CourseSubscription } from '../entities/course-subscription.entity';

export interface ICourseSubscriptionRepository {
  findByClientId(clientId: string): Promise<CourseSubscription[]>;
  findByClientIdAndCourseId(clientId: string, courseId: string): Promise<CourseSubscription | null>;
  save(subscription: CourseSubscription): Promise<void>;
  delete(subscription: CourseSubscription): Promise<void>;
}
