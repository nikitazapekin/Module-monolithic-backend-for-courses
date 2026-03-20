import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chat_conversations')
@Index(['participant1Id', 'participant2Id'], { unique: true })
@Index(['updatedAt'])
export class ConversationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  participant1Id: string;

  @Column()
  @Index()
  participant2Id: string;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ type: 'jsonb', nullable: true })
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
