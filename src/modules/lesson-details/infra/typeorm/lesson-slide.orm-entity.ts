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
import type { LessonDetailsOrmEntity } from './lesson-details.orm-entity';

@Entity('lesson__slides')
export class LessonSlideOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  lessonDetailsId: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', default: 'lesson' })
  type: 'lesson' | 'test';

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
    (details: LessonDetailsOrmEntity) => details.slides,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'lessonDetailsId' })
  lessonDetails: Relation<LessonDetailsOrmEntity>;
}
