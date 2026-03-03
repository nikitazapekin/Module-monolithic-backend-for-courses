import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICourseSubscriptionRepository } from '../../domain/interfaces/course-subscription.repository.interface';
import { CourseSubscription } from '../../domain/entities/course-subscription.entity';
import { CourseSubscriptionOrmEntity } from '../typeorm/course-subscription.orm-entity';

@Injectable()
export class CourseSubscriptionRepository implements ICourseSubscriptionRepository {
  constructor(
    @InjectRepository(CourseSubscriptionOrmEntity)
    private readonly repository: Repository<CourseSubscriptionOrmEntity>,
  ) {}

  async findByClientId(clientId: string): Promise<CourseSubscription[]> {
    const entities = await this.repository.find({
      where: { clientId },
      order: { subscribedAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByClientIdAndCourseId(clientId: string, courseId: string): Promise<CourseSubscription | null> {
    const entity = await this.repository.findOne({
      where: { clientId, courseId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async save(subscription: CourseSubscription): Promise<void> {
    const entity = this.toOrm(subscription);
    await this.repository.save(entity);
  }

  async delete(subscription: CourseSubscription): Promise<void> {
    await this.repository.delete({ id: subscription.id });
  }

  private toDomain(entity: CourseSubscriptionOrmEntity): CourseSubscription {
    const subscription = new CourseSubscription(entity.clientId, entity.courseId);
    subscription.id = entity.id;
    subscription.subscribedAt = entity.subscribedAt;
    subscription.createdAt = entity.createdAt;
    subscription.updatedAt = entity.updatedAt;
    return subscription;
  }

  private toOrm(domain: CourseSubscription): CourseSubscriptionOrmEntity {
    const entity = new CourseSubscriptionOrmEntity();
    entity.id = domain.id;
    entity.clientId = domain.clientId;
    entity.courseId = domain.courseId;
    entity.subscribedAt = domain.subscribedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
