import { Injectable } from '@nestjs/common';
import { StudentsRepository } from '../../infra/repositories/students.repository.impl';
import { StudentResponseDto } from '../dtos/student-response.dto';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async getStudents({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ students: StudentResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { students, total } = await this.studentsRepository.findStudents({ page, limit, search });

    const totalPages = Math.ceil(total / limit);

    return {
      students: students.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private mapToResponse(client: ClientOrmEntity): StudentResponseDto {
    return {
      id: client.id,
      auditoryId: client.auditoryId,
      email: client.auditory?.email || '',
      role: client.auditory?.role || 'client',
      firstName: client.firstName,
      lastName: client.lastName,
      middleName: client.middleName,
      phone: client.phone,
      country: client.country,
      description: client.description,
      registeredAt: client.registeredAt,
      updatedAt: client.updatedAt,
      lastLoginAt: client.auditory?.lastLoginAt || null,
      isActive: client.auditory?.isActive ?? true,
    };
  }
}
