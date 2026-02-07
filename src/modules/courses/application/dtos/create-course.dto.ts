import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum } from 'class-validator';
import { CourseStatus } from '../../domain/entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Название курса',
    example: 'Основы TypeScript',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Подробный курс по основам TypeScript для начинающих',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Тип курса (online, offline, hybrid)',
    example: 'online',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Язык курса',
    example: 'ru',
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    description: 'Теги курса',
    example: ['programming', 'typescript', 'beginner'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'URL логотипа курса',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsNotEmpty()
  logo: string;
 
  @IsOptional()
  status?: CourseStatus;
}
