import { ApiProperty } from '@nestjs/swagger';
import { ForumQuestionResponseDto } from './forum-question-response.dto';

export class ForumQuestionsListResponseDto {
  @ApiProperty({ type: () => [ForumQuestionResponseDto] })
  items: ForumQuestionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pages: number;
}
