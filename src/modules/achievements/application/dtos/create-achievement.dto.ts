import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { AchievementType, AchievementTier } from '../../domain/entities/achievement.entity';

export class CreateAchievementDto {
  @ApiProperty({
    description: 'ID пользователя (auditory)',
    example: 'auth_1234567890_abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  auditoryId: string;

  @ApiProperty({
    description: 'Тип достижения',
    enum: AchievementType,
    example: AchievementType.STUDENT_RESULTS,
  })
  @IsEnum(AchievementType)
  @IsNotEmpty()
  @Expose()
  type: AchievementType;

  @ApiProperty({
    description: 'Уровень достижения',
    enum: AchievementTier,
    example: AchievementTier.NOVICE,
  })
  @IsEnum(AchievementTier)
  @IsNotEmpty()
  @Expose()
  tier: AchievementTier;

  @ApiProperty({
    description: 'Название достижения',
    example: 'Novice',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Описание достижения',
    example: 'Completed at least 1 lesson with more than 1 star',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Изображение достижения (URL или base64)',
    example: 'https://example.com/achievements/novice.png',
    required: false,
  })
  @IsString()
  @Expose()
  image?: string;
}
