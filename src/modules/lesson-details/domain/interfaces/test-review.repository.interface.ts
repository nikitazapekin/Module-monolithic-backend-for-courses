import { TestReview, ReviewStatus } from '../../domain/entities/review.entity';

export interface ITestReviewRepository {
  create(review: TestReview): Promise<TestReview>;
  findById(id: string): Promise<TestReview | null>;
  findByTestId(testId: string): Promise<TestReview[]>;
  findByBlockId(testId: string, blockId: string): Promise<TestReview[]>;
  findByStatus(testId: string, status: ReviewStatus): Promise<TestReview[]>;
  update(review: TestReview): Promise<TestReview>;
  delete(id: string): Promise<void>;
}
