import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMapElementDto } from './create-map-element.dto';

export class CreateCourseMapDto {
  @ApiProperty({
    description: 'ID курса',
    example: 'course_1707234567890_abc123',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Ширина карты',
    example: 800,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: 'Высота карты',
    example: 600,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Цвет фона',
    example: '#ffffff',
    required: false,
  })
  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @ApiProperty({
    description: 'Фоновое изображение (base64)',
    required: false,
  })
  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @ApiProperty({
    description: 'Повторение фона',
    enum: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'],
    example: 'no-repeat',
    required: false,
  })
  @IsIn(['repeat', 'no-repeat', 'repeat-x', 'repeat-y'])
  @IsOptional()
  backgroundRepeat?: string;

  @ApiProperty({
    description: 'Размер фона',
    enum: ['cover', 'contain', 'auto'],
    example: 'cover',
    required: false,
  })
  @IsIn(['cover', 'contain', 'auto'])
  @IsOptional()
  backgroundSize?: string;

  @ApiProperty({
    description: 'Элементы карты',
    type: [CreateMapElementDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMapElementDto)
  @IsOptional()
  elements?: CreateMapElementDto[];
}
