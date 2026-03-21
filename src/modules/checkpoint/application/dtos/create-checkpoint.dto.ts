import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { CheckpointType } from '../../domain/entities/checkpoint.entity';

export class CreateCheckpointDto {
  @ApiProperty({
    description: 'ID элемента карты',
    example: 'map_element_1707234567890_abc123',
  })
  @IsString()
  mapElementId: string;

  @ApiProperty({
    description: 'Название контрольной точки',
    example: 'Контрольная точка 1: Основы JavaScript',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание контрольной точки',
    example: 'Проверка знаний по основам JavaScript',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Тип контрольной точки',
    enum: CheckpointType,
    example: CheckpointType.QUIZ,
  })
  @IsEnum(CheckpointType)
  type: CheckpointType;

  @ApiProperty({
    description: 'Проходной балл',
    required: false,
    example: 70,
  })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({
    description: 'Максимальное количество попыток',
    required: false,
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Лимит времени в минутах',
    required: false,
    example: 60,
  })
  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @ApiProperty({
    description: 'Инструкции для выполнения',
    required: false,
  })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({
    description: 'Опубликована ли контрольная точка',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
