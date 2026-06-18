export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class FriendRequest {
  public id: string;
  public senderId: string;
  public receiverId: string;
  public status: FriendRequestStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(senderId: string, receiverId: string) {
    this.id = this.generateId();
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.status = FriendRequestStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `friend_request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  accept(): void {
    this.status = FriendRequestStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  reject(): void {
    this.status = FriendRequestStatus.REJECTED;
    this.updatedAt = new Date();
  }
}
