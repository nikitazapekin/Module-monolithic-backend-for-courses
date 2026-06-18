import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SlideBlockDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiProperty()
  @IsString()
  type: string;
}

export class CreateSlideDto {
  @ApiProperty({ example: 'Введение' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ['lesson', 'test'], example: 'lesson' })
  @IsIn(['lesson', 'test'])
  type: 'lesson' | 'test';

  @ApiProperty({ example: 0 })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ type: [SlideBlockDto], required: false })
  @IsArray()
  @IsOptional()
  blocks?: object[];
}

export class CreateTestDto {
  @ApiProperty({ example: 'Тест по теме' })
  @IsString()
  title: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ type: [SlideBlockDto], required: false })
  @IsArray()
  @IsOptional()
  blocks?: object[];
}

export class CreateLessonDetailsDto {
  @ApiProperty({
    description: 'ID урока (связь 1:1 с таблицей lessons)',
    example: 'lesson_1707234567890_abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({
    description: 'ID контрольной точки (связь 1:1 с таблицей checkpoints)',
    example: 'checkpoint_1707234567890_abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  checkpointId?: string;

  @ApiProperty({ type: [CreateSlideDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSlideDto)
  slides?: CreateSlideDto[];

  @ApiProperty({ type: [CreateTestDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTestDto)
  tests?: CreateTestDto[];
}
