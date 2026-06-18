import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateForumQuestionDto {
  @ApiProperty({ example: 'Как исправить ошибку в NestJS guard?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: 'При авторизации получаю 401, хотя токен валидный.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: ['nestjs', 'auth', 'jwt'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];
}
