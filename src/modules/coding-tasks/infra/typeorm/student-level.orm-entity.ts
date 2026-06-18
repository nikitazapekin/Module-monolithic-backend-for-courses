import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';
import { SolvedTaskOrmEntity } from './solved-task.orm-entity';

@Entity('student_level')
export class StudentLevelOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @OneToOne(() => ClientOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  experience: number;

  @OneToMany(() => SolvedTaskOrmEntity, (solved) => solved.studentLevel)
  solvedTasks: SolvedTaskOrmEntity[];
}
