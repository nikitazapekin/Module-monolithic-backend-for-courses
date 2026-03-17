export class Lesson {
  public id: string;
  public mapElementId: string;
  public title: string;
  public description: string;
  public content?: string;
  public duration?: number;
  public orderIndex: number;
  public isPublished: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    mapElementId: string,
    title: string,
    description: string,
    orderIndex: number | undefined,
    content?: string,
    duration?: number,
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
    this.content = content;
    this.duration = duration;
    this.orderIndex = orderIndex ?? 1; // Default to 1 if undefined or null
    this.isPublished = isPublished;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public update(data: Partial<Lesson>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.content !== undefined) this.content = data.content;
    if (data.duration !== undefined) this.duration = data.duration;
    if (data.orderIndex !== undefined) this.orderIndex = data.orderIndex;
    if (data.isPublished !== undefined) this.isPublished = data.isPublished;

    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
