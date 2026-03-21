import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { StudentLevelOrmEntity } from './student-level.orm-entity';
import { CodeTaskOrmEntity } from './code-task.orm-entity';

@Entity('solved_tasks')
export class SolvedTaskOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentLevelId: string;

  @ManyToOne(() => StudentLevelOrmEntity, (sl) => sl.solvedTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentLevelId' })
  studentLevel: StudentLevelOrmEntity;

  @Column()
  codeTaskId: string;

  @ManyToOne(() => CodeTaskOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'codeTaskId' })
  codeTask: CodeTaskOrmEntity;

  @CreateDateColumn()
  solvedAt: Date;
}
