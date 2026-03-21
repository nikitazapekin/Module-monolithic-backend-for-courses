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

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('friend_requests')
@Unique(['senderId', 'receiverId'])
export class FriendRequestOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: ClientOrmEntity;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: ClientOrmEntity;
}
