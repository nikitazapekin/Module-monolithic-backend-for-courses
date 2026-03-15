import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Entity('friends')
@Unique(['clientId', 'friendId'])
export class FriendOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column()
  friendId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friendId' })
  friend: ClientOrmEntity;
}
