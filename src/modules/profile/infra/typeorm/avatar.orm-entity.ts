import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AuditoryOrmEntity } from '../../../auth/infra/typeorm/auditory.orm-entity';

@Entity('avatar')
export class AvatarOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  auditoryId: string;

  @Column({ type: 'text' })
  imageData: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AuditoryOrmEntity, { cascade: false })
  @JoinColumn({ name: 'auditoryId' })
  auditory: AuditoryOrmEntity;
}
