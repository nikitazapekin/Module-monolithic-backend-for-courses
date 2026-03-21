import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CourseOrmEntity } from '@modules/courses/infra/typeorm/course.orm-entity';
import { MapElementOrmEntity } from './map-element.orm-entity';

@Entity('course_maps')
export class CourseMapOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  courseId: string;

  @Column('int')
  width: number;

  @Column('int')
  height: number;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column('text', { nullable: true })
  backgroundImage?: string;  

  @Column({ default: 'no-repeat' })
  backgroundRepeat: string;

  @Column({ default: 'cover' })
  backgroundSize: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
 
  @ManyToOne(() => CourseOrmEntity, (course) => course.map)
  @JoinColumn({ name: 'courseId' })
  course: CourseOrmEntity;
 
  @OneToMany(() => MapElementOrmEntity, (element) => element.courseMap, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  elements: MapElementOrmEntity[];
}
