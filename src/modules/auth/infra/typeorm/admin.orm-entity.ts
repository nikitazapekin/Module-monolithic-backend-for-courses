import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { AuditoryOrmEntity } from './auditory.orm-entity';
import { CourseOrmEntity } from '@modules/courses/infra/typeorm/course.orm-entity';

@Entity('admins')
export class AdminOrmEntity {
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

  @Column('simple-array', { default: 'read,write' })
  permissions: string[];

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
 
  @OneToOne(() => AuditoryOrmEntity, auditory => auditory.admin)
  auditory: AuditoryOrmEntity;


    @OneToMany(() => CourseOrmEntity, course => course.admin)
  courses: CourseOrmEntity[];
}
