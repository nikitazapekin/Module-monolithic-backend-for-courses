import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ClientOrmEntity } from './client.orm-entity';
import { AdminOrmEntity } from './admin.orm-entity';

@Entity('auditory')
export class AuditoryOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ 
    type: 'enum',
    enum: ['client', 'admin'],
    default: 'client'
  })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires: Date;
 
  @OneToOne(() => ClientOrmEntity, client => client.auditory, { cascade: true })
  @JoinColumn()
  client: ClientOrmEntity;

  @OneToOne(() => AdminOrmEntity, admin => admin.auditory, { cascade: true })
  @JoinColumn()
  admin: AdminOrmEntity;
}
