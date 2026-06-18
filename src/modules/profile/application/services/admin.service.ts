import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminOrmEntity } from '../../../auth/infra/typeorm/admin.orm-entity';
import { AuditoryOrmEntity } from '../../../auth/infra/typeorm/auditory.orm-entity';
import { AdminResponseDto } from '../dtos/admin-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepository: Repository<AdminOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
  ) {}

  async getAllAdmins(): Promise<AdminResponseDto[]> {
    const admins = await this.adminRepository.find({
      relations: ['auditory'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return admins.map(this.mapToResponse);
  }

  async getAdminByAuditoryId(
    auditoryId: string,
  ): Promise<AdminResponseDto | null> {
    const admin = await this.adminRepository.findOne({
      where: { auditoryId },
      relations: ['auditory'],
    });

    if (!admin) {
      return null;
    }

    return this.mapToResponse(admin);
  }

  async getAdminById(id: string): Promise<AdminResponseDto | null> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['auditory'],
    });

    if (!admin) {
      return null;
    }

    return this.mapToResponse(admin);
  }

  private mapToResponse(admin: AdminOrmEntity): AdminResponseDto {
    return {
      id: admin.id,
      auditoryId: admin.auditoryId,
      email: admin.auditory?.email || '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      middleName: admin.middleName,
      phone: admin.phone,
      country: admin.country,
      description: admin.description,
      permissions: admin.permissions,
      registeredAt: admin.registeredAt,
      updatedAt: admin.updatedAt,
      isActive: admin.auditory?.isActive ?? true,
    };
  }
}
