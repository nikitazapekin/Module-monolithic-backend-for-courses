import { Injectable, Inject } from '@nestjs/common';
import {
  SlideReview,
  TestReview,
  ReviewStatus,
} from '../../domain/entities/review.entity';
import { ISlideReviewRepository } from '../../domain/interfaces/slide-review.repository.interface';
import { ITestReviewRepository } from '../../domain/interfaces/test-review.repository.interface';
import { ILessonSlideRepository } from '../../domain/interfaces/lesson-slide.repository.interface';
import { ILessonTestRepository } from '../../domain/interfaces/lesson-test.repository.interface';

@Injectable()
export class ReviewService {
  constructor(
    @Inject('ISlideReviewRepository')
    private readonly slideReviewRepository: ISlideReviewRepository,
    @Inject('ITestReviewRepository')
    private readonly testReviewRepository: ITestReviewRepository,
    @Inject('ILessonSlideRepository')
    private readonly slideRepository: ILessonSlideRepository,
    @Inject('ILessonTestRepository')
    private readonly testRepository: ILessonTestRepository,
  ) {}

  async createSlideReview(
    slideId: string,
    blockId: string,
    reviewerId: string,
    reviewerName: string,
    proposedChanges: Record<string, unknown>,
    comment: string,
  ): Promise<SlideReview> {
    const review = new SlideReview(
      slideId,
      blockId,
      reviewerId,
      reviewerName,
      proposedChanges,
      comment,
    );
    return this.slideReviewRepository.create(review);
  }

  async createTestReview(
    testId: string,
    blockId: string,
    reviewerId: string,
    reviewerName: string,
    proposedChanges: Record<string, unknown>,
    comment: string,
  ): Promise<TestReview> {
    const review = new TestReview(
      testId,
      blockId,
      reviewerId,
      reviewerName,
      proposedChanges,
      comment,
    );
    return this.testReviewRepository.create(review);
  }

  async getSlideReviews(slideId: string): Promise<SlideReview[]> {
    return this.slideReviewRepository.findBySlideId(slideId);
  }

  async getTestReviews(testId: string): Promise<TestReview[]> {
    return this.testReviewRepository.findByTestId(testId);
  }

  async getBlockReviews(
    slideOrTestId: string,
    blockId: string,
    type: 'slide' | 'test',
  ): Promise<(SlideReview | TestReview)[]> {
    if (type === 'slide') {
      return this.slideReviewRepository.findByBlockId(slideOrTestId, blockId);
    }
    return this.testReviewRepository.findByBlockId(slideOrTestId, blockId);
  }

  async acceptSlideReview(reviewId: string): Promise<SlideReview> {
    const review = await this.slideReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.accept();
    const updatedReview = await this.slideReviewRepository.update(review);

    await this.applySlideChanges(review);

    return updatedReview;
  }

  async acceptTestReview(reviewId: string): Promise<TestReview> {
    const review = await this.testReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.accept();
    const updatedReview = await this.testReviewRepository.update(review);

    await this.applyTestChanges(review);

    return updatedReview;
  }

  async rejectSlideReview(reviewId: string): Promise<SlideReview> {
    const review = await this.slideReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.reject();
    return this.slideReviewRepository.update(review);
  }

  async rejectTestReview(reviewId: string): Promise<TestReview> {
    const review = await this.testReviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.reject();
    return this.testReviewRepository.update(review);
  }

  private async applySlideChanges(review: SlideReview): Promise<void> {
    const slide = await this.slideRepository.findById(review.slideId);
    if (!slide) {
      throw new Error('Slide not found');
    }

    const updatedBlocks = slide.blocks.map((block) => {
      if (block.id === review.blockId) {
        console.log(
          'Applying changes to block:',
          block.id,
          review.proposedChanges,
        );
        return { ...block, ...review.proposedChanges };
      }
      return block;
    });

    slide.update({ blocks: updatedBlocks });
    await this.slideRepository.update(slide.id, { blocks: updatedBlocks });
    console.log('Updated slide:', slide.id);
  }

  private async applyTestChanges(review: TestReview): Promise<void> {
    const test = await this.testRepository.findById(review.testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const updatedBlocks = test.blocks.map((block) => {
      if (block.id === review.blockId) {
        console.log(
          'Applying changes to block:',
          block.id,
          review.proposedChanges,
        );
        return { ...block, ...review.proposedChanges };
      }
      return block;
    });

    test.update({ blocks: updatedBlocks });
    await this.testRepository.update(test.id, { blocks: updatedBlocks });
    console.log('Updated test:', test.id);
  }
}
