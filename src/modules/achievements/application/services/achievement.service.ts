import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { IAchievementRepository } from '../../domain/interfaces/achievement.repository.interface';
import {
  Achievement,
  AchievementType,
  AchievementTier,
} from '../../domain/entities/achievement.entity';
import { CreateAchievementDto } from '../dtos/create-achievement.dto';
import { UpdateAchievementDto } from '../dtos/update-achievement.dto';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';
import { StudentResultOrmEntity } from '../../../profile/infra/typeorm/student-result.orm-entity';
import { StudentLevelOrmEntity } from '../../../coding-tasks/infra/typeorm/student-level.orm-entity';
import { SolvedTaskOrmEntity } from '../../../coding-tasks/infra/typeorm/solved-task.orm-entity';
 
export const ACHIEVEMENT_DEFINITIONS: {
  [key in AchievementTier]: {
    title: string;
    description: string;
    image: string;
    type: AchievementType;
    threshold: number;
  };
} = {
  
  [AchievementTier.NOVICE]: {
    title: 'Novice',
    description: 'Выполнил хотя бы 1 урок с более чем 1 звездой',
    image: './assets/icons/studying.png',
    type: AchievementType.STUDENT_RESULTS,
    threshold: 1,
  },
  [AchievementTier.ADVANCED]: {
    title: 'Advanced',
    description: 'Выполнил хотя бы 10 уроков с более чем 1 звездой',
    image: 'https://cdn-icons-png.flaticon.com/512/2913/2913524.png',
    type: AchievementType.STUDENT_RESULTS,
    threshold: 10,
  },
  [AchievementTier.EXPERT]: {
    title: 'Expert',
    description: 'Выполнил хотя бы 50 уроков с более чем 1 звездой',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    type: AchievementType.STUDENT_RESULTS,
    threshold: 50,
  },
  [AchievementTier.MASTER]: {
    title: 'Master',
    description: 'Выполнил хотя бы 100 уроков с более чем 1 звездой',
    image: 'https://cdn-icons-png.flaticon.com/512/883/883699.png',
    type: AchievementType.STUDENT_RESULTS,
    threshold: 100,
  },

  [AchievementTier.BEGINNER]: {
    title: 'Beginner',
    description: 'Решил 5 задач',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
    type: AchievementType.SOLVED_TASKS,
    threshold: 5,
  },
  [AchievementTier.INTERMEDIATE]: {
    title: 'Intermediate',
    description: 'Решил 20 задач',
    image: 'https://cdn-icons-png.flaticon.com/512/2326/2326686.png',
    type: AchievementType.SOLVED_TASKS,
    threshold: 20,
  },
  [AchievementTier.PROFESSIONAL]: {
    title: 'Professional',
    description: 'Решил 50 задач',
    image: 'https://cdn-icons-png.flaticon.com/512/2913/2913524.png',
    type: AchievementType.SOLVED_TASKS,
    threshold: 50,
  },
  [AchievementTier.LEGENDARY]: {
    title: 'Legendary',
    description: 'Решил 100 задач',
    image: 'https://cdn-icons-png.flaticon.com/512/883/883699.png',
    type: AchievementType.SOLVED_TASKS,
    threshold: 100,
  },
};

@Injectable()
export class AchievementService {
  constructor(
    @Inject('IAchievementRepository')
    private readonly achievementRepository: IAchievementRepository,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(StudentResultOrmEntity)
    private readonly studentResultRepository: Repository<StudentResultOrmEntity>,
    @InjectRepository(StudentLevelOrmEntity)
    private readonly studentLevelRepository: Repository<StudentLevelOrmEntity>,
    @InjectRepository(SolvedTaskOrmEntity)
    private readonly solvedTaskRepository: Repository<SolvedTaskOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}
 
