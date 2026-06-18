import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MapElementOrmEntity } from '@modules/map/infra/typeorm/map-element.orm-entity';

export enum CheckpointType {
  QUIZ = 'quiz',
  PRACTICAL_TASK = 'practical_task',
  EXAM = 'exam',
  PROJECT = 'project',
}

@Entity('checkpoints')
export class CheckpointOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  mapElementId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CheckpointType,
  })
  type: CheckpointType;

  @Column('int', { default: 1 })
  orderIndex: number;

  @Column('int', { nullable: true })
  passingScore?: number;

  @Column('int', { nullable: true })
  maxAttempts?: number;

  @Column('int', { nullable: true })
  timeLimit?: number;

  @Column('text', { nullable: true })
  instructions?: string;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
 
  @OneToOne(() => MapElementOrmEntity)
  @JoinColumn({ name: 'mapElementId' })
  mapElement: MapElementOrmEntity;
}
