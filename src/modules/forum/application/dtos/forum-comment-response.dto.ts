import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForumCommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionId: string;

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

  @ApiProperty({ type: () => [ForumCommentResponseDto] })
  replies: ForumCommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
