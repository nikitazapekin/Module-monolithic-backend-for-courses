import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './interfaces/http/course.controller';
import { CourseService } from './application/services/course.service';
import { CourseFacade } from './application/facades/course.facade';
import { CourseRepository } from './infra/repositories/course.repository.impl';
import { CourseOrmEntity } from './infra/typeorm/course.orm-entity';
import { AdminOrmEntity } from '../auth/infra/typeorm/admin.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseOrmEntity, AdminOrmEntity]),
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
