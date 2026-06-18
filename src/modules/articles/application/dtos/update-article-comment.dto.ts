import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateArticleCommentDto {
  @ApiProperty({ example: 'Добавил уточнение про миграции и транзакции.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
