import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonDetailsController } from './interfaces/http/lesson-details.controller';
import { ReviewController } from './interfaces/http/review.controller';
import { LessonDetailsService } from './application/services/lesson-details.service';
import { ReviewService } from './application/services/review.service';
import { LessonDetailsFacade } from './application/facades/lesson-details.facade';
import { LessonDetailsRepository } from './infra/repositories/lesson-details.repository.impl';
import { LessonSlideRepository } from './infra/repositories/lesson-slide.repository.impl';
import { LessonTestRepository } from './infra/repositories/lesson-test.repository.impl';
import { SlideReviewRepository } from './infra/repositories/slide-review.repository.impl';
import { TestReviewRepository } from './infra/repositories/test-review.repository.impl';
import { LessonDetailsOrmEntity } from './infra/typeorm/lesson-details.orm-entity';
import { LessonSlideOrmEntity } from './infra/typeorm/lesson-slide.orm-entity';
import { LessonTestOrmEntity } from './infra/typeorm/lesson-test.orm-entity';
import { SlideReviewOrmEntity } from './infra/typeorm/slide-review.orm-entity';
import { TestReviewOrmEntity } from './infra/typeorm/test-review.orm-entity';
import { LessonOrmEntity } from '@modules/lesson/infra/typeorm/lesson.orm-entity';
import { CheckpointOrmEntity } from '@modules/checkpoint/infra/typeorm/checkpoint.orm-entity';
import { MapModule } from '@modules/map/map.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonDetailsOrmEntity,
      LessonSlideOrmEntity,
      LessonTestOrmEntity,
      SlideReviewOrmEntity,
      TestReviewOrmEntity,
      LessonOrmEntity,
      CheckpointOrmEntity,
    ]),
    forwardRef(() => MapModule),
  ],
  controllers: [LessonDetailsController, ReviewController],
  providers: [
    LessonDetailsService,
    ReviewService,
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
    {
      provide: 'ISlideReviewRepository',
      useClass: SlideReviewRepository,
    },
    {
      provide: 'ITestReviewRepository',
      useClass: TestReviewRepository,
    },
  ],
  exports: [LessonDetailsService, LessonDetailsFacade, ReviewService],
})
export class LessonDetailsModule {}
