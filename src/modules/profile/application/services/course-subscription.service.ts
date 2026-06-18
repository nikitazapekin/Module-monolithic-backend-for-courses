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
import { AuthorizedCourseResponseDto } from '../dtos/authorized-course-response.dto';
import { CourseOrmEntity } from '@modules/courses/infra/typeorm/course.orm-entity';
import { AuditoryOrmEntity } from '@modules/auth/infra/typeorm/auditory.orm-entity';

@Injectable()
export class CourseSubscriptionService {
  constructor(
    @Inject('ICourseSubscriptionRepository')
    private readonly courseSubscriptionRepository: ICourseSubscriptionRepository,
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepository: Repository<CourseOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
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

  async isSubscribed(auditoryId: string, courseId: string): Promise<boolean> {
    const subscription =
      await this.courseSubscriptionRepository.findByAuditoryIdAndCourseId(
        auditoryId,
        courseId,
      );

    return !!subscription;
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

  async getAllCoursesForAuditory(
    auditoryId: string,
  ): Promise<AuthorizedCourseResponseDto[]> {
    const [courses, subscriptions] = await Promise.all([
      this.courseRepository.find({
        where: { status: 'published' },
        order: { publishedAt: 'DESC', createdAt: 'DESC' },
      }),
      this.courseSubscriptionRepository.findByAuditoryId(auditoryId),
    ]);

    const subscribedCourseIds = new Set(
      subscriptions.map((subscription) => subscription.courseId),
    );

    return courses.map((course) =>
      this.toAuthorizedCourseResponseDto(
        course,
        subscribedCourseIds.has(course.id),
      ),
    );
  }

  async getStudentsByCourseId(courseId: string): Promise<any[]> {
    const subscriptions =
      await this.courseSubscriptionRepository.findByCourseId(courseId);

    if (subscriptions.length === 0) {
      return [];
    }

    const auditoryIds = subscriptions.map((s) => s.auditoryId);

    const auditories = await this.auditoryRepository
      .createQueryBuilder('auditory')
      .leftJoinAndSelect('auditory.client', 'client')
      .where('auditory.id IN (:...auditoryIds)', { auditoryIds })
      .getMany();

    return auditories.map((auditory) => ({
      auditoryId: auditory.id,
      email: auditory.email,
      firstName: auditory.client?.firstName || '',
      lastName: auditory.client?.lastName || '',
      middleName: auditory.client?.middleName || '',
      isActive: auditory.isActive,
      lastLoginAt: auditory.lastLoginAt,
    }));
  }

  async getStudentCountByCourseId(courseId: string): Promise<number> {
    const subscriptions =
      await this.courseSubscriptionRepository.findByCourseId(courseId);

    return subscriptions.length;
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
    dto.isSubscribed = true;
    return dto;
  }

  private toAuthorizedCourseResponseDto(
    course: CourseOrmEntity,
    isSubscribed: boolean,
  ): AuthorizedCourseResponseDto {
    const dto = new AuthorizedCourseResponseDto();
    dto.id = course.id;
    dto.title = course.title;
    dto.description = course.description;
    dto.fullDescription = course.fullDescription || course.description;
    dto.type = course.type;
    dto.language = course.language;
    dto.tags = course.tags;
    dto.logo = course.logo;
    dto.status = course.status as 'draft' | 'published' | 'archived';
    dto.adminId = course.adminId;
    dto.createdAt = course.createdAt;
    dto.updatedAt = course.updatedAt;
    dto.publishedAt = course.publishedAt ?? null;
    dto.isSubscribed = isSubscribed;
    return dto;
  }
}
