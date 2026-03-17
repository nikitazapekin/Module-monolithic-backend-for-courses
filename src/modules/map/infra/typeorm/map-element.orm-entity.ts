import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CourseMapOrmEntity } from './course-map.orm-entity';
import { MapElementType, PositioningType } from './map-element-types.enum';

@Entity('map_elements')
@Index(['courseMapId', 'type'])
export class MapElementOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'enum',
    enum: MapElementType,
  })
  type: MapElementType;

  @Column()
  courseMapId: string;

  @Column({ nullable: true })
  title?: string;

  @Column('text', { nullable: true })
  text?: string;

  @Column({ nullable: true })
  color?: string;

  @Column('text', { nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  emoji?: string;

  @Column('int', { nullable: true })
  fontSize?: number;

  @Column({ nullable: true })
  fontFamily?: string;

  @Column({ nullable: true })
  fontWeight?: string;

  @Column({ nullable: true })
  fontStyle?: string;

  @Column('float')
  positionX: number;

  @Column('float')
  positionY: number;

  @Column({
    type: 'enum',
    enum: ['left', 'center', 'right', 'free'],
    default: 'free',
  })
  positioning: PositioningType;

  @Column('float', { default: 0 })
  offsetX: number;

  @Column('float', { default: 0 })
  offsetY: number;

  @Column('int', { nullable: true })
  width?: number;

  @Column('int', { nullable: true })
  height?: number;

  @Column('float', { default: 0 })
  rotation: number;

  @Column('boolean', { nullable: true })
  isActive?: boolean;

  @Column('int', { nullable: true })
  stars?: number;

  @Column('jsonb', { nullable: true })
  breakpoints?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь многие-к-одному с картой курса
  @ManyToOne(() => CourseMapOrmEntity, (courseMap) => courseMap.elements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseMapId' })
  courseMap: CourseMapOrmEntity;
}
