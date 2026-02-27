import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarController } from './interfaces/http/avatar.controller';
import { StudentResultController } from './interfaces/http/student-result.controller';
import { ProfileInfoController } from './interfaces/http/profile-info.controller';
import { AvatarService } from './application/services/avatar.service';
import { StudentResultService } from './application/services/student-result.service';
import { ProfileInfoService } from './application/services/profile-info.service';
import { AvatarRepository } from './infra/repositories/avatar.repository.impl';
import { StudentResultRepository } from './infra/repositories/student-result.repository.impl';
import { ProfileInfoRepository } from './infra/repositories/profile-info.repository.impl';
import { AvatarOrmEntity } from './infra/typeorm/avatar.orm-entity';
import { StudentResultOrmEntity } from './infra/typeorm/student-result.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../auth/infra/typeorm/auditory.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvatarOrmEntity,
      StudentResultOrmEntity,
      ClientOrmEntity,
      AuditoryOrmEntity,
    ]),
  ],
  controllers: [
    AvatarController,
    StudentResultController,
    ProfileInfoController,
  ],
  providers: [
    AvatarService,
    StudentResultService,
    ProfileInfoService,
    {
      provide: 'IAvatarRepository',
      useClass: AvatarRepository,
    },
    {
      provide: 'IStudentResultRepository',
      useClass: StudentResultRepository,
    },
    ProfileInfoRepository,
  ],
  exports: [
    AvatarService,
    StudentResultService,
    ProfileInfoService,
    TypeOrmModule,
  ],
})
export class ProfileModule {}
