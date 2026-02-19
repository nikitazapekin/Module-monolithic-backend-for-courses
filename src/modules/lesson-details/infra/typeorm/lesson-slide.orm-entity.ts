import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    type Relation,
} from 'typeorm';
import type { LessonDetailsOrmEntity } from './lesson-details.orm-entity';

@Entity('lesson__slides')
export class LessonSlideOrmEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    lessonDetailsId: string;

    @Column()
    title: string;

    @Column({ type: 'varchar', default: 'lesson' })
    type: 'lesson' | 'test';

    @Column('int')
    orderIndex: number;

    // JSON-поле для хранения массива блоков слайда
    // (text, codeExample, source, table, image для типа lesson)
    @Column('simple-json', { nullable: true })
    blocks: object[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Связь многие-к-одному с lesson_details
    @ManyToOne(
        () => require('./lesson-details.orm-entity').LessonDetailsOrmEntity,
        (details: LessonDetailsOrmEntity) => details.slides,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'lessonDetailsId' })
    lessonDetails: Relation<LessonDetailsOrmEntity>;
}
