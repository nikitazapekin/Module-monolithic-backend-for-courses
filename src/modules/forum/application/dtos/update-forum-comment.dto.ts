import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateForumCommentDto {
  @ApiProperty({ example: 'Проблема была в неверном bearer token header.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
