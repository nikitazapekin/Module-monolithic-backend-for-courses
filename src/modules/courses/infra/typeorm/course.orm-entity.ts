import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';

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
    default: 'draft'
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
 
  @ManyToOne(() => AdminOrmEntity, admin => admin.courses)
  @JoinColumn({ name: 'adminId' })
  admin: AdminOrmEntity;
}

// Обновляем AdminOrmEntity для связи один-ко-многим:
// В admin.orm-entity.ts добавляем:
// @OneToMany(() => CourseOrmEntity, course => course.admin)
// courses: CourseOrmEntity[];
