import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ForumQuestionStatus } from './forum-question-status.enum';
import { ForumCommentResponseDto } from './forum-comment-response.dto';

export class ForumQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ enum: ForumQuestionStatus })
  status: ForumQuestionStatus;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

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

  @ApiPropertyOptional({ type: () => [ForumCommentResponseDto] })
  comments?: ForumCommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
