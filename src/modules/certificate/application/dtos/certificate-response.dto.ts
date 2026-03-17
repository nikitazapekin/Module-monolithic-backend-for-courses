import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CertificateResponseDto {
  @ApiProperty({
    description: 'ID сертификата',
    example: 'cert_1234567890_abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID клиента',
    example: 'client_1234567890_abc123',
  })
  @Expose()
  clientId: string;

  @ApiProperty({
    description: 'ID курса',
    example: 'course_123',
  })
  @Expose()
  courseId: string;

  @ApiProperty({
    description: 'Дата выдачи сертификата',
    example: '2024-01-15T00:00:00.000Z',
  })
  @Expose()
  date: Date;

  @ApiProperty({
    description: 'Base64 изображение сертификата с префиксом',
    example:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  })
  @Expose()
  url: string;

  @ApiProperty({
    description: 'URL для PSD версии сертификата',
    example: 'http://localhost:3002/certificates/digital/cert_123.psd',
  })
  @Expose()
  digital: string;

  @ApiProperty({
    description: 'URL для просмотра сертификата',
    example: 'http://localhost:3002/certificates/view/cert_123',
  })
  @Expose()
  viewUrl: string;

  @ApiProperty({
    description: 'Просмотрен ли сертификат',
    example: false,
  })
  @Expose()
  isViewed: boolean;

  @ApiProperty({
    description: 'Имя студента',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия студента',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Отчество студента',
    example: 'Ivanovich',
  })
  @Expose()
  middleName: string;

  @ApiProperty({
    description: 'Название курса',
    example: 'JavaScript for Beginners',
  })
  @Expose()
  courseName: string;

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
