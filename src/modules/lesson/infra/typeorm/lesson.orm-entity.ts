import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { MapElementOrmEntity } from '@modules/map/infra/typeorm/map-element.orm-entity';
import { CourseMapOrmEntity } from '@modules/map/infra/typeorm/course-map.orm-entity';
import { LessonDetailsOrmEntity } from '@modules/lesson-details/infra/typeorm/lesson-details.orm-entity';

@Entity('lessons')
export class LessonOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  mapElementId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  content?: string;

  @Column('int', { nullable: true })
  duration?: number;

  @Column('int', { default: 1 })
  orderIndex: number;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь один-к-одному с MapElement
  @OneToOne(() => MapElementOrmEntity)
  @JoinColumn({ name: 'mapElementId' })
  mapElement: MapElementOrmEntity;

  // Обратная связь один-к-одному с lesson_details
  @OneToOne(() => LessonDetailsOrmEntity, (ld) => ld.lesson)
  lessonDetails: LessonDetailsOrmEntity;
}
