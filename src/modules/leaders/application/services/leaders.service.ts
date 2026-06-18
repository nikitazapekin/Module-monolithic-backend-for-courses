import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';
import { AvatarOrmEntity } from '@modules/profile/infra/typeorm/avatar.orm-entity';
import {
  LeaderEntryDto,
  LeaderboardResponseDto,
} from '../dtos/leaderboard-response.dto';
import { LeaderOrmEntity } from '../../infra/typeorm/leader.orm-entity';

const LEADERBOARD_PAGE_SIZE = 50;

@Injectable()
export class LeadersService {
  constructor(
    @InjectRepository(LeaderOrmEntity)
    private readonly leaderRepository: Repository<LeaderOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(AvatarOrmEntity)
    private readonly avatarRepository: Repository<AvatarOrmEntity>,
  ) {}

  async getLeaderboardByAuditoryId(
    auditoryId: string,
    page = 1,
  ): Promise<LeaderboardResponseDto> {
    const currentClient = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!currentClient) {
      throw new NotFoundException(
        `Client with auditory ID ${auditoryId} not found`,
      );
    }

    await this.synchronizeLeaders();

    const leaders = await this.leaderRepository
      .createQueryBuilder('leader')
      .innerJoinAndSelect('leader.client', 'client')
      .leftJoinAndSelect('client.studentLevel', 'studentLevel')
      .orderBy('leader.score', 'DESC')
      .addOrderBy('studentLevel.level', 'DESC')
      .addOrderBy('client.lastName', 'ASC')
      .addOrderBy('client.firstName', 'ASC')
      .addOrderBy('client.id', 'ASC')
      .getMany();

    const auditoryIds = leaders
      .map((leader) => leader.client?.auditoryId)
      .filter((value): value is string => Boolean(value));

    const avatars =
      auditoryIds.length > 0
        ? await this.avatarRepository.find({
            where: { auditoryId: In(auditoryIds) },
          })
        : [];

    const avatarMap = new Map(
      avatars.map((avatar) => [avatar.auditoryId, avatar]),
    );

    const leaderboard = leaders.map((leader, index) =>
      this.toLeaderboardEntry(
        leader,
        avatarMap.get(leader.client.auditoryId) ?? null,
        index + 1,
      ),
    );

    const totalStudents = leaderboard.length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalStudents / LEADERBOARD_PAGE_SIZE),
    );
    const normalizedPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (normalizedPage - 1) * LEADERBOARD_PAGE_SIZE;
    const paginatedLeaders = leaderboard.slice(
      startIndex,
      startIndex + LEADERBOARD_PAGE_SIZE,
    );

    return {
      leaders: paginatedLeaders,
      currentUser:
        leaderboard.find((leader) => leader.clientId === currentClient.id) ??
        null,
      totalStudents,
      page: normalizedPage,
      limit: LEADERBOARD_PAGE_SIZE,
      totalPages,
    };
  }

  private async synchronizeLeaders(): Promise<void> {
    const [clients, existingLeaders] = await Promise.all([
      this.clientRepository.find({ relations: ['studentLevel'] }),
      this.leaderRepository.find(),
    ]);

    if (clients.length === 0) {
      return;
    }

    const leaderByClientId = new Map(
      existingLeaders.map((leader) => [leader.clientId, leader]),
    );
    const leadersToSave: LeaderOrmEntity[] = [];

    for (const client of clients) {
      const studentLevel = client.studentLevel;
      const score = this.calculateTotalScore(
        studentLevel?.level ?? 1,
        studentLevel?.experience ?? 0,
      );
      const existingLeader = leaderByClientId.get(client.id);

      if (!existingLeader) {
        leadersToSave.push(
          this.leaderRepository.create({
            id: uuidv4(),
            clientId: client.id,
            score,
          }),
        );
        continue;
      }

      if (existingLeader.score !== score) {
        existingLeader.score = score;
        leadersToSave.push(existingLeader);
      }
    }

    if (leadersToSave.length > 0) {
      await this.leaderRepository.save(leadersToSave);
    }
  }

  private calculateTotalScore(level: number, experience: number): number {
    const normalizedLevel = Math.max(level ?? 1, 1);
    let totalScore = Math.max(experience ?? 0, 0);

    for (let currentLevel = 1; currentLevel < normalizedLevel; currentLevel++) {
      totalScore += this.getRequiredExperience(currentLevel);
    }

    return totalScore;
  }

  private getRequiredExperience(level: number): number {
    return Math.pow(10, level - 1);
  }

  private buildFullName(client: ClientOrmEntity): string {
    return [client.lastName, client.firstName, client.middleName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  private toLeaderboardEntry(
    leader: LeaderOrmEntity,
    avatar: AvatarOrmEntity | null,
    rank: number,
  ): LeaderEntryDto {
    return {
      id: leader.id,
      clientId: leader.clientId,
      auditoryId: leader.client.auditoryId,
      firstName: leader.client.firstName,
      lastName: leader.client.lastName,
      middleName: leader.client.middleName,
      fullName: this.buildFullName(leader.client) || 'Студент',
      score: leader.score,
      rank,
      level: leader.client.studentLevel?.level ?? 1,
      avatarUrl: avatar?.imageData ?? null,
      avatarMimeType: avatar?.mimeType ?? null,
    };
  }
}
