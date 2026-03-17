import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonDetailsRepository } from '../../domain/interfaces/lesson-details.repository.interface';
import { LessonDetails } from '../../domain/entities/lesson-details.entity';
import { LessonDetailsOrmEntity } from '../typeorm/lesson-details.orm-entity';

@Injectable()
export class LessonDetailsRepository implements ILessonDetailsRepository {
  constructor(
    @InjectRepository(LessonDetailsOrmEntity)
    private readonly repo: Repository<LessonDetailsOrmEntity>,
  ) {}

  async create(details: LessonDetails): Promise<LessonDetails> {
    const entity = this.toOrm(details);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<LessonDetails | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByLessonId(lessonId: string): Promise<LessonDetails | null> {
    const entity = await this.repo.findOne({ where: { lessonId } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(id: string, updates: Partial<LessonDetails>): Promise<boolean> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return false;
    Object.assign(entity, updates);
    entity.updatedAt = new Date();
    await this.repo.save(entity);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected! > 0;
  }

  async deleteByLessonId(lessonId: string): Promise<boolean> {
    const result = await this.repo.delete({ lessonId });
    return result.affected! > 0;
  }

  private toDomain(entity: LessonDetailsOrmEntity): LessonDetails {
    const d = new LessonDetails(entity.lessonId, entity.id);
    d.createdAt = entity.createdAt;
    d.updatedAt = entity.updatedAt;
    return d;
  }

  private toOrm(details: LessonDetails): LessonDetailsOrmEntity {
    const entity = new LessonDetailsOrmEntity();
    entity.id = details.id;
    entity.lessonId = details.lessonId;
    entity.createdAt = details.createdAt;
    entity.updatedAt = details.updatedAt;
    return entity;
  }
}
