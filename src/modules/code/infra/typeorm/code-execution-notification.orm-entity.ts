import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('code_execution_notifications')
export class CodeExecutionNotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  jobId: string;

  @Column('varchar')
  eventType: string;

  @Column('text')
  message: string;

  @Column('varchar')
  language: string;

  @Column('varchar', { default: 'code' })
  sourceType: string;

  @Column('varchar', { nullable: true })
  status: string | null;

  @Column('varchar', { nullable: true })
  workerId: string | null;

  @Column('int', { default: 0 })
  attempt: number;

  @Column('jsonb', { nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
