import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArticleCommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  articleId: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  dislikes: number;

  @ApiProperty()
  hasLiked: boolean;

  @ApiProperty()
  hasDisliked: boolean;

  @ApiProperty({ type: () => [ArticleCommentResponseDto] })
  replies: ArticleCommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
