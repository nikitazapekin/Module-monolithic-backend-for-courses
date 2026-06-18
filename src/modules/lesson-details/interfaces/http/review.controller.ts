import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewService } from '../../application/services/review.service';
import {
  CreateSlideReviewDto,
  CreateTestReviewDto,
  UpdateReviewStatusDto,
  ReviewResponseDto,
} from '../../application/dtos/review.dto';

@ApiTags('reviews')
@Controller('reviews')
@UseInterceptors(ClassSerializerInterceptor)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('slide')
  @ApiOperation({ summary: 'Создать правку для слайда' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async createSlideReview(
    @Body() dto: CreateSlideReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.createSlideReview(
      dto.slideId,
      dto.blockId,
      dto.reviewerId,
      dto.reviewerName,
      dto.proposedChanges,
      dto.comment,
    );
    return this.toResponseDto(review);
  }

  @Post('test')
  @ApiOperation({ summary: 'Создать правку для теста' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async createTestReview(
    @Body() dto: CreateTestReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.createTestReview(
      dto.testId,
      dto.blockId,
      dto.reviewerId,
      dto.reviewerName,
      dto.proposedChanges,
      dto.comment,
    );
    return this.toResponseDto(review);
  }

  @Get('slide/:slideId')
  @ApiOperation({ summary: 'Получить все правки для слайда' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  @ApiParam({ name: 'slideId', type: String })
  async getSlideReviews(
    @Param('slideId') slideId: string,
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewService.getSlideReviews(slideId);
    return reviews.map((r) => this.toResponseDto(r));
  }

  @Get('test/:testId')
  @ApiOperation({ summary: 'Получить все правки для теста' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  @ApiParam({ name: 'testId', type: String })
  async getTestReviews(
    @Param('testId') testId: string,
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewService.getTestReviews(testId);
    return reviews.map((r) => this.toResponseDto(r));
  }

  @Get('block/:slideOrTestId/:blockId/:type')
  @ApiOperation({ summary: 'Получить правки для конкретного блока' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  @ApiParam({ name: 'slideOrTestId', type: String })
  @ApiParam({ name: 'blockId', type: String })
  @ApiParam({ name: 'type', type: String, enum: ['slide', 'test'] })
  async getBlockReviews(
    @Param('slideOrTestId') slideOrTestId: string,
    @Param('blockId') blockId: string,
    @Param('type') type: 'slide' | 'test',
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewService.getBlockReviews(
      slideOrTestId,
      blockId,
      type,
    );
    return reviews.map((r) => this.toResponseDto(r));
  }

  @Put('slide/:reviewId/accept')
  @ApiOperation({ summary: 'Принять правку слайда' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  @ApiParam({ name: 'reviewId', type: String })
  async acceptSlideReview(
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.acceptSlideReview(reviewId);
    return this.toResponseDto(review);
  }

  @Put('test/:reviewId/accept')
  @ApiOperation({ summary: 'Принять правку теста' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  @ApiParam({ name: 'reviewId', type: String })
  async acceptTestReview(
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.acceptTestReview(reviewId);
    return this.toResponseDto(review);
  }

  @Put('slide/:reviewId/reject')
  @ApiOperation({ summary: 'Отклонить правку слайда' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  @ApiParam({ name: 'reviewId', type: String })
  async rejectSlideReview(
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.rejectSlideReview(reviewId);
    return this.toResponseDto(review);
  }

  @Put('test/:reviewId/reject')
  @ApiOperation({ summary: 'Отклонить правку теста' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  @ApiParam({ name: 'reviewId', type: String })
  async rejectTestReview(
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.rejectTestReview(reviewId);
    return this.toResponseDto(review);
  }

  private toResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      slideId: review.slideId,
      testId: review.testId,
      blockId: review.blockId,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      proposedChanges: review.proposedChanges,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
