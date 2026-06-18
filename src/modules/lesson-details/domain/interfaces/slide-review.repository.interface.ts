import { SlideReview, ReviewStatus } from '../../domain/entities/review.entity';

export interface ISlideReviewRepository {
  create(review: SlideReview): Promise<SlideReview>;
  findById(id: string): Promise<SlideReview | null>;
  findBySlideId(slideId: string): Promise<SlideReview[]>;
  findByBlockId(slideId: string, blockId: string): Promise<SlideReview[]>;
  findByStatus(slideId: string, status: ReviewStatus): Promise<SlideReview[]>;
  update(review: SlideReview): Promise<SlideReview>;
  delete(id: string): Promise<void>;
}
