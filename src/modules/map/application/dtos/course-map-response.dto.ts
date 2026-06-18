import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MapElementDto } from './map-element.dto';

export class CourseMapResponseDto {
  @ApiProperty({
    description: 'ID карты курса',
    example: 'course_map_1707234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID курса',
    example: 'course_1707234567890_abc123',
  })
  @Expose()
  courseId: string;

  @ApiProperty({
    description: 'Ширина карты',
    example: 800,
  })
  @Expose()
  width: number;

  @ApiProperty({
    description: 'Высота карты',
    example: 600,
  })
  @Expose()
  height: number;

  @ApiProperty({
    description: 'Цвет фона',
    example: '#ffffff',
  })
  @Expose()
  backgroundColor: string;

  @ApiProperty({
    description: 'Фоновое изображение (base64)',
    required: false,
  })
  @Expose()
  backgroundImage?: string;

  @ApiProperty({
    description: 'Повторение фона',
    example: 'no-repeat',
  })
  @Expose()
  backgroundRepeat: string;

  @ApiProperty({
    description: 'Размер фона',
    example: 'cover',
  })
  @Expose()
  backgroundSize: string;

  @ApiProperty({
    description: 'Элементы карты',
    type: [MapElementDto],
  })
  @Expose()
  elements: MapElementDto[];

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
