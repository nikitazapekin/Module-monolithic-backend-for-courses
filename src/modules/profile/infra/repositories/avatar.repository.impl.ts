import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAvatarRepository } from '../../domain/interfaces/avatar.repository.interface';
import { Avatar } from '../../domain/entities/avatar.entity';
import { AvatarOrmEntity } from '../typeorm/avatar.orm-entity';

@Injectable()
export class AvatarRepository implements IAvatarRepository {
  constructor(
    @InjectRepository(AvatarOrmEntity)
    private readonly avatarRepository: Repository<AvatarOrmEntity>,
  ) {}

  async findById(id: string): Promise<Avatar | null> {
    const entity = await this.avatarRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByAuditoryId(auditoryId: string): Promise<Avatar | null> {
    const entity = await this.avatarRepository.findOne({
      where: { auditoryId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async save(avatar: Avatar): Promise<Avatar> {
    const entity = this.toOrmEntity(avatar);
    const saved = await this.avatarRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<Avatar>): Promise<boolean> {
    const result = await this.avatarRepository.update(id, updates);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.avatarRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByAuditoryId(auditoryId: string): Promise<boolean> {
    const result = await this.avatarRepository.delete({ auditoryId });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(entity: AvatarOrmEntity): Avatar {
    const avatar = new Avatar(
      entity.auditoryId,
      entity.imageData,
      entity.mimeType,
      entity.fileSize,
    );

    Object.assign(avatar, {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return avatar;
  }

  private toOrmEntity(avatar: Avatar): AvatarOrmEntity {
    const entity = new AvatarOrmEntity();
    entity.id = avatar.id;
    entity.auditoryId = avatar.auditoryId;
    entity.imageData = avatar.imageData;
    entity.mimeType = avatar.mimeType;
    entity.fileSize = avatar.fileSize;
    entity.createdAt = avatar.createdAt;
    entity.updatedAt = avatar.updatedAt;

    return entity;
  }
}
