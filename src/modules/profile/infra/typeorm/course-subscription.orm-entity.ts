import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';

@Entity('course_subscriptions')
export class CourseSubscriptionOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column()
  courseId: string;

  @Column()
  subscribedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, client => client.courseSubscriptions)
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}
