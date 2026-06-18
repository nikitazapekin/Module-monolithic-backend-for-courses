import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementOrmEntity } from '../../infra/typeorm/announcement.orm-entity';
import { Announcement } from '../../domain/entities/announcement.entity';

@Injectable()
export class AnnouncementRepository {
  constructor(
    @InjectRepository(AnnouncementOrmEntity)
    private readonly announcementRepository: Repository<AnnouncementOrmEntity>,
  ) {
    console.log('AnnouncementRepository initialized');
    console.log('Repository:', this.announcementRepository);
  }

  async findAll(): Promise<Announcement[]> {
    console.log('Finding all announcements...');
    const entities = await this.announcementRepository.find({
      order: { createdAt: 'DESC' },
    });

    console.log('Found entities:', entities);
    return entities.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Announcement | null> {
    console.log('Finding announcement by id:', id);
    const entity = await this.announcementRepository.findOne({
      where: { id },
    });

    console.log('Found entity:', entity);
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByAdminId(adminId: string): Promise<Announcement[]> {
    console.log('Finding announcements by adminId:', adminId);
    const entities = await this.announcementRepository.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
    });

    console.log('Found entities:', entities);
    return entities.map(this.mapToDomain);
  }

  async create(
    announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Announcement> {
    console.log('Creating announcement:', announcement);
    const id = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entity = this.announcementRepository.create({
      ...announcement,
      id,
    });
    console.log('Created entity:', entity);

    const saved = await this.announcementRepository.save(entity);
    console.log('Saved entity:', saved);

    return this.mapToDomain(saved);
  }

  async update(
    id: string,
    announcement: Partial<Announcement>,
  ): Promise<Announcement | null> {
    console.log('Updating announcement:', id, announcement);
    await this.announcementRepository.update(id, announcement);
    const entity = await this.announcementRepository.findOne({
      where: { id },
    });

    console.log('Updated entity:', entity);
    return entity ? this.mapToDomain(entity) : null;
  }

  async delete(id: string): Promise<boolean> {
    console.log('Deleting announcement:', id);
    const result = await this.announcementRepository.delete(id);
    console.log('Delete result:', result);
    return (result.affected ?? 0) > 0;
  }

  private mapToDomain(entity: AnnouncementOrmEntity): Announcement {
    return new Announcement(
      entity.id,
      entity.adminId,
      entity.title,
      entity.content,
      entity.author,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
