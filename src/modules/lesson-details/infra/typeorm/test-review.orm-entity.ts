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
import type { LessonTestOrmEntity } from './lesson-test.orm-entity';

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('test__reviews')
export class TestReviewOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  testId: string;

  @Column()
  blockId: string;

  @Column()
  reviewerId: string;

  @Column()
  reviewerName: string;

  @Column('simple-json')
  proposedChanges: Record<string, unknown>;

  @Column('text')
  comment: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => require('./lesson-test.orm-entity').LessonTestOrmEntity,
    (test: LessonTestOrmEntity) => test.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'testId' })
  test: Relation<LessonTestOrmEntity>;
}
