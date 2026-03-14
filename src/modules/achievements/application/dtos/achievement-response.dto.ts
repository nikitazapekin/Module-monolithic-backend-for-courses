import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AchievementType, AchievementTier } from '../../domain/entities/achievement.entity';

export class AchievementResponseDto {
  @ApiProperty({
    description: 'ID достижения',
    example: 'achv_1234567890_abc123',
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
    description: 'Тип достижения',
    enum: AchievementType,
    example: AchievementType.STUDENT_RESULTS,
  })
  @Expose()
  type: AchievementType;

  @ApiProperty({
    description: 'Уровень достижения',
    enum: AchievementTier,
    example: AchievementTier.NOVICE,
  })
  @Expose()
  tier: AchievementTier;

  @ApiProperty({
    description: 'Название достижения',
    example: 'Novice',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Описание достижения',
    example: 'Completed at least 1 lesson with more than 1 star',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Изображение достижения',
    example: 'https://example.com/achievements/novice.png',
  })
  @Expose()
  image: string;

  @ApiProperty({
    description: 'Дата получения достижения',
    example: '2024-01-15T00:00:00.000Z',
  })
  @Expose()
  earnedAt: Date;

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