  private async getClientIdFromAuditoryId(auditoryId: string): Promise<string> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with auditory ID ${auditoryId} not found`,
      );
    }

    return client.id;
  }
 
  private async getStudentResultsCount(clientId: string): Promise<number> {
    const count = await this.studentResultRepository
      .createQueryBuilder('student_result')
      .where('student_result.clientId = :clientId', { clientId })
      .andWhere('student_result.countOfStars > :stars', { stars: 1 })
      .getCount();

    return count;
  }
 
  private async getSolvedTasksCount(clientId: string): Promise<number> {
    const studentLevel = await this.studentLevelRepository.findOne({
      where: { clientId },
      relations: ['solvedTasks'],
    });

    if (!studentLevel) {
      return 0;
    }

    return studentLevel.solvedTasks?.length || 0;
  }
 
  async checkAndAwardAchievements(auditoryId: string): Promise<Achievement[]> {
    const clientId = await this.getClientIdFromAuditoryId(auditoryId);
    const awardedAchievements: Achievement[] = [];

    
    const studentResultsCount = await this.getStudentResultsCount(clientId);

    for (const tier of [
      AchievementTier.MASTER,
      AchievementTier.EXPERT,
      AchievementTier.ADVANCED,
      AchievementTier.NOVICE,
    ]) {
      const definition = ACHIEVEMENT_DEFINITIONS[tier];
      if (definition.type !== AchievementType.STUDENT_RESULTS) continue;

      const alreadyHas = await this.achievementRepository.exists(
        clientId,
        tier,
      );
      if (!alreadyHas && studentResultsCount >= definition.threshold) {
        const achievement = new Achievement(
          clientId,
          definition.type,
          tier,
          definition.title,
          definition.description,
          definition.image,
        );
        try {
          const saved = await this.achievementRepository.save(achievement);
          awardedAchievements.push(saved);
        } catch (error) {
         
          const isUniqueViolation =
            error instanceof QueryFailedError &&
            (error.driverError?.code === '23505' ||
              error.driverError?.code?.includes('SQLITE_CONSTRAINT'));

          if (!isUniqueViolation) {
            throw error;
          }
        }
      }
    }
 
    const solvedTasksCount = await this.getSolvedTasksCount(clientId);

    for (const tier of [
      AchievementTier.LEGENDARY,
      AchievementTier.PROFESSIONAL,
      AchievementTier.INTERMEDIATE,
      AchievementTier.BEGINNER,
    ]) {
      const definition = ACHIEVEMENT_DEFINITIONS[tier];
      if (definition.type !== AchievementType.SOLVED_TASKS) continue;

      const alreadyHas = await this.achievementRepository.exists(
        clientId,
        tier,
      );
      if (!alreadyHas && solvedTasksCount >= definition.threshold) {
        const achievement = new Achievement(
          clientId,
          definition.type,
          tier,
          definition.title,
          definition.description,
          definition.image,
        );
        try {
          const saved = await this.achievementRepository.save(achievement);
          awardedAchievements.push(saved);
        } catch (error) {
         
          const isUniqueViolation =
            error instanceof QueryFailedError &&
            (error.driverError?.code === '23505' ||
              error.driverError?.code?.includes('SQLITE_CONSTRAINT'));

          if (!isUniqueViolation) {
            throw error;
          }
        }
      }
    }

    return awardedAchievements;
  }
 
  async create(
    createAchievementDto: CreateAchievementDto,
  ): Promise<Achievement> {
    try {
      const clientId = await this.getClientIdFromAuditoryId(
        createAchievementDto.auditoryId,
      );

      const achievement = new Achievement(
        clientId,
        createAchievementDto.type,
        createAchievementDto.tier,
        createAchievementDto.title,
        createAchievementDto.description,
        createAchievementDto.image ||
          ACHIEVEMENT_DEFINITIONS[createAchievementDto.tier]?.image ||
          '',
      );

      const saved = await this.achievementRepository.save(achievement);
      console.log(`Achievement created successfully with ID: ${saved.id}`);

      return this.findById(saved.id);
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw new BadRequestException(
        `Failed to create achievement: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Achievement> {
    const achievement = await this.achievementRepository.findById(id);
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return achievement;
  }

  async findByClientId(clientId: string): Promise<Achievement[]> {
    return this.achievementRepository.findByClientId(clientId);
  }

  async findByAuditoryId(auditoryId: string): Promise<Achievement[]> {
    const clientId = await this.getClientIdFromAuditoryId(auditoryId);
    return this.findByClientId(clientId);
  }

  async update(
    id: string,
    updateAchievementDto: UpdateAchievementDto,
  ): Promise<Achievement> {
    const achievement = await this.achievementRepository.findById(id);
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    const updates: Partial<Achievement> = {};

    if (updateAchievementDto.image) {
      updates.image = updateAchievementDto.image;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await this.achievementRepository.update(id, updates);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const achievement = await this.achievementRepository.findById(id);
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return this.achievementRepository.delete(id);
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    return this.achievementRepository.deleteByClientId(clientId);
  }
 
  getAchievementDefinitions(): typeof ACHIEVEMENT_DEFINITIONS {
    return ACHIEVEMENT_DEFINITIONS;
  }
 
  async getAchievementProgress(auditoryId: string): Promise<{
    studentResults: {
      current: number;
      thresholds: { tier: AchievementTier; required: number }[];
    };
    solvedTasks: {
      current: number;
      thresholds: { tier: AchievementTier; required: number }[];
    };
  }> {
    const clientId = await this.getClientIdFromAuditoryId(auditoryId);
    const studentResultsCount = await this.getStudentResultsCount(clientId);
    const solvedTasksCount = await this.getSolvedTasksCount(clientId);

    return {
      studentResults: {
        current: studentResultsCount,
        thresholds: [
          { tier: AchievementTier.NOVICE, required: 1 },
          { tier: AchievementTier.ADVANCED, required: 10 },
          { tier: AchievementTier.EXPERT, required: 50 },
          { tier: AchievementTier.MASTER, required: 100 },
        ],
      },
      solvedTasks: {
        current: solvedTasksCount,
        thresholds: [
          { tier: AchievementTier.BEGINNER, required: 5 },
          { tier: AchievementTier.INTERMEDIATE, required: 20 },
          { tier: AchievementTier.PROFESSIONAL, required: 50 },
          { tier: AchievementTier.LEGENDARY, required: 100 },
        ],
      },
    };
  }
}
