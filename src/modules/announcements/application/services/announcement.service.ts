import { Injectable } from '@nestjs/common';
import { AnnouncementRepository } from '../../infra/repositories/announcement.repository.impl';
import { Announcement } from '../../domain/entities/announcement.entity';
import { CreateAnnouncementDto } from '../dtos/announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.findAll();
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return this.announcementRepository.findById(id);
  }

  async getAnnouncementsByAdminId(adminId: string): Promise<Announcement[]> {
    return this.announcementRepository.findByAdminId(adminId);
  }

  async createAnnouncement(
    adminId: string,
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = await this.announcementRepository.create({
      adminId,
      title: createAnnouncementDto.title,
      content: createAnnouncementDto.content,
      author: 'Admin',
    });

    return announcement;
  }

  async updateAnnouncement(
    id: string,
    updateAnnouncementDto: Partial<CreateAnnouncementDto>,
  ): Promise<Announcement | null> {
    return this.announcementRepository.update(id, updateAnnouncementDto);
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcementRepository.delete(id);
  }
}
