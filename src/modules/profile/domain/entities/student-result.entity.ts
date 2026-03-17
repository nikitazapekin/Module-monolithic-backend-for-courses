export class StudentResult {
  public id: string;
  public clientId: string;
  public lessonId: string;
  public countOfStars: number;
  public completedAt: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(clientId: string, lessonId: string, countOfStars: number) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.lessonId = lessonId;
    this.countOfStars = this.validateStars(countOfStars);
    this.completedAt = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateStars(countOfStars: number): void {
    this.countOfStars = this.validateStars(countOfStars);
    this.updatedAt = new Date();
  }

  private validateStars(count: number): number {
    if (count < 0 || count > 5) {
      throw new Error('countOfStars must be between 0 and 5');
    }
    return count;
  }

  private generateId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
