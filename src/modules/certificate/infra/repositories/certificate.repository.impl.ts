import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ICertificateRepository,
  CertificateSearchParams,
  CertificateSearchResult,
} from '../../domain/interfaces/certificate.repository.interface';
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

    const certificates = entities.map((entity) => this.toDomain(entity));
    return Promise.all(
      certificates.map((cert) => this.enrichWithClientInfo(cert)),
    );
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

    const certificates = entities.map((entity) => this.toDomain(entity));
    return Promise.all(
      certificates.map((cert) => this.enrichWithClientInfo(cert)),
    );
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

  async search(
    params: CertificateSearchParams,
  ): Promise<CertificateSearchResult> {
    const {
      firstName,
      lastName,
      courseName,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = params;

    const queryBuilder = this.certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.client', 'client');

    if (firstName) {
      queryBuilder.andWhere(
        '(client.firstName ILIKE :firstName OR cert.firstName ILIKE :firstName)',
        { firstName: `%${firstName}%` },
      );
    }

    if (lastName) {
      queryBuilder.andWhere(
        '(client.lastName ILIKE :lastName OR cert.lastName ILIKE :lastName)',
        { lastName: `%${lastName}%` },
      );
    }

    if (dateFrom) {
      queryBuilder.andWhere('cert.date >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      queryBuilder.andWhere('cert.date <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    if (courseName) {
      queryBuilder.andWhere(
        '(EXISTS (SELECT 1 FROM courses c WHERE c.id = cert.courseId AND c.title ILIKE :courseName) OR cert.courseName ILIKE :courseName)',
        { courseName: `%${courseName}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const entities = await queryBuilder
      .orderBy('cert.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      certificates: await Promise.all(
        entities.map(async (entity) => {
          const cert = this.toDomain(entity);
          return this.enrichWithClientInfo(cert);
        }),
      ),
      total,
      page,
      limit,
      totalPages,
    };
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
      firstName: entity.firstName ?? '',
      lastName: entity.lastName ?? '',
      middleName: entity.middleName ?? '',
      courseName: entity.courseName ?? '',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return certificate;
  }

  private async enrichWithClientInfo(
    certificate: Certificate,
  ): Promise<Certificate> {
    if (!certificate.firstName || !certificate.lastName) {
      const client = await this.clientRepository.findOne({
        where: { id: certificate.clientId },
      });
      if (client) {
        certificate.firstName = certificate.firstName || client.firstName || '';
        certificate.lastName = certificate.lastName || client.lastName || '';
        certificate.middleName =
          certificate.middleName || client.middleName || '';
      }
    }
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
    entity.firstName = certificate.firstName;
    entity.lastName = certificate.lastName;
    entity.middleName = certificate.middleName;
    entity.courseName = certificate.courseName;
    entity.createdAt = certificate.createdAt;
    entity.updatedAt = certificate.updatedAt;

    return entity;
  }
}
