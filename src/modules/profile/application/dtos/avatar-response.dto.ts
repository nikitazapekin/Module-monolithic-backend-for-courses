import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AvatarResponseDto {
  @ApiProperty({
    description: 'ID аватара',
    example: 'avatar_1234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID пользователя (auditory)',
    example: 'auth_1234567890_abc123',
  })
  @Expose()
  auditoryId: string;

  @ApiProperty({
    description: 'MIME type изображения',
    example: 'image/png',
  })
  @Expose()
  mimeType: string;

  @ApiProperty({
    description: 'Размер файла в байтах',
    example: 1024,
  })
  @Expose()
  fileSize: number;

  @ApiProperty({
    description: 'Base64 изображение с префиксом',
    example:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  })
  @Expose()
  imageUrl: string;

  @ApiProperty({
    description: 'Дата создания',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
