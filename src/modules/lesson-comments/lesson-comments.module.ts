// lesson-comments/lesson-comments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonCommentController } from './interfaces/http/lesson-comment.controller';
import { LessonCommentService } from './application/services/lesson-comment.service';
import { LessonCommentFacade } from './application/facades/lesson-comment.facade';
import { LessonCommentRepository } from './infra/repositories/lesson-comment.repository.impl';
import { LessonCommentOrmEntity } from './infra/typeorm/lesson-comment.orm-entity';
import { LessonDetailsOrmEntity } from '@modules/lesson-details/infra/typeorm/lesson-details.orm-entity';
import { StudentResultOrmEntity } from '@modules/profile/infra/typeorm/student-result.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonCommentOrmEntity,
      LessonDetailsOrmEntity,
      StudentResultOrmEntity,
    ]),
  ],
  controllers: [LessonCommentController],
  providers: [
    LessonCommentService,
    LessonCommentFacade,
    {
      provide: 'ILessonCommentRepository',
      useClass: LessonCommentRepository,
    },
  ],
  exports: [LessonCommentService, LessonCommentFacade],
})
export class LessonCommentsModule {}
