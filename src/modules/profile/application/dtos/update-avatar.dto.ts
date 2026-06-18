import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateAvatarDto {
  @ApiProperty({
    description:
      'Base64 encoded image data (without data:image/...;base64, prefix)',
    example:
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  imageData?: string;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/png',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  mimeType?: string;
}
