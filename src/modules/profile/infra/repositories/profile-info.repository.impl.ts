import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStudentResultRepository } from '../../domain/interfaces/student-result.repository.interface';
import { StudentResult } from '../../domain/entities/student-result.entity';
import { StudentResultOrmEntity } from '../typeorm/student-result.orm-entity';
import { AvatarOrmEntity } from '../typeorm/avatar.orm-entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../../../auth/infra/typeorm/auditory.orm-entity';

@Injectable()
export class ProfileInfoRepository {
  constructor(
    @InjectRepository(StudentResultOrmEntity)
    private readonly studentResultRepository: Repository<StudentResultOrmEntity>,
    @InjectRepository(AvatarOrmEntity)
    private readonly avatarRepository: Repository<AvatarOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
  ) {}

  async findFullClientInfoByAuditoryId(auditoryId: string): Promise<{
    client: ClientOrmEntity;
    auditory: AuditoryOrmEntity;
    avatar: AvatarOrmEntity | null;
    studentResults: StudentResultOrmEntity[];
  } | null> {
    console.log('Looking for auditory:', auditoryId);

    const auditory = await this.auditoryRepository.findOne({
      where: { id: auditoryId },
    });

    console.log('Found auditory:', auditory ? { id: auditory.id } : null);

    if (!auditory) {
      return null;
    }
 
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    console.log(
      'Found client:',
      client ? { id: client.id, auditoryId: client.auditoryId } : null,
    );

    if (!client) {
      return null;
    }

    const [avatar, studentResults] = await Promise.all([
      this.avatarRepository.findOne({
        where: { auditoryId: client.auditoryId },
      }),
      this.studentResultRepository.find({
        where: { clientId: client.id },
        order: { completedAt: 'DESC' },
      }),
    ]);

    return {
      client,
      auditory,
      avatar,
      studentResults,
    };
  }

  async findFullClientInfoByClientId(clientId: string): Promise<{
    client: ClientOrmEntity;
    auditory: AuditoryOrmEntity;
    avatar: AvatarOrmEntity | null;
    studentResults: StudentResultOrmEntity[];
  } | null> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['auditory'],
    });

    if (!client) {
      return null;
    }

    const [avatar, studentResults] = await Promise.all([
      this.avatarRepository.findOne({
        where: { auditoryId: client.auditoryId },
      }),
      this.studentResultRepository.find({
        where: { clientId: client.id },
        order: { completedAt: 'DESC' },
      }),
    ]);

    return {
      client,
      auditory: client.auditory,
      avatar,
      studentResults,
    };
  }
}
