
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonDetailsController } from './interfaces/http/lesson-details.controller';
import { LessonDetailsService } from './application/services/lesson-details.service';
import { LessonDetailsFacade } from './application/facades/lesson-details.facade';
import { LessonDetailsRepository } from './infra/repositories/lesson-details.repository.impl';
import { LessonSlideRepository } from './infra/repositories/lesson-slide.repository.impl';
import { LessonTestRepository } from './infra/repositories/lesson-test.repository.impl';
import { LessonDetailsOrmEntity } from './infra/typeorm/lesson-details.orm-entity';
import { LessonSlideOrmEntity } from './infra/typeorm/lesson-slide.orm-entity';
import { LessonTestOrmEntity } from './infra/typeorm/lesson-test.orm-entity';
import { LessonOrmEntity } from '@modules/lesson/infra/typeorm/lesson.orm-entity';
import { MapModule } from '@modules/map/map.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonDetailsOrmEntity,
      LessonSlideOrmEntity,
      LessonTestOrmEntity,
      LessonOrmEntity,
    ]),
    forwardRef(() => MapModule),  
  ],
  controllers: [LessonDetailsController],
  providers: [
    LessonDetailsService,
    LessonDetailsFacade,
    {
      provide: 'ILessonDetailsRepository',
      useClass: LessonDetailsRepository,
    },
    {
      provide: 'ILessonSlideRepository',
      useClass: LessonSlideRepository,
    },
    {
      provide: 'ILessonTestRepository',
      useClass: LessonTestRepository,
    },
  ],
  exports: [LessonDetailsService, LessonDetailsFacade],  
})
export class LessonDetailsModule {}
