import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, IsBoolean, IsEnum } from 'class-validator';
import { MapElementType, PositioningType } from '../../domain/entities/map-element-types.enum';
import { CheckpointType } from '@modules/checkpoint/domain/entities/checkpoint.entity';

export class CreateMapElementDto {
  @ApiProperty({
    description: 'Тип элемента',
    enum: MapElementType,
    example: MapElementType.LESSON,
  })
  @IsIn(Object.values(MapElementType))
  type: MapElementType;

  @ApiProperty({
    description: 'Заголовок элемента',
    example: 'Контрольная точка 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Текст элемента (для текстовых элементов)',
    example: 'Основы программирования',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Цвет элемента',
    example: '#ff0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'URL изображения',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Эмодзи',
    example: '😀',
    required: false,
  })
  @IsString()
  @IsOptional()
  emoji?: string;

  @ApiProperty({
    description: 'Размер шрифта',
    example: 16,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fontSize?: number;

  @ApiProperty({
    description: 'Семейство шрифтов',
    example: 'Arial, sans-serif',
    required: false,
  })
  @IsString()
  @IsOptional()
  fontFamily?: string;

  @ApiProperty({
    description: 'Насыщенность шрифта',
    example: 'bold',
    required: false,
  })
  @IsString()
  @IsOptional()
  fontWeight?: string;

  @ApiProperty({
    description: 'Стиль шрифта',
    example: 'italic',
    required: false,
  })
  @IsString()
  @IsOptional()
  fontStyle?: string;

  @ApiProperty({
    description: 'Позиция X (в процентах для free или пикселях)',
    example: 50,
  })
  @IsNumber()
  positionX: number;

  @ApiProperty({
    description: 'Позиция Y (в процентах для free или пикселях)',
    example: 50,
  })
  @IsNumber()
  positionY: number;

  @ApiProperty({
    description: 'Тип позиционирования',
    enum: ['left', 'center', 'right', 'free'],
    example: 'free',
  })
  @IsIn(['left', 'center', 'right', 'free'])
  positioning: PositioningType;

  @ApiProperty({
    description: 'Смещение по X',
    example: 0,
  })
  @IsNumber()
  offsetX: number;

  @ApiProperty({
    description: 'Смещение по Y',
    example: 0,
  })
  @IsNumber()
  offsetY: number;

  @ApiProperty({
    description: 'Ширина элемента',
    example: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: 'Высота элемента',
    example: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Угол поворота (в градусах)',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rotation?: number;

  @ApiProperty({
    description: 'Активен ли элемент (для уроков)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Количество звезд (для уроков)',
    example: 3,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stars?: number;

  @ApiProperty({
    description: 'Настройки для брейкпоинтов',
    example: { mobile: { hidden: true } },
    required: false,
  })
  @IsOptional()
  breakpoints?: Record<string, any>;

  // Дополнительные поля для уроков
  @ApiProperty({
    description: 'Содержимое урока (для type: lesson)',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Длительность урока в минутах (для type: lesson)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Порядковый номер урока (для type: lesson)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({
    description: 'Опубликован ли урок (для type: lesson)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  // Дополнительные поля для контрольных точек
  @ApiProperty({
    description: 'Тип контрольной точки (для type: checkpoint)',
    enum: CheckpointType,
    required: false,
  })
  @IsEnum(CheckpointType)
  @IsOptional()
  checkpointType?: CheckpointType;

  @ApiProperty({
    description: 'Проходной балл (для type: checkpoint)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({
    description: 'Максимальное количество попыток (для type: checkpoint)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Лимит времени в минутах (для type: checkpoint)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @ApiProperty({
    description: 'Инструкции (для type: checkpoint)',
    required: false,
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}
