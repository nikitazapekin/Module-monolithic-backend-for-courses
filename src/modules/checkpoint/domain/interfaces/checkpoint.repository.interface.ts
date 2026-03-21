import { Checkpoint } from '../entities/checkpoint.entity';

export interface ICheckpointRepository {
  create(checkpoint: Checkpoint): Promise<Checkpoint>;
  findById(id: string): Promise<Checkpoint | null>;
  findByMapElementId(mapElementId: string): Promise<Checkpoint | null>;
  findAllByCourseMapId(courseMapId: string): Promise<Checkpoint[]>;
  update(id: string, updates: Partial<Checkpoint>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByMapElementId(mapElementId: string): Promise<boolean>;
}
