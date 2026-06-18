import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleCommentOrmEntity } from './article-comment.orm-entity';

@Entity('articles')
export class ArticleOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column('simple-json')
  contentBlocks: Record<string, any>[];

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

  @OneToMany(() => ArticleCommentOrmEntity, (comment) => comment.article)
  comments: ArticleCommentOrmEntity[];
}
