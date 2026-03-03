import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarController } from './interfaces/http/avatar.controller';
import { StudentResultController } from './interfaces/http/student-result.controller';
import { ProfileInfoController } from './interfaces/http/profile-info.controller';
import { AvatarService } from './application/services/avatar.service';
import { StudentResultService } from './application/services/student-result.service';
import { ProfileInfoService } from './application/services/profile-info.service';
import { CourseSubscriptionService } from './application/services/course-subscription.service';
import { AvatarRepository } from './infra/repositories/avatar.repository.impl';
import { StudentResultRepository } from './infra/repositories/student-result.repository.impl';
import { CourseSubscriptionRepository } from './infra/repositories/course-subscription.repository.impl';
import { ProfileInfoRepository } from './infra/repositories/profile-info.repository.impl';
import { AvatarOrmEntity } from './infra/typeorm/avatar.orm-entity';
import { StudentResultOrmEntity } from './infra/typeorm/student-result.orm-entity';
import { CourseSubscriptionOrmEntity } from './infra/typeorm/course-subscription.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../auth/infra/typeorm/auditory.orm-entity';
import { CourseOrmEntity } from '../courses/infra/typeorm/course.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvatarOrmEntity,
      StudentResultOrmEntity,
      CourseSubscriptionOrmEntity,
      CourseOrmEntity,
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
    CourseSubscriptionService,
    {
      provide: 'IAvatarRepository',
      useClass: AvatarRepository,
    },
    {
      provide: 'IStudentResultRepository',
      useClass: StudentResultRepository,
    },
    {
      provide: 'ICourseSubscriptionRepository',
      useClass: CourseSubscriptionRepository,
    },
    ProfileInfoRepository,
  ],
  exports: [
    AvatarService,
    StudentResultService,
    ProfileInfoService,
    CourseSubscriptionService,
    TypeOrmModule,
  ],
})
export class ProfileModule {}
