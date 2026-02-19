import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonTestRepository } from '../../domain/interfaces/lesson-test.repository.interface';
import { LessonTest, TestBlock } from '../../domain/entities/lesson-test.entity';
import { LessonTestOrmEntity } from '../typeorm/lesson-test.orm-entity';

@Injectable()
export class LessonTestRepository implements ILessonTestRepository {
    constructor(
        @InjectRepository(LessonTestOrmEntity)
        private readonly repo: Repository<LessonTestOrmEntity>,
    ) { }

    async create(test: LessonTest): Promise<LessonTest> {
        const entity = this.toOrm(test);
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async createMany(tests: LessonTest[]): Promise<LessonTest[]> {
        const entities = tests.map((t) => this.toOrm(t));
        const saved = await this.repo.save(entities);
        return saved.map((e) => this.toDomain(e));
    }

    async findById(id: string): Promise<LessonTest | null> {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findAllByLessonDetailsId(lessonDetailsId: string): Promise<LessonTest[]> {
        const entities = await this.repo.find({
            where: { lessonDetailsId },
            order: { orderIndex: 'ASC' },
        });
        return entities.map((e) => this.toDomain(e));
    }

    async update(id: string, updates: Partial<LessonTest>): Promise<boolean> {
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

    private toDomain(entity: LessonTestOrmEntity): LessonTest {
        const test = new LessonTest(
            entity.lessonDetailsId,
            entity.title,
            entity.orderIndex,
            (entity.blocks ?? []) as TestBlock[],
            entity.id,
        );
        test.createdAt = entity.createdAt;
        test.updatedAt = entity.updatedAt;
        return test;
    }

    private toOrm(test: LessonTest): LessonTestOrmEntity {
        const entity = new LessonTestOrmEntity();
        entity.id = test.id;
        entity.lessonDetailsId = test.lessonDetailsId;
        entity.title = test.title;
        entity.orderIndex = test.orderIndex;
        entity.blocks = test.blocks as object[];
        entity.createdAt = test.createdAt;
        entity.updatedAt = test.updatedAt;
        return entity;
    }
}
