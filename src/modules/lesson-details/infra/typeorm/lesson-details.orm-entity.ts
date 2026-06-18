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
import { CheckpointOrmEntity } from '@modules/checkpoint/infra/typeorm/checkpoint.orm-entity';
import { LessonSlideOrmEntity } from './lesson-slide.orm-entity';
import { LessonTestOrmEntity } from './lesson-test.orm-entity';
import { LessonCommentOrmEntity } from '@modules/lesson-comments/infra/typeorm/lesson-comment.orm-entity';

@Entity('lesson_details')
export class LessonDetailsOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column('varchar', { unique: true, nullable: true })
  lessonId?: string | null;

  @Column('varchar', { unique: true, nullable: true })
  checkpointId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
 
  @OneToOne(() => LessonOrmEntity)
  @JoinColumn({ name: 'lessonId' })
  lesson: LessonOrmEntity;

  @OneToOne(() => CheckpointOrmEntity)
  @JoinColumn({ name: 'checkpointId' })
  checkpoint: CheckpointOrmEntity;
 
  @OneToMany(() => LessonSlideOrmEntity, (slide) => slide.lessonDetails, {
    cascade: true,
    eager: true,
  })
  slides: LessonSlideOrmEntity[];
 
  @OneToMany(() => LessonTestOrmEntity, (test) => test.lessonDetails, {
    cascade: true,
    eager: true,
  })
  tests: LessonTestOrmEntity[];
 
  @OneToMany(() => LessonCommentOrmEntity, (comment) => comment.lessonDetails)
  comments: LessonCommentOrmEntity[];
}
