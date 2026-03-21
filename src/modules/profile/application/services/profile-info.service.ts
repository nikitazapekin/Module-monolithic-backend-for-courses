import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileInfoRepository } from '../../infra/repositories/profile-info.repository.impl';
import { FullClientInfoDto } from '../dtos/full-client-info.dto';
import { AvatarResponseDto } from '../dtos/avatar-response.dto';
import { StudentResultResponseDto } from '../dtos/student-result-response.dto';

@Injectable()
export class ProfileInfoService {
  constructor(private readonly profileInfoRepository: ProfileInfoRepository) {}

  async getFullClientInfoByAuditoryId(
    auditoryId: string,
  ): Promise<FullClientInfoDto> {
    const data =
      await this.profileInfoRepository.findFullClientInfoByAuditoryId(
        auditoryId,
      );

    if (!data) {
      throw new NotFoundException(
        `Client with auditory ID ${auditoryId} not found`,
      );
    }

    const { client, auditory, avatar, studentResults } = data;

    const totalLessons = studentResults.length;
    const totalStars = studentResults.reduce(
      (sum, r) => sum + r.countOfStars,
      0,
    );
    const averageStars =
      totalLessons > 0
        ? Math.round((totalStars / totalLessons) * 100) / 100
        : 0;

    return {
      clientId: client.id,
      auditoryId: client.auditoryId,
      email: auditory.email,
      role: auditory.role,
      isActive: auditory.isActive,
      firstName: client.firstName,
      lastName: client.lastName,
      middleName: client.middleName,
      phone: client.phone,
      country: client.country,
      description: client.description,
      registeredAt: client.registeredAt,
      lastLoginAt: auditory.lastLoginAt,
      avatar: avatar ? this.mapAvatarToResponse(avatar) : undefined,
      studentResults: studentResults.map((result) =>
        this.mapStudentResultToResponse(result),
      ),
      totalLessons,
      averageStars,
    };
  }

  async getFullClientInfoByClientId(
    clientId: string,
  ): Promise<FullClientInfoDto> {
    const data =
      await this.profileInfoRepository.findFullClientInfoByClientId(clientId);

    if (!data) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const { client, auditory, avatar, studentResults } = data;

    const totalLessons = studentResults.length;
    const totalStars = studentResults.reduce(
      (sum, r) => sum + r.countOfStars,
      0,
    );
    const averageStars =
      totalLessons > 0
        ? Math.round((totalStars / totalLessons) * 100) / 100
        : 0;

    return {
      clientId: client.id,
      auditoryId: client.auditoryId,
      email: auditory.email,
      role: auditory.role,
      isActive: auditory.isActive,
      firstName: client.firstName,
      lastName: client.lastName,
      middleName: client.middleName,
      phone: client.phone,
      country: client.country,
      description: client.description,
      registeredAt: client.registeredAt,
      lastLoginAt: auditory.lastLoginAt,
      avatar: avatar ? this.mapAvatarToResponse(avatar) : undefined,
      studentResults: studentResults.map((result) =>
        this.mapStudentResultToResponse(result),
      ),
      totalLessons,
      averageStars,
    };
  }

  private mapAvatarToResponse(avatar: any): AvatarResponseDto {
    const response = new AvatarResponseDto();
    response.id = avatar.id;
    response.auditoryId = avatar.auditoryId;
    response.mimeType = avatar.mimeType;
    response.fileSize = avatar.fileSize;
    response.imageUrl = avatar.imageData;
    response.createdAt = avatar.createdAt;
    response.updatedAt = avatar.updatedAt;
    return response;
  }

  private mapStudentResultToResponse(result: any): StudentResultResponseDto {
    const response = new StudentResultResponseDto();
    response.id = result.id;
    response.clientId = result.clientId;
    response.lessonId = result.lessonId;
    response.countOfStars = result.countOfStars;
    response.completedAt = result.completedAt;
    response.createdAt = result.createdAt;
    response.updatedAt = result.updatedAt;
    return response;
  }
}
