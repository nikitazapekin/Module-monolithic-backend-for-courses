import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';
import { CodeTaskSolutionOrmEntity } from '@modules/codeWithTime/infra/typeorm/code-task-solution.orm-entity';

export interface TestCaseArgument {
  index: number;
  value: string;
  objectValues?: Record<string, string>;
}

export interface TestCase {
  input: string;
  expectedOutput: unknown;
  args?: TestCaseArgument[];
  expectedObjectValues?: Record<string, string>;
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

export interface ReturnSchema {
  className?: string;
  arrayElementType?: string;
  arrayElementClassName?: string;
  objectFields?: { name: string; type: string }[];
  arrayElementObjectFields?: { name: string; type: string }[];
  objectReturnMode?: 'generic' | 'concrete';
}

@Entity('code_tasks')
export class CodeTaskOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  functionName?: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

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

  @Column({ type: 'jsonb', nullable: true })
  returnSchema?: ReturnSchema | null;

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

  @OneToMany(() => CodeTaskSolutionOrmEntity, (solution) => solution.task)
  solutions: CodeTaskSolutionOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
