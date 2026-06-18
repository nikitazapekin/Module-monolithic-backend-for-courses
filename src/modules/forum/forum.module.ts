import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumService } from './application/services/forum.service';
import { ForumCommentOrmEntity } from './infra/typeorm/forum-comment.orm-entity';
import { ForumQuestionOrmEntity } from './infra/typeorm/forum-question.orm-entity';
import { ForumController } from './interfaces/http/forum.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForumQuestionOrmEntity, ForumCommentOrmEntity]),
  ],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
