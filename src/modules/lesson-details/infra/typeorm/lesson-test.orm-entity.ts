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
import type { TestReviewOrmEntity } from './test-review.orm-entity';

@Entity('lesson__tests')
export class LessonTestOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  lessonDetailsId: string;

  @Column()
  title: string;

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
    (details: LessonDetailsOrmEntity) => details.tests,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'lessonDetailsId' })
  lessonDetails: Relation<LessonDetailsOrmEntity>;

  @OneToMany(
    () => require('./test-review.orm-entity').TestReviewOrmEntity,
    (review: TestReviewOrmEntity) => review.test,
    { cascade: true },
  )
  reviews: Relation<TestReviewOrmEntity>[];
}
