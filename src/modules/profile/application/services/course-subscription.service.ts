import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSubscription } from '../../domain/entities/course-subscription.entity';
import { ICourseSubscriptionRepository } from '../../domain/interfaces/course-subscription.repository.interface';
import { CourseSubscriptionDto } from '../dtos/course-subscription.dto';
import { StudentCourseResponseDto } from '../dtos/student-course-response.dto';
import { CourseOrmEntity } from '@modules/courses/infra/typeorm/course.orm-entity';

@Injectable()
export class CourseSubscriptionService {
  constructor(
    @Inject('ICourseSubscriptionRepository')
    private readonly courseSubscriptionRepository: ICourseSubscriptionRepository,
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepository: Repository<CourseOrmEntity>,
  ) {}

  async subscribe(
    auditoryId: string,
    courseId: string,
  ): Promise<CourseSubscriptionDto> {
    const existing =
      await this.courseSubscriptionRepository.findByAuditoryIdAndCourseId(
        auditoryId,
        courseId,
      );

    if (existing) {
      throw new ConflictException(
        `Auditory ${auditoryId} is already subscribed to course ${courseId}`,
      );
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const subscription = new CourseSubscription(auditoryId, courseId);
    await this.courseSubscriptionRepository.save(subscription);

    return this.toDto(subscription);
  }

  async unsubscribe(auditoryId: string, courseId: string): Promise<void> {
    const subscription =
      await this.courseSubscriptionRepository.findByAuditoryIdAndCourseId(
        auditoryId,
        courseId,
      );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found for auditory ${auditoryId} and course ${courseId}`,
      );
    }

    await this.courseSubscriptionRepository.delete(subscription);
  }

  async getCoursesByAuditoryId(
    auditoryId: string,
  ): Promise<StudentCourseResponseDto[]> {
    const subscriptions =
      await this.courseSubscriptionRepository.findByAuditoryId(auditoryId);

    const courses = await this.courseRepository.findByIds(
      subscriptions.map((s) => s.courseId),
    );

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    return subscriptions
      .filter((s) => courseMap.has(s.courseId))
      .map((subscription) => {
        const course = courseMap.get(subscription.courseId)!;
        return this.toCourseResponseDto(subscription, course);
      });
  }

  private toDto(subscription: CourseSubscription): CourseSubscriptionDto {
    const dto = new CourseSubscriptionDto();
    dto.id = subscription.id;
    dto.auditoryId = subscription.auditoryId;
    dto.courseId = subscription.courseId;
    dto.subscribedAt = subscription.subscribedAt;
    dto.createdAt = subscription.createdAt;
    dto.updatedAt = subscription.updatedAt;
    return dto;
  }

  private toCourseResponseDto(
    subscription: CourseSubscription,
    course: CourseOrmEntity,
  ): StudentCourseResponseDto {
    const dto = new StudentCourseResponseDto();
    dto.id = course.id;
    dto.title = course.title;
    dto.description = course.description;
    dto.type = course.type;
    dto.language = course.language;
    dto.tags = course.tags;
    dto.logo = course.logo;
    dto.status = course.status as 'draft' | 'published' | 'archived';
    dto.subscribedAt = subscription.subscribedAt;
    dto.publishedAt = course.publishedAt ?? null;
    return dto;
  }
}
