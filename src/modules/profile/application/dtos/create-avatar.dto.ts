import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateAvatarDto {
  @ApiProperty({
    description: 'ID пользователя (auditory)',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  auditoryId: string;

  @ApiProperty({
    description:
      'Base64 encoded image data (without data:image/...;base64, prefix)',
    example:
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  imageData: string;

  @ApiProperty({
    description: 'MIME type of the image',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  mimeType: string;
}
