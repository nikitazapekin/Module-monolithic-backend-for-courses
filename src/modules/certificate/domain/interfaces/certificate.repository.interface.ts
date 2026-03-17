import { Certificate } from '../entities/certificate.entity';

export interface CertificateSearchParams {
  firstName?: string;
  lastName?: string;
  courseName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CertificateSearchResult {
  certificates: Certificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICertificateRepository {
  findById(id: string): Promise<Certificate | null>;
  findByClientId(clientId: string): Promise<Certificate[]>;
  findByAuditoryId(auditoryId: string): Promise<Certificate[]>;
  search(params: CertificateSearchParams): Promise<CertificateSearchResult>;
  save(certificate: Certificate): Promise<Certificate>;
  update(id: string, updates: Partial<Certificate>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<boolean>;
}
