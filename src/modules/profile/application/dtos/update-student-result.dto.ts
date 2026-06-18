import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateStudentResultDto {
  @ApiProperty({
    description: 'Количество звезд (0-5)',
    example: 4,
    minimum: 0,
    maximum: 5,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Expose()
  countOfStars?: number;
}
