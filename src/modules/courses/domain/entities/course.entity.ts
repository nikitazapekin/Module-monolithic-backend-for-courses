export type CourseStatus = 'draft' | 'published' | 'archived';

export class Course {
  public id: string;
  public title: string;
  public description: string;
  public type: string;
  public language: string;
  public tags: string[];
  public logo: string;
  public status: CourseStatus;
  public adminId: string;
  public createdAt: Date;
  public updatedAt: Date;
  public publishedAt?: Date;

  constructor(
    title: string,
    description: string,
    type: string,
    language: string,
    tags: string[],
    logo: string,
    adminId: string,
    status: CourseStatus = 'draft',
  ) {
    this.id = this.generateId();
    this.title = title.trim();
    this.description = description.trim();
    this.type = type.trim();
    this.language = language.trim();
    this.tags = tags.map((tag) => tag.trim());
    this.logo = logo.trim();
    this.adminId = adminId;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    if (status === 'published') {
      this.publishedAt = new Date();
    }
  }

  public update(data: Partial<Course>): void {
    if (data.title) this.title = data.title.trim();
    if (data.description) this.description = data.description.trim();
    if (data.type) this.type = data.type.trim();
    if (data.language) this.language = data.language.trim();
    if (data.tags) this.tags = data.tags.map((tag) => tag.trim());
    if (data.logo) this.logo = data.logo.trim();
    if (data.status) {
      this.status = data.status;
      if (data.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
      }
    }

    this.updatedAt = new Date();
  }

  public publish(): void {
    this.status = 'published';
    if (!this.publishedAt) {
      this.publishedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  public archive(): void {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  public hasTag(tag: string): boolean {
    return this.tags.includes(tag.trim());
  }

  public addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (!this.hasTag(trimmedTag)) {
      this.tags.push(trimmedTag);
      this.updatedAt = new Date();
    }
  }

  public removeTag(tag: string): void {
    const trimmedTag = tag.trim();
    this.tags = this.tags.filter((t) => t !== trimmedTag);
    this.updatedAt = new Date();
  }

  public isPublished(): boolean {
    return this.status === 'published';
  }

  private generateId(): string {
    return `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
