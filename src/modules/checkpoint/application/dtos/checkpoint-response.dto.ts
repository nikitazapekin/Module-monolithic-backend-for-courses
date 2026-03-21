import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CheckpointType } from '../../domain/entities/checkpoint.entity';

export class CheckpointResponseDto {
  @ApiProperty({
    description: 'ID контрольной точки',
    example: 'checkpoint_1707234567890_abc123',
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
    description: 'Название контрольной точки',
    example: 'Контрольная точка 1: Основы JavaScript',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Описание контрольной точки',
    example: 'Проверка знаний по основам JavaScript',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Тип контрольной точки',
    enum: CheckpointType,
    example: CheckpointType.QUIZ,
  })
  @Expose()
  type: CheckpointType;

  @ApiProperty({
    description: 'Проходной балл',
    required: false,
  })
  @Expose()
  passingScore?: number;

  @ApiProperty({
    description: 'Максимальное количество попыток',
    required: false,
  })
  @Expose()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Лимит времени в минутах',
    required: false,
  })
  @Expose()
  timeLimit?: number;

  @ApiProperty({
    description: 'Инструкции для выполнения',
    required: false,
  })
  @Expose()
  instructions?: string;

  @ApiProperty({
    description: 'Опубликована ли контрольная точка',
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
