import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseMapController } from './interfaces/http/course-map.controller';
import { CourseMapService } from './application/services/course-map.service';
import { CourseMapFacade } from './application/facades/course-map.facade';
import { CourseMapRepository } from './infra/repositories/course-map.repository.impl';
import { CourseMapOrmEntity } from './infra/typeorm/course-map.orm-entity';
import { MapElementOrmEntity } from './infra/typeorm/map-element.orm-entity';
import { CourseOrmEntity } from '../courses/infra/typeorm/course.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseMapOrmEntity, MapElementOrmEntity, CourseOrmEntity]),
  ],
  controllers: [CourseMapController],
  providers: [
    CourseMapService,
    CourseMapFacade,
    {
      provide: 'ICourseMapRepository',
      useClass: CourseMapRepository,
    },
  ],
  exports: [
    CourseMapService,
    CourseMapFacade,
  ],
})
export class MapModule {}
