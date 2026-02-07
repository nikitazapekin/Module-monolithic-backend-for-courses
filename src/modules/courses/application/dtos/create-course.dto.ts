import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum } from 'class-validator';
import { CourseStatusDto } from './course-status.enum';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Название курса',
    example: 'Основы TypeScript',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Подробный курс по основам TypeScript для начинающих',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    description: 'Тип курса (online, offline, hybrid)',
    example: 'online',
  })
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @ApiProperty({
    description: 'Язык курса',
    example: 'ru',
  })
  @IsString()
  @IsNotEmpty({ message: 'Language is required' })
  language: string;

  @ApiProperty({
    description: 'Теги курса',
    example: ['programming', 'typescript', 'beginner'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({
    description: 'URL логотипа курса',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsNotEmpty({ message: 'Logo is required' })
  logo: string;

  @ApiProperty({
    description: 'Статус курса',
    enum: CourseStatusDto,
    example: CourseStatusDto.DRAFT,
    required: false,
    default: CourseStatusDto.DRAFT,
  })
  @IsEnum(CourseStatusDto)
  @IsOptional()
  status?: CourseStatusDto = CourseStatusDto.DRAFT;
}
