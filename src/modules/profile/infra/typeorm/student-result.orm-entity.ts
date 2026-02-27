import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Entity('student_results')
export class StudentResultOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column()
  lessonId: string;

  @Column()
  countOfStars: number;

  @CreateDateColumn()
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}
