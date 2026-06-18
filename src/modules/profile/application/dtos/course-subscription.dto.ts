import { ApiProperty } from '@nestjs/swagger';

export class CourseSubscriptionDto {
  @ApiProperty({ description: 'ID подписки' })
  id: string;

  @ApiProperty({ description: 'ID аккаунта (auditory)' })
  auditoryId: string;

  @ApiProperty({ description: 'ID курса' })
  courseId: string;

  @ApiProperty({ description: 'Дата подписки' })
  subscribedAt: Date;

  @ApiProperty({ description: 'Дата создания записи' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления записи' })
  updatedAt: Date;
}
