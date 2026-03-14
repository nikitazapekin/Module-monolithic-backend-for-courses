export enum AchievementType {
  STUDENT_RESULTS = 'student_results',
  SOLVED_TASKS = 'solved_tasks',
}

export enum AchievementTier {
  // Student Results achievements (based on countOfStars)
  NOVICE = 'novice', // at least 1 record with countOfStars > 1
  ADVANCED = 'advanced', // at least 10 records with countOfStars > 1
  EXPERT = 'expert', // at least 50 records with countOfStars > 1
  MASTER = 'master', // at least 100 records with countOfStars > 1

  // Solved Tasks achievements (based on count of solved tasks)
  BEGINNER = 'beginner', // solved 5 tasks
  INTERMEDIATE = 'intermediate', // solved 20 tasks
  PROFESSIONAL = 'professional', // solved 50 tasks
  LEGENDARY = 'legendary', // solved 100 tasks
}

export class Achievement {
  public id: string;
  public clientId: string;
  public type: AchievementType;
  public tier: AchievementTier;
  public title: string;
  public description: string;
  public image: string; // TEXT field for image URL or base64
  public earnedAt: Date;

  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    clientId: string,
    type: AchievementType,
    tier: AchievementTier,
    title: string,
    description: string,
    image: string,
  ) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.type = type;
    this.tier = tier;
    this.title = title;
    this.description = description;
    this.image = image;
    this.earnedAt = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateAchievement(image: string): void {
    this.image = image;
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `achv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
