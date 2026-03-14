import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateAchievementDto {
  @ApiProperty({
    description: 'Изображение достижения (URL или base64)',
    example: 'https://example.com/achievements/novice.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  image?: string;
}
