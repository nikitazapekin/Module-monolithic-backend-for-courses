import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CodeTaskOrmEntity } from '../../../coding-tasks/infra/typeorm/code-task.orm-entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Entity('code_tasks_solutions')
export class CodeTaskSolutionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  code: string;

  @Column('varchar')
  language: string;

  @Column('int')
  executionTimeMs: number;

  @Column('boolean')
  passed: boolean;

  @Column('int', { default: 0 })
  testCasesPassed: number;

  @Column('int', { default: 0 })
  totalTestCases: number;

  @Column('jsonb', { nullable: true })
  testResults: any[];

  @Column('boolean', { default: false })
  allPassed: boolean;

  @Column('int', { default: 0 })
  experienceGained: number;

  @Column('varchar', { nullable: true })
  studentLevelId: string;

  @Column('varchar', { nullable: true })
  studentName: string;

  @ManyToOne(() => CodeTaskOrmEntity, (task: CodeTaskOrmEntity) => task.solutions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: CodeTaskOrmEntity;

  @Column('varchar')
  taskId: string;

  @ManyToOne(() => ClientOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;

  @Column('varchar')
  clientId: string;

  @Column({ type: 'text', nullable: true, array: true, default: [] })
  likedBy: string[];

  @Column({ type: 'text', nullable: true, array: true, default: [] })
  dislikedBy: string[];

  @Column('int', { default: 0 })
  likes: number;

  @Column('int', { default: 0 })
  dislikes: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
