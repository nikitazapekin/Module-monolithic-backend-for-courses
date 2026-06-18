import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementService } from './application/services/announcement.service';
import { AnnouncementController } from './interfaces/http/announcement.controller';
import { AnnouncementOrmEntity } from './infra/typeorm/announcement.orm-entity';
import { AnnouncementRepository } from './infra/repositories/announcement.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncementOrmEntity])],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, AnnouncementRepository],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
