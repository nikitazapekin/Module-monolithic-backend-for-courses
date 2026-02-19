export class LessonDetails {
    public id: string;
    public lessonId: string;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(lessonId: string, id?: string) {
        this.id = id ?? this.generateId();
        this.lessonId = lessonId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public update(): void {
        this.updatedAt = new Date();
    }

    private generateId(): string {
        return `lesson_details_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
