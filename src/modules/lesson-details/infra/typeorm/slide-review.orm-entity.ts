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
import type { LessonSlideOrmEntity } from './lesson-slide.orm-entity';

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('slide__reviews')
export class SlideReviewOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  slideId: string;

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
    () => require('./lesson-slide.orm-entity').LessonSlideOrmEntity,
    (slide: LessonSlideOrmEntity) => slide.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'slideId' })
  slide: Relation<LessonSlideOrmEntity>;
}
