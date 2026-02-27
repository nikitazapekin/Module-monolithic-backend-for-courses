import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateStudentResultDto {
  @ApiProperty({
    description: 'ID студента (client)',
    example: 'client_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  clientId: string;

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
