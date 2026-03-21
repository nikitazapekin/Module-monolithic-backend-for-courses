export enum CheckpointType {
  QUIZ = 'quiz',
  PRACTICAL_TASK = 'practical_task',
  EXAM = 'exam',
  PROJECT = 'project',
}

export class Checkpoint {
  public id: string;
  public mapElementId: string;
  public title: string;
  public description: string;
  public type: CheckpointType;
  public passingScore?: number;
  public maxAttempts?: number;
  public timeLimit?: number;
  public instructions?: string;
  public isPublished: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    mapElementId: string,
    title: string,
    description: string,
    type: CheckpointType,
    passingScore?: number,
    maxAttempts?: number,
    timeLimit?: number,
    instructions?: string,
    isPublished: boolean = false,
    id?: string,
  ) {
    if (id) {
      this.id = id;
    } else {
      this.id = this.generateId();
    }
    this.mapElementId = mapElementId;
    this.title = title;
    this.description = description;
    this.type = type;
    this.passingScore = passingScore;
    this.maxAttempts = maxAttempts;
    this.timeLimit = timeLimit;
    this.instructions = instructions;
    this.isPublished = isPublished;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public update(data: Partial<Checkpoint>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.type !== undefined) this.type = data.type;
    if (data.passingScore !== undefined) this.passingScore = data.passingScore;
    if (data.maxAttempts !== undefined) this.maxAttempts = data.maxAttempts;
    if (data.timeLimit !== undefined) this.timeLimit = data.timeLimit;
    if (data.instructions !== undefined) this.instructions = data.instructions;
    if (data.isPublished !== undefined) this.isPublished = data.isPublished;

    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
