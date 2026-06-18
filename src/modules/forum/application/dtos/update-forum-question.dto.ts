import { PartialType } from '@nestjs/swagger';
import { CreateForumQuestionDto } from './create-forum-question.dto';

export class UpdateForumQuestionDto extends PartialType(
  CreateForumQuestionDto,
) {}
