export class Friend {
  public id: string;
  public clientId: string;
  public friendId: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(clientId: string, friendId: string) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.friendId = friendId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
