import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICertificateRepository } from '../../domain/interfaces/certificate.repository.interface';
import { Certificate } from '../../domain/entities/certificate.entity';
import { CertificateOrmEntity } from '../typeorm/certificate.orm-entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class CertificateRepository implements ICertificateRepository {
  constructor(
    @InjectRepository(CertificateOrmEntity)
    private readonly certificateRepository: Repository<CertificateOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  async findById(id: string): Promise<Certificate | null> {
    const entity = await this.certificateRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<Certificate[]> {
    const entities = await this.certificateRepository.find({
      where: { clientId },
      order: { date: 'DESC' },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByAuditoryId(auditoryId: string): Promise<Certificate[]> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      return [];
    }

    const entities = await this.certificateRepository.find({
      where: { clientId: client.id },
      order: { date: 'DESC' },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async save(certificate: Certificate): Promise<Certificate> {
    const entity = this.toOrmEntity(certificate);
    const saved = await this.certificateRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<Certificate>): Promise<boolean> {
    const result = await this.certificateRepository.update(id, updates);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.certificateRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await this.certificateRepository.delete({ clientId });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(entity: CertificateOrmEntity): Certificate {
    const certificate = new Certificate(
      entity.clientId,
      entity.courseId || '',
      entity.date,
      entity.url,
      entity.digital,
    );

    Object.assign(certificate, {
      id: entity.id,
      isViewed: entity.isViewed ?? false,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return certificate;
  }

  private toOrmEntity(certificate: Certificate): CertificateOrmEntity {
    const entity = new CertificateOrmEntity();
    entity.id = certificate.id;
    entity.clientId = certificate.clientId;
    entity.courseId = certificate.courseId;
    entity.date = certificate.date;
    entity.url = certificate.url;
    entity.digital = certificate.digital;
    entity.isViewed = certificate.isViewed;
    entity.createdAt = certificate.createdAt;
    entity.updatedAt = certificate.updatedAt;

    return entity;
  }
}