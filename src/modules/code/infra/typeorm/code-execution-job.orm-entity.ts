import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('code_execution_jobs')
export class CodeExecutionJobOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  language: string;

  @Column('varchar', { default: 'code' })
  sourceType: string;

  @Column('varchar', { nullable: true })
  taskId: string | null;

  @Column('varchar', { nullable: true })
  clientId: string | null;

  @Column('varchar', { default: 'queued' })
  status: string;

  @Column('varchar')
  routingKey: string;

  @Column('varchar', { nullable: true })
  workerId: string | null;

  @Column('int', { default: 0 })
  attempts: number;

  @Column('int', { default: 3 })
  maxAttempts: number;

  @Column('text')
  code: string;

  @Column('text', { nullable: true })
  resultOutput: string | null;

  @Column('text', { nullable: true })
  resultError: string | null;

  @Column('int', { nullable: true })
  executionTimeMs: number | null;

  @Column('timestamp', { nullable: true })
  queuedAt: Date | null;

  @Column('timestamp', { nullable: true })
  startedAt: Date | null;

  @Column('timestamp', { nullable: true })
  finishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
