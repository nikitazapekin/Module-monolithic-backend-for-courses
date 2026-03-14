import { Achievement } from '../entities/achievement.entity';

export interface IAchievementRepository {
  findById(id: string): Promise<Achievement | null>;
  findByClientId(clientId: string): Promise<Achievement[]>;
  findByClientIdAndType(
    clientId: string,
    type: import('../entities/achievement.entity').AchievementType,
  ): Promise<Achievement[]>;
  save(achievement: Achievement): Promise<Achievement>;
  update(id: string, updates: Partial<Achievement>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<boolean>;
  exists(clientId: string, tier: import('../entities/achievement.entity').AchievementTier): Promise<boolean>;
}
