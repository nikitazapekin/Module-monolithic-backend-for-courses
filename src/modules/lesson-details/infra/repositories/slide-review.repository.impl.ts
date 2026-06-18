import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SlideReviewOrmEntity,
  ReviewStatus,
} from '../../infra/typeorm/slide-review.orm-entity';
import { SlideReview } from '../../domain/entities/review.entity';
import { ISlideReviewRepository } from '../../domain/interfaces/slide-review.repository.interface';

@Injectable()
export class SlideReviewRepository implements ISlideReviewRepository {
  constructor(
    @InjectRepository(SlideReviewOrmEntity)
    private readonly ormRepository: Repository<SlideReviewOrmEntity>,
  ) {}

  private toDomain(entity: SlideReviewOrmEntity): SlideReview {
    const review = new SlideReview(
      entity.slideId,
      entity.blockId,
      entity.reviewerId,
      entity.reviewerName,
      entity.proposedChanges,
      entity.comment,
      entity.id,
    );
    (review as any).status = entity.status;
    (review as any).createdAt = entity.createdAt;
    (review as any).updatedAt = entity.updatedAt;
    return review;
  }

  private toOrm(domain: SlideReview): SlideReviewOrmEntity {
    const entity = new SlideReviewOrmEntity();
    entity.id = domain.id;
    entity.slideId = domain.slideId;
    entity.blockId = domain.blockId;
    entity.reviewerId = domain.reviewerId;
    entity.reviewerName = domain.reviewerName;
    entity.proposedChanges = domain.proposedChanges;
    entity.comment = domain.comment;
    entity.status = domain.status as ReviewStatus;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  async create(review: SlideReview): Promise<SlideReview> {
    const ormEntity = this.toOrm(review);
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<SlideReview | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySlideId(slideId: string): Promise<SlideReview[]> {
    const entities = await this.ormRepository.find({
      where: { slideId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByBlockId(
    slideId: string,
    blockId: string,
  ): Promise<SlideReview[]> {
    const entities = await this.ormRepository.find({
      where: { slideId, blockId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByStatus(
    slideId: string,
    status: ReviewStatus,
  ): Promise<SlideReview[]> {
    const entities = await this.ormRepository.find({
      where: { slideId, status },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async update(review: SlideReview): Promise<SlideReview> {
    const ormEntity = this.toOrm(review);
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
