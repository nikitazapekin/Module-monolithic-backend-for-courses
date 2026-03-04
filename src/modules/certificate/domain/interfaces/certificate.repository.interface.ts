import { Certificate } from '../entities/certificate.entity';

export interface ICertificateRepository {
  findById(id: string): Promise<Certificate | null>;
  findByClientId(clientId: string): Promise<Certificate[]>;
  findByAuditoryId(auditoryId: string): Promise<Certificate[]>;
  save(certificate: Certificate): Promise<Certificate>;
  update(id: string, updates: Partial<Certificate>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<boolean>;
}