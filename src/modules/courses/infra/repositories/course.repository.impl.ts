import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ICourseRepository } from '../../domain/interfaces/course.repository.interface';
import { Course, CourseStatus } from '../../domain/entities/course.entity';
import { CourseOrmEntity } from '../typeorm/course.orm-entity';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepository: Repository<CourseOrmEntity>,
  ) {}

  async create(course: Course): Promise<Course> {
    console.log('AdminId repository:', course.adminId);

    const entity = this.toCourseOrmEntity(course);
    const saved = await this.courseRepository.save(entity);
    return this.toCourseDomain(saved);
  }

  async findById(id: string): Promise<Course | null> {
    const entity = await this.courseRepository.findOne({ where: { id } });
    return entity ? this.toCourseDomain(entity) : null;
  }

  async findAll(options?: {
    adminId?: string;
    status?: CourseStatus;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }> {
    const { adminId, status, skip = 0, take = 10, search } = options || {};

    const where: any = {};

    if (adminId) where.adminId = adminId;
    if (status) where.status = status;
    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [entities, total] = await this.courseRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    const courses = entities.map((entity) => this.toCourseDomain(entity));
    return { courses, total };
  }

  async update(id: string, updates: Partial<Course>): Promise<boolean> {
    /*    const result = await this.courseRepository.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    return result.affected > 0; */

    return true;
  }

  async delete(id: string): Promise<boolean> {
    /*   const result = await this.courseRepository.delete(id);
    return result.affected > 0; */

    return true;
  }

  async findByAdminId(adminId: string): Promise<Course[]> {
    const entities = await this.courseRepository.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toCourseDomain(entity));
  }

  async findByStatus(status: CourseStatus): Promise<Course[]> {
    const entities = await this.courseRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toCourseDomain(entity));
  }

  async findByTag(tag: string): Promise<Course[]> {
    const entities = await this.courseRepository
      .createQueryBuilder('course')
      .where(':tag = ANY(course.tags)', { tag })
      .orderBy('course.createdAt', 'DESC')
      .getMany();

    return entities.map((entity) => this.toCourseDomain(entity));
  }

  async existsByTitle(title: string): Promise<boolean> {
    const count = await this.courseRepository.count({
      where: { title: ILike(title) },
    });
    return count > 0;
  }

  // Преобразования Domain ↔ ORM
  private toCourseDomain(entity: CourseOrmEntity): Course {
    const course = new Course(
      entity.title,
      entity.description,
      entity.type,
      entity.language,
      entity.tags,
      entity.logo,
      entity.adminId,
      entity.status as CourseStatus,
    );

    Object.assign(course, {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      publishedAt: entity.publishedAt,
    });

    return course;
  }

  private toCourseOrmEntity(course: Course): CourseOrmEntity {
    const entity = new CourseOrmEntity();
    entity.id = course.id;
    entity.title = course.title;
    entity.description = course.description;
    entity.type = course.type;
    entity.language = course.language;
    entity.tags = course.tags;
    entity.logo = course.logo;
    entity.status = course.status;
    entity.adminId = course.adminId;

    entity.createdAt = course.createdAt;
    entity.updatedAt = course.updatedAt;
    entity.publishedAt = course.publishedAt!;

    return entity;
  }
}
