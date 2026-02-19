export interface TestBlock {
    id: string;
    order: number;
    type: 'codeTask' | 'theoryQuestion';
    [key: string]: unknown;
}

export class LessonTest {
    public id: string;
    public lessonDetailsId: string;
    public title: string;
    public orderIndex: number;
    public blocks: TestBlock[];
    public createdAt: Date;
    public updatedAt: Date;

    constructor(
        lessonDetailsId: string,
        title: string,
        orderIndex: number,
        blocks: TestBlock[] = [],
        id?: string,
    ) {
        this.id = id ?? this.generateId();
        this.lessonDetailsId = lessonDetailsId;
        this.title = title;
        this.orderIndex = orderIndex;
        this.blocks = blocks;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public update(data: Partial<LessonTest>): void {
        if (data.title !== undefined) this.title = data.title;
        if (data.orderIndex !== undefined) this.orderIndex = data.orderIndex;
        if (data.blocks !== undefined) this.blocks = data.blocks;
        this.updatedAt = new Date();
    }

    private generateId(): string {
        return `lesson_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
