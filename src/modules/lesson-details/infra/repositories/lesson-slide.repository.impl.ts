import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonSlideRepository } from '../../domain/interfaces/lesson-slide.repository.interface';
import { LessonSlide, SlideBlock } from '../../domain/entities/lesson-slide.entity';
import { LessonSlideOrmEntity } from '../typeorm/lesson-slide.orm-entity';

@Injectable()
export class LessonSlideRepository implements ILessonSlideRepository {
    constructor(
        @InjectRepository(LessonSlideOrmEntity)
        private readonly repo: Repository<LessonSlideOrmEntity>,
    ) { }

    async create(slide: LessonSlide): Promise<LessonSlide> {
        const entity = this.toOrm(slide);
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async createMany(slides: LessonSlide[]): Promise<LessonSlide[]> {
        const entities = slides.map((s) => this.toOrm(s));
        const saved = await this.repo.save(entities);
        return saved.map((e) => this.toDomain(e));
    }

    async findById(id: string): Promise<LessonSlide | null> {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findAllByLessonDetailsId(lessonDetailsId: string): Promise<LessonSlide[]> {
        const entities = await this.repo.find({
            where: { lessonDetailsId },
            order: { orderIndex: 'ASC' },
        });
        return entities.map((e) => this.toDomain(e));
    }

    async update(id: string, updates: Partial<LessonSlide>): Promise<boolean> {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity) return false;
        Object.assign(entity, updates);
        entity.updatedAt = new Date();
        await this.repo.save(entity);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return result.affected! > 0;
    }

    async deleteAllByLessonDetailsId(lessonDetailsId: string): Promise<boolean> {
        const result = await this.repo.delete({ lessonDetailsId });
        return result.affected! >= 0;
    }

    private toDomain(entity: LessonSlideOrmEntity): LessonSlide {
        const slide = new LessonSlide(
            entity.lessonDetailsId,
            entity.title,
            entity.type,
            entity.orderIndex,
            (entity.blocks ?? []) as SlideBlock[],
            entity.id,
        );
        slide.createdAt = entity.createdAt;
        slide.updatedAt = entity.updatedAt;
        return slide;
    }

    private toOrm(slide: LessonSlide): LessonSlideOrmEntity {
        const entity = new LessonSlideOrmEntity();
        entity.id = slide.id;
        entity.lessonDetailsId = slide.lessonDetailsId;
        entity.title = slide.title;
        entity.type = slide.type;
        entity.orderIndex = slide.orderIndex;
        entity.blocks = slide.blocks as object[];
        entity.createdAt = slide.createdAt;
        entity.updatedAt = slide.updatedAt;
        return entity;
    }
}
