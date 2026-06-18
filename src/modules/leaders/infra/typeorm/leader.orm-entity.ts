import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';

@Entity('leaders')
@Unique(['clientId'])
export class LeaderOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}
