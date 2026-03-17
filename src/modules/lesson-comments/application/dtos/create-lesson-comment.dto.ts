import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateLessonCommentDto {
  @ApiProperty({ description: 'ID таблицы lesson_details' })
  @IsString()
  @IsNotEmpty()
  lessonDetailsId: string;

  @ApiProperty({ description: 'Текст комментария' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'ID родительского комментария (для ответов)',
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateLessonCommentDto {
  @ApiProperty({ description: 'Новый текст комментария' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ToggleReactionDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
