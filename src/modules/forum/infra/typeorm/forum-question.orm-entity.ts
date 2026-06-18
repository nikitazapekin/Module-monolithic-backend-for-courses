import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ForumCommentOrmEntity } from './forum-comment.orm-entity';
import { ForumQuestionStatus } from '../../application/dtos/forum-question-status.enum';

@Entity('forum_questions')
export class ForumQuestionOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array')
  tags: string[];

  @Column({ type: 'varchar', default: ForumQuestionStatus.OPEN })
  status: ForumQuestionStatus;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

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

  @OneToMany(() => ForumCommentOrmEntity, (comment) => comment.question)
  comments: ForumCommentOrmEntity[];
}
