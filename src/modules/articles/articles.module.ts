import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './application/services/articles.service';
import { ArticleCommentOrmEntity } from './infra/typeorm/article-comment.orm-entity';
import { ArticleOrmEntity } from './infra/typeorm/article.orm-entity';
import { ArticlesController } from './interfaces/http/articles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleOrmEntity, ArticleCommentOrmEntity])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
