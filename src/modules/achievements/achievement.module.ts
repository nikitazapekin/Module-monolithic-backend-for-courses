import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementController } from './interfaces/http/achievement.controller';
import { AchievementService } from './application/services/achievement.service';
import { AchievementRepository } from './infra/repositories/achievement.repository.impl';
import { AchievementOrmEntity } from './infra/typeorm/achievement.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';
import { StudentResultOrmEntity } from '../profile/infra/typeorm/student-result.orm-entity';
import { StudentLevelOrmEntity } from '../coding-tasks/infra/typeorm/student-level.orm-entity';
import { SolvedTaskOrmEntity } from '../coding-tasks/infra/typeorm/solved-task.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AchievementOrmEntity,
      ClientOrmEntity,
      StudentResultOrmEntity,
      StudentLevelOrmEntity,
      SolvedTaskOrmEntity,
    ]),
  ],
  controllers: [AchievementController],
  providers: [
    AchievementService,
    {
      provide: 'IAchievementRepository',
      useClass: AchievementRepository,
    },
  ],
  exports: [AchievementService, TypeOrmModule],
})
export class AchievementsModule {}
