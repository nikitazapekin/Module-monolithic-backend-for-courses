import { Auditory, UserRole } from '../entities/auditory.entity';
import { Client } from '../entities/client.entity';
import { Admin } from '../entities/admin.entity';

export interface IAuthRepository {
  // Auditory
  findAuditoryByEmail(email: string): Promise<Auditory | null>;
  findAuditoryById(id: string): Promise<Auditory | null>;
  saveAuditory(auditory: Auditory): Promise<Auditory>;
  updateAuditory(id: string, updates: Partial<Auditory>): Promise<boolean>;
  
  // Client
  findClientByAuditoryId(auditoryId: string): Promise<Client | null>;
  saveClient(client: Client): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<boolean>;
  
  // Admin
  findAdminByAuditoryId(auditoryId: string): Promise<Admin | null>;
  saveAdmin(admin: Admin): Promise<Admin>;
  updateAdmin(id: string, updates: Partial<Admin>): Promise<boolean>;
  
  // Общие
  deactivateUser(auditoryId: string): Promise<boolean>;
}
