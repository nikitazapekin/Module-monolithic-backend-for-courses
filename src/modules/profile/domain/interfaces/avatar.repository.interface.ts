import { Avatar } from '../entities/avatar.entity';

export interface IAvatarRepository {
  findById(id: string): Promise<Avatar | null>;
  findByAuditoryId(auditoryId: string): Promise<Avatar | null>;
  save(avatar: Avatar): Promise<Avatar>;
  update(id: string, updates: Partial<Avatar>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByAuditoryId(auditoryId: string): Promise<boolean>;
}
