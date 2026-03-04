// lesson/lesson.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonController } from './interfaces/http/lesson.controller';
import { LessonService } from './application/services/lesson.service';
import { LessonFacade } from './application/facades/lesson.facade';
import { LessonRepository } from './infra/repositories/lesson.repository.impl';
import { LessonOrmEntity } from './infra/typeorm/lesson.orm-entity';
import { MapElementOrmEntity } from '../map/infra/typeorm/map-element.orm-entity';
import { LessonDetailsModule } from '../lesson-details/lesson-details.module';
import { MapModule } from '../map/map.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonOrmEntity, MapElementOrmEntity]),
    forwardRef(() => LessonDetailsModule),
    forwardRef(() => MapModule),
  ],
  controllers: [LessonController],
  providers: [
    LessonService,
    LessonFacade,
    {
      provide: 'ILessonRepository',
      useClass: LessonRepository,
    },
    // Добавляем экспорт IMapElementRepository из MapModule
    // Но его нужно будет добавить в exports MapModule
  ],
  exports: [
    LessonService,
    LessonFacade,
  ],
})
export class LessonModule {}