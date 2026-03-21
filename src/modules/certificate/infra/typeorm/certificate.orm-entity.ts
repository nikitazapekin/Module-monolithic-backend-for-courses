import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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
  url: string;

  @Column({ type: 'text' })
  digital: string;

  @Column({ default: false })
  isViewed: boolean;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  courseName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}
