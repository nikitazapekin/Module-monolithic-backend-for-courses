import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAchievementRepository } from '../../domain/interfaces/achievement.repository.interface';
import {
  Achievement,
  AchievementType,
  AchievementTier,
} from '../../domain/entities/achievement.entity';
import { AchievementOrmEntity } from '../typeorm/achievement.orm-entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class AchievementRepository implements IAchievementRepository {
  constructor(
    @InjectRepository(AchievementOrmEntity)
    private readonly achievementRepository: Repository<AchievementOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  async findById(id: string): Promise<Achievement | null> {
    const entity = await this.achievementRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<Achievement[]> {
    const entities = await this.achievementRepository.find({
      where: { clientId },
      order: { earnedAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByClientIdAndType(
    clientId: string,
    type: AchievementType,
  ): Promise<Achievement[]> {
    const entities = await this.achievementRepository.find({
      where: { clientId, type },
      order: { earnedAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async save(achievement: Achievement): Promise<Achievement> {
    const entity = this.toOrmEntity(achievement);
    const saved = await this.achievementRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<Achievement>): Promise<boolean> {
    const result = await this.achievementRepository.update(id, updates);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.achievementRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await this.achievementRepository.delete({ clientId });
    return (result.affected ?? 0) > 0;
  }

  async exists(clientId: string, tier: AchievementTier): Promise<boolean> {
    const count = await this.achievementRepository.count({
      where: { clientId, tier },
    });
    return count > 0;
  }

  private toDomain(entity: AchievementOrmEntity): Achievement {
    const achievement = new Achievement(
      entity.clientId,
      entity.type,
      entity.tier,
      entity.title,
      entity.description,
      entity.image || '',
    );

    Object.assign(achievement, {
      id: entity.id,
      earnedAt: entity.earnedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return achievement;
  }

  private toOrmEntity(achievement: Achievement): AchievementOrmEntity {
    const entity = new AchievementOrmEntity();
    entity.id = achievement.id;
    entity.clientId = achievement.clientId;
    entity.type = achievement.type;
    entity.tier = achievement.tier;
    entity.title = achievement.title;
    entity.description = achievement.description;
    entity.image = achievement.image;
    entity.earnedAt = achievement.earnedAt;
    entity.createdAt = achievement.createdAt;
    entity.updatedAt = achievement.updatedAt;

    return entity;
  }
}
