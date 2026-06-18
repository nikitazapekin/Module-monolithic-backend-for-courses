import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { LessonDetailsOrmEntity } from './lesson-details.orm-entity';
import type { SlideReviewOrmEntity } from './slide-review.orm-entity';

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

  @Column('simple-json', { nullable: true })
  blocks: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => require('./lesson-details.orm-entity').LessonDetailsOrmEntity,
    (details: LessonDetailsOrmEntity) => details.slides,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'lessonDetailsId' })
  lessonDetails: Relation<LessonDetailsOrmEntity>;

  @OneToMany(
    () => require('./slide-review.orm-entity').SlideReviewOrmEntity,
    (review: SlideReviewOrmEntity) => review.slide,
    { cascade: true },
  )
  reviews: Relation<SlideReviewOrmEntity>[];
}
