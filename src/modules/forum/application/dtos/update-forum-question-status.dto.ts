import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ForumQuestionStatus } from './forum-question-status.enum';

export class UpdateForumQuestionStatusDto {
  @ApiProperty({ enum: ForumQuestionStatus, example: ForumQuestionStatus.CLOSED })
  @IsEnum(ForumQuestionStatus)
  status: ForumQuestionStatus;
}
