export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface BlockReview {
  id: string;
  slideOrTestId: string;
  slideOrTestType: 'slide' | 'test';
  blockId: string;
  reviewerId: string;
  reviewerName: string;
  proposedChanges: Record<string, unknown>;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class SlideReview {
  public id: string;
  public slideId: string;
  public blockId: string;
  public reviewerId: string;
  public reviewerName: string;
  public proposedChanges: Record<string, unknown>;
  public comment: string;
  public status: ReviewStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    slideId: string,
    blockId: string,
    reviewerId: string,
    reviewerName: string,
    proposedChanges: Record<string, unknown>,
    comment: string,
    id?: string,
  ) {
    this.id = id ?? this.generateId();
    this.slideId = slideId;
    this.blockId = blockId;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.proposedChanges = proposedChanges;
    this.comment = comment;
    this.status = ReviewStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public accept(): void {
    this.status = ReviewStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  public reject(): void {
    this.status = ReviewStatus.REJECTED;
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `slide_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class TestReview {
  public id: string;
  public testId: string;
  public blockId: string;
  public reviewerId: string;
  public reviewerName: string;
  public proposedChanges: Record<string, unknown>;
  public comment: string;
  public status: ReviewStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    testId: string,
    blockId: string,
    reviewerId: string,
    reviewerName: string,
    proposedChanges: Record<string, unknown>,
    comment: string,
    id?: string,
  ) {
    this.id = id ?? this.generateId();
    this.testId = testId;
    this.blockId = blockId;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.proposedChanges = proposedChanges;
    this.comment = comment;
    this.status = ReviewStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public accept(): void {
    this.status = ReviewStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  public reject(): void {
    this.status = ReviewStatus.REJECTED;
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `test_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
