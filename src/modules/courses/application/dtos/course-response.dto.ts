import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CourseStatus } from '../../domain/entities/course.entity';

export class CourseResponseDto {
  @ApiProperty({
    description: 'ID курса',
    example: 'course_1707234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Название курса',
    example: 'Основы TypeScript',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Подробный курс по основам TypeScript для начинающих',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Тип курса',
    example: 'online',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Язык курса',
    example: 'ru',
  })
  @Expose()
  language: string;

  @ApiProperty({
    description: 'Теги курса',
    example: ['programming', 'typescript', 'beginner'],
    type: [String],
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'URL логотипа',
    example: 'https://example.com/logo.png',
  })
  @Expose()
  logo: string;

  @Expose()
  status: CourseStatus;

  @ApiProperty({
    description: 'ID администратора-создателя',
    example: 'admin_1707234567890_xyz789',
  })
  @Expose()
  adminId: string;

  @ApiProperty({
    description: 'Дата создания',
    example: '2024-02-06T19:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления',
    example: '2024-02-06T19:30:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'Дата публикации (если опубликован)',
    example: '2024-02-06T19:30:00.000Z',
    required: false,
  })
  @Expose()
  publishedAt?: Date;
}
