import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { LessonDetailsOrmEntity } from '@modules/lesson-details/infra/typeorm/lesson-details.orm-entity';

@Entity('lesson_comments')
export class LessonCommentOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  lessonDetailsId: string;

  @Column()
  userId: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  parentId: string | null;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @Column('simple-array', { nullable: true })
  likedByUsers: string[];

  @Column('simple-array', { nullable: true })
  dislikedByUsers: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь многие-к-одному с lesson_details
  @ManyToOne(
    () => LessonDetailsOrmEntity,
    (lessonDetails) => lessonDetails.comments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'lessonDetailsId' })
  lessonDetails: LessonDetailsOrmEntity;

  // Связь многие-к-одному с родительским комментарием (для ответов)
  @ManyToOne(() => LessonCommentOrmEntity, (parent) => parent.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: LessonCommentOrmEntity;

  // Связь один-ко-многим с ответами
  @OneToMany(() => LessonCommentOrmEntity, (reply) => reply.parent)
  replies: LessonCommentOrmEntity[];
}
