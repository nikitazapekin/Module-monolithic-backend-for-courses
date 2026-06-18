import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICheckpointRepository } from '../../domain/interfaces/checkpoint.repository.interface';
import { Checkpoint } from '../../domain/entities/checkpoint.entity';
import {
  CheckpointOrmEntity,
  CheckpointType as OrmCheckpointType,
} from '../typeorm/checkpoint.orm-entity';

@Injectable()
export class CheckpointRepository implements ICheckpointRepository {
  constructor(
    @InjectRepository(CheckpointOrmEntity)
    private readonly checkpointRepository: Repository<CheckpointOrmEntity>,
  ) {}

  async create(checkpoint: Checkpoint): Promise<Checkpoint> {
    const entity = this.toOrmEntity(checkpoint);
    const saved = await this.checkpointRepository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Checkpoint | null> {
    const entity = await this.checkpointRepository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMapElementId(mapElementId: string): Promise<Checkpoint | null> {
    const entity = await this.checkpointRepository.findOne({
      where: { mapElementId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAllByCourseMapId(courseMapId: string): Promise<Checkpoint[]> {
    const entities = await this.checkpointRepository
      .createQueryBuilder('checkpoint')
      .leftJoin('checkpoint.mapElement', 'mapElement')
      .where('mapElement.courseMapId = :courseMapId', { courseMapId })
      .orderBy('checkpoint.createdAt', 'ASC')
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async update(id: string, updates: Partial<Checkpoint>): Promise<boolean> {
    const entity = await this.checkpointRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return false;
    }

    Object.assign(entity, updates);
    entity.updatedAt = new Date();

    await this.checkpointRepository.save(entity);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.checkpointRepository.delete(id);
    return result.affected! > 0;
  }

  async deleteByMapElementId(mapElementId: string): Promise<boolean> {
    const result = await this.checkpointRepository.delete({ mapElementId });
    return result.affected! > 0;
  }

  private toDomain(entity: CheckpointOrmEntity): Checkpoint {
    return new Checkpoint(
      entity.mapElementId,
      entity.title,
      entity.description,
      entity.type,
      entity.orderIndex,
      entity.passingScore,
      entity.maxAttempts,
      entity.timeLimit,
      entity.instructions,
      entity.isPublished,
      entity.id,
    );
  }

  private toOrmEntity(checkpoint: Checkpoint): CheckpointOrmEntity {
    const entity = new CheckpointOrmEntity();
    entity.id = checkpoint.id;
    entity.mapElementId = checkpoint.mapElementId;
    entity.title = checkpoint.title;
    entity.description = checkpoint.description;
    entity.type = checkpoint.type as OrmCheckpointType;
    entity.orderIndex = checkpoint.orderIndex;
    entity.passingScore = checkpoint.passingScore;
    entity.maxAttempts = checkpoint.maxAttempts;
    entity.timeLimit = checkpoint.timeLimit;
    entity.instructions = checkpoint.instructions;
    entity.isPublished = checkpoint.isPublished;
    entity.createdAt = checkpoint.createdAt;
    entity.updatedAt = checkpoint.updatedAt;

    return entity;
  }
}
