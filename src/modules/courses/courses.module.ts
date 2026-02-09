import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './interfaces/http/course.controller';
import { CourseService } from './application/services/course.service';
import { CourseFacade } from './application/facades/course.facade';
import { CourseRepository } from './infra/repositories/course.repository.impl';
import { CourseOrmEntity } from './infra/typeorm/course.orm-entity';
import { AdminOrmEntity } from '../auth/infra/typeorm/admin.orm-entity';
import { MapModule } from '@modules/map/map.module';
import { LessonModule } from '@modules/lesson/lesson.module';
import { CheckpointModule } from '@modules/checkpoint/checkpoint.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseOrmEntity, AdminOrmEntity]),

    MapModule , 
 

    
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseFacade,
    {
      provide: 'ICourseRepository',
      useClass: CourseRepository,
    },
  ],
  exports: [
    CourseService,
    CourseFacade,
  ],
})
export class CoursesModule {}
