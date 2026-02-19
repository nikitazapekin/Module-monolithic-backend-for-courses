import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { LessonOrmEntity } from '@modules/lesson/infra/typeorm/lesson.orm-entity';
import { LessonSlideOrmEntity } from './lesson-slide.orm-entity';
import { LessonTestOrmEntity } from './lesson-test.orm-entity';

@Entity('lesson_details')
export class LessonDetailsOrmEntity {
    @PrimaryColumn()
    id: string;

    @Column({ unique: true })
    lessonId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Связь один-к-одному с таблицей lessons
    @OneToOne(() => LessonOrmEntity)
    @JoinColumn({ name: 'lessonId' })
    lesson: LessonOrmEntity;

    // Связь один-ко-многим с таблицей lesson__slides
    @OneToMany(() => LessonSlideOrmEntity, (slide) => slide.lessonDetails, {
        cascade: true,
        eager: true,
    })
    slides: LessonSlideOrmEntity[];

    // Связь один-ко-многим с таблицей lesson__tests
    @OneToMany(() => LessonTestOrmEntity, (test) => test.lessonDetails, {
        cascade: true,
        eager: true,
    })
    tests: LessonTestOrmEntity[];
}
