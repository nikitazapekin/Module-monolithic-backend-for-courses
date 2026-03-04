import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateCertificateDto {
  @ApiProperty({
    description: 'Дата выдачи сертификата',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Expose()
  date?: string;

  @ApiProperty({
    description: 'Base64 encoded image data (without data:image/...;base64, prefix)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  url?: string;

  @ApiProperty({
    description: 'URL для PSD версии сертификата',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  digital?: string;
}