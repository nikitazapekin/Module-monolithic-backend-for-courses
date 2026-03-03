import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateStudentResultDto {
  @ApiProperty({
    description: 'ID аккаунта (auditory). Используется для поиска clientId.',
    example: 'auth_1234567890_abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  auditoryId?: string;

  @ApiProperty({
    description: 'ID студента (client). Если не указан, будет найден по auditoryId.',
    example: 'client_1234567890_abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  clientId?: string;

  @ApiProperty({
    description: 'ID урока',
    example: 'lesson_123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  lessonId: string;

  @ApiProperty({
    description: 'Количество звезд (0-5)',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  @Expose()
  countOfStars: number;
}
