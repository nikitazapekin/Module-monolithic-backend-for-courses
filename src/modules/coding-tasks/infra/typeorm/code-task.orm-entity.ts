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

export interface TestCaseArgument {
  index: number;
  value: string;
  objectValues?: Record<string, string>;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  args?: TestCaseArgument[];
}

export interface ArgumentSchema {
  name: string;
  type: string;
  className?: string;
  arrayElementType?: string;
  arrayElementClassName?: string;
  objectFields?: { name: string; type: string; value: string }[];
  arrayElementObjectFields?: { name: string; type: string; value: string }[];
}

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
  testCases: TestCase[];

  @Column({ type: 'jsonb', default: '{}' })
  testCasesByLanguage: Record<string, TestCase[]>;

  @Column({ type: 'jsonb', default: '[]' })
  constraints: Array<{ type: string; value: any }>;

  @Column({ type: 'jsonb', default: '[]' })
  argumentScheme: ArgumentSchema[];

  @Column({ type: 'varchar', default: 'int' })
  returnType: string;

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
