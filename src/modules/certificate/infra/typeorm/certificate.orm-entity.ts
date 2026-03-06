import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Entity('certificates')
export class CertificateOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  courseId: string;

  @Column()
  date: Date;

  @Column({ type: 'text' })
  url: string; // BASE64 encoded image

  @Column({ type: 'text' })
  digital: string; // URL for PSD version

  @Column({ default: false })
  isViewed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}