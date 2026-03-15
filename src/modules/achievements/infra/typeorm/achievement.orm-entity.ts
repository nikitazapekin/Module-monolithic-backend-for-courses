import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';
import { AchievementType, AchievementTier } from '../../domain/entities/achievement.entity';

@Entity('achievements')
@Unique(['clientId', 'tier'])
export class AchievementOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  clientId: string;

  @Column({
    type: 'simple-enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column({
    type: 'simple-enum',
    enum: AchievementTier,
  })
  tier: AchievementTier;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column()
  earnedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ClientOrmEntity, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientOrmEntity;
}
