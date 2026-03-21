import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LessonResponseDto {
  @ApiProperty({
    description: 'ID урока',
    example: 'lesson_1707234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID элемента карты',
    example: 'map_element_1707234567890_abc123',
  })
  @Expose()
  mapElementId: string;

  @ApiProperty({
    description: 'Название урока',
    example: 'Введение в программирование',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Описание урока',
    example: 'Основные концепции программирования',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Содержимое урока',
    required: false,
  })
  @Expose()
  content?: string;

  @ApiProperty({
    description: 'Длительность урока в минутах',
    required: false,
  })
  @Expose()
  duration?: number;

  @ApiProperty({
    description: 'Порядковый номер урока',
    example: 1,
  })
  @Expose()
  orderIndex: number;

  @ApiProperty({
    description: 'Опубликован ли урок',
    example: true,
  })
  @Expose()
  isPublished: boolean;

  @ApiProperty({
    description: 'Дата создания',
    example: '2024-02-06T19:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления',
    example: '2024-02-06T19:30:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
