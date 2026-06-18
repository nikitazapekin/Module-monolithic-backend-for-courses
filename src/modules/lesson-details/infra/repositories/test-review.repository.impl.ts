import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TestReviewOrmEntity,
  ReviewStatus,
} from '../../infra/typeorm/test-review.orm-entity';
import { TestReview } from '../../domain/entities/review.entity';
import { ITestReviewRepository } from '../../domain/interfaces/test-review.repository.interface';

@Injectable()
export class TestReviewRepository implements ITestReviewRepository {
  constructor(
    @InjectRepository(TestReviewOrmEntity)
    private readonly ormRepository: Repository<TestReviewOrmEntity>,
  ) {}

  private toDomain(entity: TestReviewOrmEntity): TestReview {
    const review = new TestReview(
      entity.testId,
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

  private toOrm(domain: TestReview): TestReviewOrmEntity {
    const entity = new TestReviewOrmEntity();
    entity.id = domain.id;
    entity.testId = domain.testId;
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

  async create(review: TestReview): Promise<TestReview> {
    const ormEntity = this.toOrm(review);
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<TestReview | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTestId(testId: string): Promise<TestReview[]> {
    const entities = await this.ormRepository.find({
      where: { testId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByBlockId(testId: string, blockId: string): Promise<TestReview[]> {
    const entities = await this.ormRepository.find({
      where: { testId, blockId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByStatus(
    testId: string,
    status: ReviewStatus,
  ): Promise<TestReview[]> {
    const entities = await this.ormRepository.find({
      where: { testId, status },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async update(review: TestReview): Promise<TestReview> {
    const ormEntity = this.toOrm(review);
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
