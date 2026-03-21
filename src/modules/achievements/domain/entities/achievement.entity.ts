export enum AchievementType {
  STUDENT_RESULTS = 'student_results',
  SOLVED_TASKS = 'solved_tasks',
}

export enum AchievementTier {
  
  NOVICE = 'novice', 
  ADVANCED = 'advanced', 
  EXPERT = 'expert', 
  MASTER = 'master',  
 
  BEGINNER = 'beginner', 
  INTERMEDIATE = 'intermediate',  
  PROFESSIONAL = 'professional', 
  LEGENDARY = 'legendary',  
}

export class Achievement {
  public id: string;
  public clientId: string;
  public type: AchievementType;
  public tier: AchievementTier;
  public title: string;
  public description: string;
  public image: string; 
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
