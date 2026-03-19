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
import { LessonCommentOrmEntity } from '@modules/lesson-comments/infra/typeorm/lesson-comment.orm-entity';

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
 
  @OneToOne(() => LessonOrmEntity)
  @JoinColumn({ name: 'lessonId' })
  lesson: LessonOrmEntity;
 
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
