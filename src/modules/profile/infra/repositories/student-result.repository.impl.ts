import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStudentResultRepository } from '../../domain/interfaces/student-result.repository.interface';
import { StudentResult } from '../../domain/entities/student-result.entity';
import { StudentResultOrmEntity } from '../typeorm/student-result.orm-entity';

@Injectable()
export class StudentResultRepository implements IStudentResultRepository {
  constructor(
    @InjectRepository(StudentResultOrmEntity)
    private readonly studentResultRepository: Repository<StudentResultOrmEntity>,
  ) {}

  async findById(id: string): Promise<StudentResult | null> {
    const entity = await this.studentResultRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<StudentResult[]> {
    const entities = await this.studentResultRepository.find({
      where: { clientId },
      order: { completedAt: 'DESC' },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByLessonId(lessonId: string): Promise<StudentResult[]> {
    const entities = await this.studentResultRepository.find({
      where: { lessonId },
      order: { completedAt: 'DESC' },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByClientIdAndLessonId(clientId: string, lessonId: string): Promise<StudentResult | null> {
    const entity = await this.studentResultRepository.findOne({
      where: { clientId, lessonId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async save(result: StudentResult): Promise<StudentResult> {
    const entity = this.toOrmEntity(result);
    const saved = await this.studentResultRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<StudentResult>): Promise<boolean> {
    const result = await this.studentResultRepository.update(id, updates);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.studentResultRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await this.studentResultRepository.delete({ clientId });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(entity: StudentResultOrmEntity): StudentResult {
    const result = new StudentResult(
      entity.clientId,
      entity.lessonId,
      entity.countOfStars,
    );

    Object.assign(result, {
      id: entity.id,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return result;
  }

  private toOrmEntity(result: StudentResult): StudentResultOrmEntity {
    const entity = new StudentResultOrmEntity();
    entity.id = result.id;
    entity.clientId = result.clientId;
    entity.lessonId = result.lessonId;
    entity.countOfStars = result.countOfStars;
    entity.completedAt = result.completedAt;
    entity.createdAt = result.createdAt;
    entity.updatedAt = result.updatedAt;

    return entity;
  }
}
