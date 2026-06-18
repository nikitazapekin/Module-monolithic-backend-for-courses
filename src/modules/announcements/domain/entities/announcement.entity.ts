export class Announcement {
  id: string;
  adminId: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id?: string,
    adminId?: string,
    title?: string,
    content?: string,
    author?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || this.generateId();
    this.adminId = adminId || '';
    this.title = title || '';
    this.content = content || '';
    this.author = author || '';
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  private generateId(): string {
    return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
