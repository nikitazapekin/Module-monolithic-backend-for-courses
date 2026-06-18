import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsResponseDto {
  @ApiProperty({
    description: 'Количество уроков в курсе',
    example: 12,
  })
  lessonCount: number;

  @ApiProperty({
    description: 'Количество студентов, подписанных на курс',
    example: 48,
  })
  studentCount: number;
}
