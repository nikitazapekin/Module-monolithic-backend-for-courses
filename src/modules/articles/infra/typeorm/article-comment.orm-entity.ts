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
import { ArticleOrmEntity } from './article.orm-entity';

@Entity('article_comments')
export class ArticleCommentOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  articleId: string;

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

  @ManyToOne(() => ArticleOrmEntity, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  article: ArticleOrmEntity;

  @ManyToOne(() => ArticleCommentOrmEntity, (parent) => parent.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: ArticleCommentOrmEntity;

  @OneToMany(() => ArticleCommentOrmEntity, (reply) => reply.parent)
  replies: ArticleCommentOrmEntity[];
}
