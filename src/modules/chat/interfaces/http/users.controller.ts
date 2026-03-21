import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @CurrentUser() user: any,
  ) {
    if (!query || query.trim().length < 1) {
      return { success: true, data: [] };
    }

    const searchTerm = `%${query.trim()}%`;

    const users = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.auditoryId != :currentUserId', { currentUserId: user.userId })
      .andWhere(
        '(client.firstName ILIKE :searchTerm OR client.lastName ILIKE :searchTerm OR CONCAT(client.firstName, \' \', client.lastName) ILIKE :searchTerm)',
        { searchTerm },
      )
      .innerJoinAndSelect('client.auditory', 'auditory')
      .select([
        'client.id',
        'client.firstName',
        'client.lastName',
        'client.middleName',
        'client.auditoryId',
        'auditory.id',
        'auditory.email',
      ])
      .limit(20)
      .getMany();

    const formattedUsers = users.map((user) => ({
      id: user.auditoryId,
      clientId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.auditory.email,
      fullName: `${user.firstName} ${user.lastName}`,
    }));

    return { success: true, data: formattedUsers };
  }

  @Get('profile/:userId')
  async getUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.auditoryId = :userId', { userId })
      .innerJoinAndSelect('client.auditory', 'auditory')
      .select([
        'client.id',
        'client.firstName',
        'client.lastName',
        'client.middleName',
        'client.phone',
        'client.country',
        'client.description',
        'client.auditoryId',
        'client.registeredAt',
        'auditory.id',
        'auditory.email',
        'auditory.role',
      ])
      .getOne();

    if (!client) {
      return { success: false, message: 'User not found' };
    }

    return {
      success: true,
      data: {
        id: client.auditoryId,
        clientId: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        middleName: client.middleName,
        phone: client.phone,
        country: client.country,
        description: client.description,
        email: client.auditory.email,
        role: client.auditory.role,
        registeredAt: client.registeredAt,
        fullName: `${client.firstName} ${client.lastName}`,
      },
    };
  }

  @Get('profiles')
  async getMultipleUserProfiles(
    @Query('ids') ids: string,
    @CurrentUser() currentUser: any,
  ) {
    const userIds = ids.split(',').filter((id) => id.trim());

    if (userIds.length === 0) {
      return { success: true, data: {} };
    }

    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.auditoryId IN (:...userIds)', { userIds })
      .innerJoinAndSelect('client.auditory', 'auditory')
      .select([
        'client.id',
        'client.firstName',
        'client.lastName',
        'client.auditoryId',
      ])
      .getMany();

    const profilesMap = clients.reduce((acc, client) => {
      acc[client.auditoryId] = {
        firstName: client.firstName,
        lastName: client.lastName,
        fullName: `${client.firstName} ${client.lastName}`,
      };
      return acc;
    }, {} as Record<string, any>);

    return { success: true, data: profilesMap };
  }
}
