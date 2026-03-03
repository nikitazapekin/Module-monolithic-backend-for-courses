export class CourseSubscription {
  public id: string;
  public clientId: string;
  public courseId: string;
  public subscribedAt: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(clientId: string, courseId: string) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.courseId = courseId;
    this.subscribedAt = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
