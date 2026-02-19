import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonDetailsRepository } from '../../domain/interfaces/lesson-details.repository.interface';
import { ILessonSlideRepository } from '../../domain/interfaces/lesson-slide.repository.interface';
import { ILessonTestRepository } from '../../domain/interfaces/lesson-test.repository.interface';
import { LessonDetails } from '../../domain/entities/lesson-details.entity';
import { LessonSlide, SlideBlock } from '../../domain/entities/lesson-slide.entity';
import { LessonTest, TestBlock } from '../../domain/entities/lesson-test.entity';
import { CreateLessonDetailsDto } from '../dtos/create-lesson-details.dto';
import { UpdateLessonDetailsDto } from '../dtos/update-lesson-details.dto';
import {
    LessonDetailsResponseDto,
    SlideResponseDto,
    TestResponseDto,
} from '../dtos/lesson-details-response.dto';
import { LessonDetailsOrmEntity } from '../../infra/typeorm/lesson-details.orm-entity';

@Injectable()
export class LessonDetailsService {
    constructor(
        @Inject('ILessonDetailsRepository')
        private readonly detailsRepo: ILessonDetailsRepository,
        @Inject('ILessonSlideRepository')
        private readonly slideRepo: ILessonSlideRepository,
        @Inject('ILessonTestRepository')
        private readonly testRepo: ILessonTestRepository,
        @InjectRepository(LessonDetailsOrmEntity)
        private readonly detailsOrmRepo: Repository<LessonDetailsOrmEntity>,
    ) { }

    async createLessonDetails(dto: CreateLessonDetailsDto): Promise<LessonDetailsResponseDto> {
        const existing = await this.detailsRepo.findByLessonId(dto.lessonId);
        if (existing) {
            throw new ConflictException('LessonDetails already exists for this lesson');
        }

        const details = new LessonDetails(dto.lessonId);
        const savedDetails = await this.detailsRepo.create(details);

        const slides: LessonSlide[] = [];
        if (dto.slides?.length) {
            const slideEntities = dto.slides.map(
                (s, idx) =>
                    new LessonSlide(
                        savedDetails.id,
                        s.title,
                        s.type,
                        s.orderIndex ?? idx,
                        (s.blocks ?? []) as unknown as SlideBlock[],
                    ),
            );
            slides.push(...(await this.slideRepo.createMany(slideEntities)));
        }

        const tests: LessonTest[] = [];
        if (dto.tests?.length) {
            const testEntities = dto.tests.map(
                (t, idx) =>
                    new LessonTest(
                        savedDetails.id,
                        t.title,
                        t.orderIndex ?? idx,
                        (t.blocks ?? []) as unknown as TestBlock[],
                    ),
            );
            tests.push(...(await this.testRepo.createMany(testEntities)));
        }

        return this.toResponseDto(savedDetails, slides, tests);
    }

    async getLessonDetailsById(id: string): Promise<LessonDetailsResponseDto> {
        const details = await this.detailsRepo.findById(id);
        if (!details) throw new NotFoundException('LessonDetails not found');
        return this.loadFull(details);
    }

    async getLessonDetailsByLessonId(lessonId: string): Promise<LessonDetailsResponseDto> {
        const details = await this.detailsRepo.findByLessonId(lessonId);
        if (!details) throw new NotFoundException('LessonDetails not found for this lesson');
        return this.loadFull(details);
    }

    async updateLessonDetails(
        id: string,
        dto: UpdateLessonDetailsDto,
    ): Promise<LessonDetailsResponseDto> {
        const details = await this.detailsRepo.findById(id);
        if (!details) throw new NotFoundException('LessonDetails not found');

        if (dto.slides !== undefined) {
            await this.slideRepo.deleteAllByLessonDetailsId(id);
            if (dto.slides.length) {
                const slideEntities = dto.slides.map(
                    (s, idx) =>
                        new LessonSlide(
                            id,
                            s.title,
                            s.type,
                            s.orderIndex ?? idx,
                            (s.blocks ?? []) as unknown as SlideBlock[],
                        ),
                );
                await this.slideRepo.createMany(slideEntities);
            }
        }

        if (dto.tests !== undefined) {
            await this.testRepo.deleteAllByLessonDetailsId(id);
            if (dto.tests.length) {
                const testEntities = dto.tests.map(
                    (t, idx) =>
                        new LessonTest(
                            id,
                            t.title,
                            t.orderIndex ?? idx,
                            (t.blocks ?? []) as unknown as TestBlock[],
                        ),
                );
                await this.testRepo.createMany(testEntities);
            }
        }

        details.update();
        await this.detailsRepo.update(id, details);
        return this.loadFull(details);
    }

    async deleteLessonDetails(id: string): Promise<{ success: boolean }> {
        const details = await this.detailsRepo.findById(id);
        if (!details) throw new NotFoundException('LessonDetails not found');
        const ok = await this.detailsRepo.delete(id);
        return { success: ok };
    }

    async deleteLessonDetailsByLessonId(lessonId: string): Promise<{ success: boolean }> {
        const ok = await this.detailsRepo.deleteByLessonId(lessonId);
        return { success: ok };
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    private async loadFull(details: LessonDetails): Promise<LessonDetailsResponseDto> {
        const slides = await this.slideRepo.findAllByLessonDetailsId(details.id);
        const tests = await this.testRepo.findAllByLessonDetailsId(details.id);
        return this.toResponseDto(details, slides, tests);
    }

    private toResponseDto(
        details: LessonDetails,
        slides: LessonSlide[],
        tests: LessonTest[],
    ): LessonDetailsResponseDto {
        const dto = new LessonDetailsResponseDto();
        dto.id = details.id;
        dto.lessonId = details.lessonId;
        dto.createdAt = details.createdAt;
        dto.updatedAt = details.updatedAt;

        dto.slides = slides.map((s) => {
            const r = new SlideResponseDto();
            r.id = s.id;
            r.lessonDetailsId = s.lessonDetailsId;
            r.title = s.title;
            r.type = s.type;
            r.orderIndex = s.orderIndex;
            r.blocks = s.blocks as unknown as object[];
            r.createdAt = s.createdAt;
            r.updatedAt = s.updatedAt;
            return r;
        });

        dto.tests = tests.map((t) => {
            const r = new TestResponseDto();
            r.id = t.id;
            r.lessonDetailsId = t.lessonDetailsId;
            r.title = t.title;
            r.orderIndex = t.orderIndex;
            r.blocks = t.blocks as unknown as object[];
            r.createdAt = t.createdAt;
            r.updatedAt = t.updatedAt;
            return r;
        });

        return dto;
    }
}
