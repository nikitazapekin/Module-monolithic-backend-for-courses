import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminOrmEntity } from '../../../auth/infra/typeorm/admin.orm-entity';

@Entity('announcements')
export class AnnouncementOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  adminId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
