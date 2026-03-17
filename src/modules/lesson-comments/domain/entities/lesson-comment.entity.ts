export class LessonComment {
  public id: string;
  public lessonDetailsId: string;
  public userId: string;
  public content: string;
  public parentId: string | null;
  public likes: number;
  public dislikes: number;
  public likedByUsers: string[];
  public dislikedByUsers: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    lessonDetailsId: string,
    userId: string,
    content: string,
    parentId: string | null = null,
    id?: string,
  ) {
    this.id = id ?? this.generateId();
    this.lessonDetailsId = lessonDetailsId;
    this.userId = userId;
    this.content = content;
    this.parentId = parentId;
    this.likes = 0;
    this.dislikes = 0;
    this.likedByUsers = [];
    this.dislikedByUsers = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }

  public addLike(userId: string): void {
    // Remove from dislikes if exists
    const dislikeIndex = this.dislikedByUsers.indexOf(userId);
    if (dislikeIndex !== -1) {
      this.dislikedByUsers.splice(dislikeIndex, 1);
      this.dislikes--;
    }

    // Add to likes if not exists
    const likeIndex = this.likedByUsers.indexOf(userId);
    if (likeIndex === -1) {
      this.likedByUsers.push(userId);
      this.likes++;
    }
    this.updatedAt = new Date();
  }

  public removeLike(userId: string): void {
    const likeIndex = this.likedByUsers.indexOf(userId);
    if (likeIndex !== -1) {
      this.likedByUsers.splice(likeIndex, 1);
      this.likes--;
    }
    this.updatedAt = new Date();
  }

  public addDislike(userId: string): void {
    // Remove from likes if exists
    const likeIndex = this.likedByUsers.indexOf(userId);
    if (likeIndex !== -1) {
      this.likedByUsers.splice(likeIndex, 1);
      this.likes--;
    }

    // Add to dislikes if not exists
    const dislikeIndex = this.dislikedByUsers.indexOf(userId);
    if (dislikeIndex === -1) {
      this.dislikedByUsers.push(userId);
      this.dislikes++;
    }
    this.updatedAt = new Date();
  }

  public removeDislike(userId: string): void {
    const dislikeIndex = this.dislikedByUsers.indexOf(userId);
    if (dislikeIndex !== -1) {
      this.dislikedByUsers.splice(dislikeIndex, 1);
      this.dislikes--;
    }
    this.updatedAt = new Date();
  }

  public hasLikedBy(userId: string): boolean {
    return this.likedByUsers.includes(userId);
  }

  public hasDislikedBy(userId: string): boolean {
    return this.dislikedByUsers.includes(userId);
  }

  public update(): void {
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `lesson_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
