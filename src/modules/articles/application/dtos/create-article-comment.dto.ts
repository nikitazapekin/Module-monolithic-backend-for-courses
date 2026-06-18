import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleCommentDto {
  @ApiProperty({ example: 'Хороший пример, особенно блок с JSON-схемой.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'article_comment_123' })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
