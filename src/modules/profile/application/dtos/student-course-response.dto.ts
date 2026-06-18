import { ApiProperty } from '@nestjs/swagger';

export class StudentCourseResponseDto {
  @ApiProperty({ description: 'ID курса' })
  id: string;

  @ApiProperty({ description: 'Название курса' })
  title: string;

  @ApiProperty({ description: 'Описание курса' })
  description: string;

  @ApiProperty({ description: 'Тип курса' })
  type: string;

  @ApiProperty({ description: 'Язык курса' })
  language: string;

  @ApiProperty({ description: 'Теги курса', type: [String] })
  tags: string[];

  @ApiProperty({ description: 'URL логотипа курса' })
  logo: string;

  @ApiProperty({
    description: 'Статус курса',
    enum: ['draft', 'published', 'archived'],
  })
  status: string;

  @ApiProperty({ description: 'Дата подписки на курс' })
  subscribedAt: Date;

  @ApiProperty({
    description: 'Дата публикации курса',
    required: true,
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({
    description: 'Флаг подписки текущего пользователя на курс',
    example: true,
  })
  isSubscribed: boolean;
}
