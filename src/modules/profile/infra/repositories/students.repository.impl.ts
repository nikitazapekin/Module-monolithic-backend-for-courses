import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../../../auth/infra/typeorm/auditory.orm-entity';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
  ) {}

  async findStudents({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ students: ClientOrmEntity[]; total: number }> {
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.auditory', 'auditory');

    if (search) {
      const searchTerms = search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        const searchQuery = searchTerms.map((term, index) => {
          return `(
            CAST(client.firstName AS text) ILIKE :term${index} OR
            CAST(client.lastName AS text) ILIKE :term${index} OR
            CAST(client.middleName AS text) ILIKE :term${index} OR
            CAST(client.id AS text) ILIKE :term${index} OR
            CAST(client.auditoryId AS text) ILIKE :term${index}
          )`;
        }).join(' AND ');

        queryBuilder.andWhere(searchQuery,
          searchTerms.reduce((acc, term, index) => {
            acc[`term${index}`] = `%${term}%`;
            return acc;
          }, {} as Record<string, string>)
        );
      }
    }

    const [students, total] = await queryBuilder
      .orderBy('client.lastName', 'ASC')
      .addOrderBy('client.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { students, total };
  }

  async findStudentByAuditoryId(auditoryId: string): Promise<ClientOrmEntity | null> {
    return this.clientRepository.findOne({
      where: { auditoryId },
      relations: ['auditory'],
    });
  }

  async findStudentById(id: string): Promise<ClientOrmEntity | null> {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['auditory'],
    });
  }
}
