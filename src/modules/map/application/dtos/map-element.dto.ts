import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  MapElementType,
  PositioningType,
} from '../../domain/entities/map-element-types.enum';

export class MapElementDto {
  @ApiProperty({
    description: 'ID элемента карты',
    example: 'map_element_1707234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Тип элемента',
    enum: MapElementType,
    example: MapElementType.LESSON,
  })
  @Expose()
  type: MapElementType;

  @ApiProperty({
    description: 'Заголовок элемента',
    example: 'Контрольная точка 1',
    required: false,
  })
  @Expose()
  title?: string;

  @ApiProperty({
    description: 'Текст элемента (для текстовых элементов)',
    example: 'Основы программирования',
    required: false,
  })
  @Expose()
  text?: string;

  @ApiProperty({
    description: 'Цвет элемента',
    example: '#ff0000',
    required: false,
  })
  @Expose()
  color?: string;

  @ApiProperty({
    description: 'URL изображения',
    example: 'https://example.com/image.png',
    required: false,
  })
  @Expose()
  imageUrl?: string;

  @ApiProperty({
    description: 'Эмодзи',
    example: ' ',
    required: false,
  })
  @Expose()
  emoji?: string;

  @ApiProperty({
    description: 'Размер шрифта',
    example: 16,
    required: false,
  })
  @Expose()
  fontSize?: number;

  @ApiProperty({
    description: 'Семейство шрифтов',
    example: 'Arial, sans-serif',
    required: false,
  })
  @Expose()
  fontFamily?: string;

  @ApiProperty({
    description: 'Насыщенность шрифта',
    example: 'bold',
    required: false,
  })
  @Expose()
  fontWeight?: string;

  @ApiProperty({
    description: 'Стиль шрифта',
    example: 'italic',
    required: false,
  })
  @Expose()
  fontStyle?: string;

  @ApiProperty({
    description: 'Позиция X (в процентах для free или пикселях)',
    example: 50,
  })
  @Expose()
  positionX: number;

  @ApiProperty({
    description: 'Позиция Y (в процентах для free или пикселях)',
    example: 50,
  })
  @Expose()
  positionY: number;

  @ApiProperty({
    description: 'Тип позиционирования',
    enum: ['left', 'center', 'right', 'free'],
    example: 'free',
  })
  @Expose()
  positioning: PositioningType;

  @ApiProperty({
    description: 'Смещение по X',
    example: 0,
  })
  @Expose()
  offsetX: number;

  @ApiProperty({
    description: 'Смещение по Y',
    example: 0,
  })
  @Expose()
  offsetY: number;

  @ApiProperty({
    description: 'Ширина элемента',
    example: 60,
    required: false,
  })
  @Expose()
  width?: number;

  @ApiProperty({
    description: 'Высота элемента',
    example: 60,
    required: false,
  })
  @Expose()
  height?: number;

  @ApiProperty({
    description: 'Угол поворота (в градусах)',
    example: 0,
  })
  @Expose()
  rotation: number;

  @ApiProperty({
    description: 'Активен ли элемент (для уроков)',
    example: true,
    required: false,
  })
  @Expose()
  isActive?: boolean;

  @ApiProperty({
    description: 'Количество звезд (для уроков)',
    example: 3,
    required: false,
  })
  @Expose()
  stars?: number;

  @ApiProperty({
    description: 'Настройки для брейкпоинтов',
    example: { mobile: { hidden: true } },
    required: false,
  })
  @Expose()
  breakpoints?: Record<string, any>;

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
