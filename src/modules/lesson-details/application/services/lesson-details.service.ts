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
import {
  LessonSlide,
  SlideBlock,
} from '../../domain/entities/lesson-slide.entity';
import {
  LessonTest,
  TestBlock,
} from '../../domain/entities/lesson-test.entity';
import { CreateLessonDetailsDto } from '../dtos/create-lesson-details.dto';
import { UpdateLessonDetailsDto } from '../dtos/update-lesson-details.dto';
import {
  LessonDetailsResponseDto,
  SlideResponseDto,
  TestResponseDto,
} from '../dtos/lesson-details-response.dto';
import { LessonDetailsOrmEntity } from '../../infra/typeorm/lesson-details.orm-entity';
import { normalizeLessonBlocks } from '../utils/fill-task-normalizer';

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
  ) {}

  async createLessonDetails(
    dto: CreateLessonDetailsDto,
  ): Promise<LessonDetailsResponseDto> {
    if (!dto.lessonId && !dto.checkpointId) {
      throw new ConflictException(
        'Either lessonId or checkpointId must be provided',
      );
    }

    if (dto.lessonId && dto.checkpointId) {
      throw new ConflictException(
        'LessonDetails can be linked only to lesson or checkpoint',
      );
    }

    const existing = dto.lessonId
      ? await this.detailsRepo.findByLessonId(dto.lessonId)
      : await this.detailsRepo.findByCheckpointId(dto.checkpointId!);
    if (existing) {
      throw new ConflictException(
        dto.lessonId
          ? 'LessonDetails already exists for this lesson'
          : 'LessonDetails already exists for this checkpoint',
      );
    }

    const details = new LessonDetails(dto.lessonId, dto.checkpointId);
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
            normalizeLessonBlocks(s.blocks) as unknown as SlideBlock[],
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
            normalizeLessonBlocks(t.blocks) as unknown as TestBlock[],
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

  async getLessonDetailsByLessonId(
    lessonId: string,
  ): Promise<LessonDetailsResponseDto> {
    const details = await this.detailsRepo.findByLessonId(lessonId);
    if (!details)
      throw new NotFoundException('LessonDetails not found for this lesson');
    return this.loadFull(details);
  }

  async getLessonDetailsByCheckpointId(
    checkpointId: string,
  ): Promise<LessonDetailsResponseDto> {
    const details = await this.detailsRepo.findByCheckpointId(checkpointId);
    if (!details) {
      throw new NotFoundException(
        'LessonDetails not found for this checkpoint',
      );
    }

    return this.loadFull(details);
  }

  async updateLessonDetails(
    id: string,
    dto: UpdateLessonDetailsDto,
  ): Promise<LessonDetailsResponseDto> {
    const details = await this.detailsRepo.findById(id);
    if (!details) throw new NotFoundException('LessonDetails not found');

    if (dto.slides !== undefined) {
      const existingSlides = await this.slideRepo.findAllByLessonDetailsId(id);
      const existingSlidesById = new Map(
        existingSlides.map((slide) => [slide.id, slide]),
      );
      const incomingSlideIds = new Set<string>();

      for (const [idx, slideDto] of dto.slides.entries()) {
        const normalizedBlocks = normalizeLessonBlocks(
          slideDto.blocks,
        ) as unknown as SlideBlock[];
        const orderIndex = slideDto.orderIndex ?? idx;

        if (slideDto.id && existingSlidesById.has(slideDto.id)) {
          incomingSlideIds.add(slideDto.id);
          await this.slideRepo.update(slideDto.id, {
            title: slideDto.title,
            type: slideDto.type,
            orderIndex,
            blocks: normalizedBlocks,
          });
          continue;
        }

        await this.slideRepo.create(
          new LessonSlide(
            id,
            slideDto.title,
            slideDto.type,
            orderIndex,
            normalizedBlocks,
          ),
        );
      }

      for (const existingSlide of existingSlides) {
        if (!incomingSlideIds.has(existingSlide.id)) {
          await this.slideRepo.delete(existingSlide.id);
        }
      }
    }

    if (dto.tests !== undefined) {
      const existingTests = await this.testRepo.findAllByLessonDetailsId(id);
      const existingTestsById = new Map(
        existingTests.map((test) => [test.id, test]),
      );
      const incomingTestIds = new Set<string>();

      for (const [idx, testDto] of dto.tests.entries()) {
        const normalizedBlocks = normalizeLessonBlocks(
          testDto.blocks,
        ) as unknown as TestBlock[];
        const orderIndex = testDto.orderIndex ?? idx;

        if (testDto.id && existingTestsById.has(testDto.id)) {
          incomingTestIds.add(testDto.id);
          await this.testRepo.update(testDto.id, {
            title: testDto.title,
            orderIndex,
            blocks: normalizedBlocks,
          });
          continue;
        }

        await this.testRepo.create(
          new LessonTest(id, testDto.title, orderIndex, normalizedBlocks),
        );
      }

      for (const existingTest of existingTests) {
        if (!incomingTestIds.has(existingTest.id)) {
          await this.testRepo.delete(existingTest.id);
        }
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

  async deleteLessonDetailsByLessonId(
    lessonId: string,
  ): Promise<{ success: boolean }> {
    const ok = await this.detailsRepo.deleteByLessonId(lessonId);
    return { success: ok };
  }

  async deleteLessonDetailsByCheckpointId(
    checkpointId: string,
  ): Promise<{ success: boolean }> {
    const ok = await this.detailsRepo.deleteByCheckpointId(checkpointId);
    return { success: ok };
  }


  private async loadFull(
    details: LessonDetails,
  ): Promise<LessonDetailsResponseDto> {
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
    dto.lessonId = details.lessonId ?? null;
    dto.checkpointId = details.checkpointId ?? null;
    dto.createdAt = details.createdAt;
    dto.updatedAt = details.updatedAt;

    dto.slides = slides.map((s) => {
      const r = new SlideResponseDto();
      r.id = s.id;
      r.lessonDetailsId = s.lessonDetailsId;
      r.title = s.title;
      r.type = s.type;
      r.orderIndex = s.orderIndex;
      r.blocks = normalizeLessonBlocks(s.blocks) as unknown as object[];
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
      r.blocks = normalizeLessonBlocks(t.blocks) as unknown as object[];
      r.createdAt = t.createdAt;
      r.updatedAt = t.updatedAt;
      return r;
    });

    return dto;
  }
}
