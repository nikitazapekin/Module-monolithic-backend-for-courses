export type SlideType = 'lesson' | 'test';

export interface SlideBlock {
    id: string;
    order: number;
    type: string;
    [key: string]: unknown;
}

export class LessonSlide {
    public id: string;
    public lessonDetailsId: string;
    public title: string;
    public type: SlideType;
    public orderIndex: number;
    public blocks: SlideBlock[];
    public createdAt: Date;
    public updatedAt: Date;

    constructor(
        lessonDetailsId: string,
        title: string,
        type: SlideType,
        orderIndex: number,
        blocks: SlideBlock[] = [],
        id?: string,
    ) {
        this.id = id ?? this.generateId();
        this.lessonDetailsId = lessonDetailsId;
        this.title = title;
        this.type = type;
        this.orderIndex = orderIndex;
        this.blocks = blocks;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public update(data: Partial<LessonSlide>): void {
        if (data.title !== undefined) this.title = data.title;
        if (data.type !== undefined) this.type = data.type;
        if (data.orderIndex !== undefined) this.orderIndex = data.orderIndex;
        if (data.blocks !== undefined) this.blocks = data.blocks;
        this.updatedAt = new Date();
    }

    private generateId(): string {
        return `lesson_slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
