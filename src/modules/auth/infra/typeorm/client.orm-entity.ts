import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { AuditoryOrmEntity } from './auditory.orm-entity';

@Entity('clients')
export class ClientOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  auditoryId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  phone: string;

  @Column()
  country: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AuditoryOrmEntity, auditory => auditory.client)
  auditory: AuditoryOrmEntity;
}
