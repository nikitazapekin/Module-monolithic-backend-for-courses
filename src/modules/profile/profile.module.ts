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
import { LessonOrmEntity } from '../lesson/infra/typeorm/lesson.orm-entity';
import { CourseMapOrmEntity } from '../map/infra/typeorm/course-map.orm-entity';
import { MapElementOrmEntity } from '../map/infra/typeorm/map-element.orm-entity';
import { LessonRepository } from '../lesson/infra/repositories/lesson.repository.impl';
import { CourseMapRepository } from '../map/infra/repositories/course-map.repository.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvatarOrmEntity,
      StudentResultOrmEntity,
      CourseSubscriptionOrmEntity,
      CourseOrmEntity,
      ClientOrmEntity,
      AuditoryOrmEntity,
      LessonOrmEntity,
      CourseMapOrmEntity,
      MapElementOrmEntity,
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
    {
      provide: 'ILessonRepository',
      useClass: LessonRepository,
    },
    {
      provide: 'ICourseMapRepository',
      useClass: CourseMapRepository,
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
