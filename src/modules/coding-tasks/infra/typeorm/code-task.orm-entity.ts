import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';

@Entity('code_tasks')
export class CodeTaskOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: '["javascript"]' })
  languages: string[];

  @Column({ type: 'jsonb', default: '{}' })
  startCodes: Record<string, string>;

  @Column({ type: 'jsonb', default: '[]' })
  testCases: Array<{ input: string; expectedOutput: string }>;

  @Column({ type: 'jsonb', default: '[]' })
  constraints: Array<{ type: string; value: any }>;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  })
  difficulty: string;

  @Column({ type: 'int', default: 10 })
  experienceReward: number;

  @Column()
  authorName: string;

  @Column()
  adminId: string;

  @ManyToOne(() => AdminOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: AdminOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
