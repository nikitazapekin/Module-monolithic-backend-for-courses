import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarController } from './interfaces/http/avatar.controller';
import { StudentResultController } from './interfaces/http/student-result.controller';
import { AvatarService } from './application/services/avatar.service';
import { StudentResultService } from './application/services/student-result.service';
import { AvatarRepository } from './infra/repositories/avatar.repository.impl';
import { StudentResultRepository } from './infra/repositories/student-result.repository.impl';
import { AvatarOrmEntity } from './infra/typeorm/avatar.orm-entity';
import { StudentResultOrmEntity } from './infra/typeorm/student-result.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvatarOrmEntity,
      StudentResultOrmEntity,
    ]),
  ],
  controllers: [
    AvatarController,
    StudentResultController,
  ],
  providers: [
    AvatarService,
    StudentResultService,
    {
      provide: 'IAvatarRepository',
      useClass: AvatarRepository,
    },
    {
      provide: 'IStudentResultRepository',
      useClass: StudentResultRepository,
    },
  ],
  exports: [
    AvatarService,
    StudentResultService,
    TypeOrmModule,
  ],
})
export class ProfileModule {}
