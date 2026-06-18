import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateForumCommentDto {
  @ApiProperty({ example: 'Проверь, что guard использует payload.sub, а не userId.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'forum_comment_123' })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
