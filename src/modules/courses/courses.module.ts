import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './interfaces/http/course.controller';
import { CourseService } from './application/services/course.service';
import { CourseFacade } from './application/facades/course.facade';
import { CourseRepository } from './infra/repositories/course.repository.impl';
import { CourseOrmEntity } from './infra/typeorm/course.orm-entity';
import { AdminOrmEntity } from '../auth/infra/typeorm/admin.orm-entity';
import { AuditoryOrmEntity } from '../auth/infra/typeorm/auditory.orm-entity';
import { MapModule } from '@modules/map/map.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseOrmEntity,
      AdminOrmEntity,
      AuditoryOrmEntity, // Добавляем если нужно
    ]),
    MapModule, // Импортируем MapModule
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
  exports: [CourseService, CourseFacade],
})
export class CoursesModule {}
