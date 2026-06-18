import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ForumQuestionOrmEntity } from './forum-question.orm-entity';

@Entity('forum_comments')
export class ForumCommentOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  questionId: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

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

  @ManyToOne(() => ForumQuestionOrmEntity, (question) => question.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: ForumQuestionOrmEntity;

  @ManyToOne(() => ForumCommentOrmEntity, (parent) => parent.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: ForumCommentOrmEntity;

  @OneToMany(() => ForumCommentOrmEntity, (reply) => reply.parent)
  replies: ForumCommentOrmEntity[];
}
