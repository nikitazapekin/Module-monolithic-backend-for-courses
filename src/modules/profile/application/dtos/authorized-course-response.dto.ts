import { ApiProperty } from '@nestjs/swagger';

export class AuthorizedCourseResponseDto {
  @ApiProperty({ description: 'ID курса' })
  id: string;

  @ApiProperty({ description: 'Название курса' })
  title: string;

  @ApiProperty({ description: 'Описание курса' })
  description: string;

  @ApiProperty({ description: 'Подробное описание курса' })
  fullDescription: string;

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

  @ApiProperty({ description: 'ID администратора-создателя' })
  adminId: string;

  @ApiProperty({ description: 'Дата создания курса' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления курса' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Дата публикации курса',
    required: false,
    nullable: true,
  })
  publishedAt?: Date | null;

  @ApiProperty({
    description: 'Подписан ли текущий авторизованный пользователь на курс',
    example: false,
  })
  isSubscribed: boolean;
}
