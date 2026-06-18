import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StudentResultResponseDto {
  @ApiProperty({
    description: 'ID результата',
    example: 'result_1234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID студента (client)',
    example: 'client_1234567890_abc123',
  })
  @Expose()
  clientId: string;

  @ApiProperty({
    description: 'ID урока',
    example: 'lesson_123',
    required: false,
  })
  @Expose()
  lessonId?: string | null;

  @ApiProperty({
    description: 'ID контрольной точки',
    example: 'checkpoint_123',
    required: false,
  })
  @Expose()
  checkpointId?: string | null;

  @ApiProperty({
    description: 'ID сущности обучения',
    example: 'lesson_123',
  })
  @Expose()
  targetId: string;

  @ApiProperty({
    description: 'Тип сущности обучения',
    example: 'lesson',
  })
  @Expose()
  targetType: 'lesson' | 'checkpoint';

  @ApiProperty({
    description: 'Количество звезд',
    example: 4,
  })
  @Expose()
  countOfStars: number;

  @ApiProperty({
    description: 'Дата завершения урока',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  completedAt: Date;

  @ApiProperty({
    description: 'Дата создания записи',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления записи',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
