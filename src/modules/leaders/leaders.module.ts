import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadersController } from './interfaces/http/leaders.controller';
import { LeadersService } from './application/services/leaders.service';
import { LeaderOrmEntity } from './infra/typeorm/leader.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';
import { StudentLevelOrmEntity } from '../coding-tasks/infra/typeorm/student-level.orm-entity';
import { AvatarOrmEntity } from '../profile/infra/typeorm/avatar.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaderOrmEntity,
      ClientOrmEntity,
      StudentLevelOrmEntity,
      AvatarOrmEntity,
    ]),
  ],
  controllers: [LeadersController],
  providers: [LeadersService],
  exports: [LeadersService],
})
export class LeadersModule {}
