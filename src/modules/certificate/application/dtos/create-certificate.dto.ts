import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'ID пользователя (auditory)',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  auditoryId: string;

  @ApiProperty({
    description: 'Дата выдачи сертификата',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  @Expose()
  date: string;

  @ApiProperty({
    description: 'Название курса',
    example: 'JavaScript for Beginners',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  courseName: string;

  @ApiProperty({
    description: 'Имя студента',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  studentName: string;
}