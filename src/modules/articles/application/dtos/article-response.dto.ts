import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleCommentResponseDto } from './article-comment-response.dto';
import { ArticleContentBlockDto } from './create-article.dto';

export class ArticleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ type: () => [ArticleContentBlockDto] })
  contentBlocks: ArticleContentBlockDto[];

  @ApiProperty()
  excerpt: string;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  dislikes: number;

  @ApiProperty()
  hasLiked: boolean;

  @ApiProperty()
  hasDisliked: boolean;

  @ApiProperty()
  commentsCount: number;

  @ApiPropertyOptional({ type: () => [ArticleCommentResponseDto] })
  comments?: ArticleCommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
