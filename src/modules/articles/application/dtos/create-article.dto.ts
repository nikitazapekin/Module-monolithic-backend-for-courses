import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleContentBlockDto {
  @ApiProperty({ example: 'text' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: { text: 'Полезный материал по TypeScript.' } })
  @IsObject()
  data: Record<string, any>;
}

export class CreateArticleDto {
  @ApiProperty({ example: 'Как структурировать монолит на NestJS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: ['nestjs', 'architecture', 'backend'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ type: () => [ArticleContentBlockDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ArticleContentBlockDto)
  contentBlocks: ArticleContentBlockDto[];
}
