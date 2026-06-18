import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Заголовок анонса',
    example: 'Важная новость',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Содержание анонса',
    example: 'Мы запускаем новый курс по React...',
  })
  @Expose()
  content: string;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'ann-123' })
  id: string;

  @ApiProperty({ example: 'admin-123' })
  adminId: string;

  @ApiProperty({ example: 'Важная новость' })
  title: string;

  @ApiProperty({ example: 'Мы запускаем новый курс по React...' })
  content: string;

  @ApiProperty({ example: 'Admin' })
  author: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
