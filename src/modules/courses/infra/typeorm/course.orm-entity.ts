import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';
import { CourseMapOrmEntity } from '@modules/map/infra/typeorm/course-map.orm-entity';

@Entity('courses')
export class CourseOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  type: string;

  @Column()
  language: string;

  @Column('simple-array')
  tags: string[];

  @Column('text')
  logo: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: string;

  @Column()
  adminId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @ManyToOne(() => AdminOrmEntity, (admin) => admin.courses)
  @JoinColumn({ name: 'adminId' })
  admin: AdminOrmEntity;

  @OneToOne(() => CourseMapOrmEntity, (map) => map.course)
  @JoinColumn()
  map: CourseMapOrmEntity;
}

 