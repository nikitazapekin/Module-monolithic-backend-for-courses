import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonRepository } from '../../domain/interfaces/lesson.repository.interface';
import { Lesson } from '../../domain/entities/lesson.entity';
import { LessonOrmEntity } from '../typeorm/lesson.orm-entity';

@Injectable()
export class LessonRepository implements ILessonRepository {
  constructor(
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepository: Repository<LessonOrmEntity>,
  ) {}

  async create(lesson: Lesson): Promise<Lesson> {
    console.log(
      `[LessonRepository] Creating lesson with orderIndex: ${lesson.orderIndex}`,
    );
 
    const result = await this.lessonRepository
      .createQueryBuilder()
      .insert()
      .into(LessonOrmEntity)
      .values({
        id: lesson.id,
        mapElementId: lesson.mapElementId,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isPublished: lesson.isPublished,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      })
      .execute();

    console.log(`[LessonRepository] Insert result:`, result);
 
    const saved = await this.lessonRepository.findOne({
      where: { id: lesson.id },
    });

    console.log(
      `[LessonRepository] Saved entity orderIndex: ${saved?.orderIndex}`,
    );
    return this.toDomain(saved!);
  }

  async findById(id: string): Promise<Lesson | null> {
    const entity = await this.lessonRepository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMapElementId(mapElementId: string): Promise<Lesson | null> {
    const entity = await this.lessonRepository.findOne({
      where: { mapElementId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAllByCourseMapId(courseMapId: string): Promise<Lesson[]> {
    
    const entities = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoin('lesson.mapElement', 'mapElement')
      .where('mapElement.courseMapId = :courseMapId', { courseMapId })
      .orderBy('lesson.orderIndex', 'ASC')
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async update(id: string, updates: Partial<Lesson>): Promise<boolean> {
    const entity = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return false;
    }

    Object.assign(entity, updates);
    entity.updatedAt = new Date();

    await this.lessonRepository.save(entity);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.lessonRepository.delete(id);
    return result.affected! > 0;
  }

  async deleteByMapElementId(mapElementId: string): Promise<boolean> {
    const result = await this.lessonRepository.delete({ mapElementId });
    return result.affected! > 0;
  }

  private toDomain(entity: LessonOrmEntity): Lesson {
    return new Lesson(
      entity.mapElementId,
      entity.title,
      entity.description,
      entity.orderIndex,
      entity.content,
      entity.duration,
      entity.isPublished,
      entity.id,
    );
  }

  private toOrmEntity(lesson: Lesson): LessonOrmEntity {
    const entity = new LessonOrmEntity();
    entity.id = lesson.id;
    entity.mapElementId = lesson.mapElementId;
    entity.title = lesson.title;
    entity.description = lesson.description;
    entity.content = lesson.content;
    entity.duration = lesson.duration;
    entity.orderIndex = lesson.orderIndex ?? 1;  
    entity.isPublished = lesson.isPublished;
    entity.createdAt = lesson.createdAt;
    entity.updatedAt = lesson.updatedAt;

    return entity;
  }
}
