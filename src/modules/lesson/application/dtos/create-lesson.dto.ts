import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'ID элемента карты',
    example: 'map_element_1707234567890_abc123',
  })
  @IsString()
  mapElementId: string;

  @ApiProperty({
    description: 'Название урока',
    example: 'Введение в программирование',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание урока',
    example: 'Основные концепции программирования',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Содержимое урока (HTML/Markdown)',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Длительность урока в минутах',
    required: false,
    example: 60,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Порядковый номер урока',
    example: 1,
  })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({
    description: 'Опубликован ли урок',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
