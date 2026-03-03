import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuditoryOrmEntity } from '@modules/auth/infra/typeorm/auditory.orm-entity';

@Entity('course_subscriptions')
export class CourseSubscriptionOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  auditoryId: string;

  @Column()
  courseId: string;

  @Column()
  subscribedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => AuditoryOrmEntity, auditory => auditory.courseSubscriptions)
  @JoinColumn({ name: 'auditoryId' })
  auditory: AuditoryOrmEntity;
}
