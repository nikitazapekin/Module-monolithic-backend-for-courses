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

@Entity('lesson__tests')
export class LessonTestOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  lessonDetailsId: string;

  @Column()
  title: string;

  @Column('int')
  orderIndex: number;

  // JSON-поле для хранения тестовых блоков (codeTask, theoryQuestion)
  @Column('simple-json', { nullable: true })
  blocks: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь многие-к-одному с lesson_details
  @ManyToOne(
    () => require('./lesson-details.orm-entity').LessonDetailsOrmEntity,
    (details: LessonDetailsOrmEntity) => details.tests,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'lessonDetailsId' })
  lessonDetails: Relation<LessonDetailsOrmEntity>;
}
