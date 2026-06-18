import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class CreateSlideReviewDto {
  @ApiProperty({ description: 'ID слайда' })
  @IsNotEmpty()
  @IsString()
  slideId: string;

  @ApiProperty({ description: 'ID блока в слайде' })
  @IsNotEmpty()
  @IsString()
  blockId: string;

  @ApiProperty({ description: 'ID рецензента' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({ description: 'Имя рецензента' })
  @IsNotEmpty()
  @IsString()
  reviewerName: string;

  @ApiProperty({ description: 'Предлагаемые изменения (JSON объект)' })
  @IsNotEmpty()
  @IsObject()
  proposedChanges: Record<string, unknown>;

  @ApiProperty({ description: 'Комментарий к правке' })
  @IsNotEmpty()
  @IsString()
  comment: string;
}

export class CreateTestReviewDto {
  @ApiProperty({ description: 'ID теста' })
  @IsNotEmpty()
  @IsString()
  testId: string;

  @ApiProperty({ description: 'ID блока в тесте' })
  @IsNotEmpty()
  @IsString()
  blockId: string;

  @ApiProperty({ description: 'ID рецензента' })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({ description: 'Имя рецензента' })
  @IsNotEmpty()
  @IsString()
  reviewerName: string;

  @ApiProperty({ description: 'Предлагаемые изменения (JSON объект)' })
  @IsNotEmpty()
  @IsObject()
  proposedChanges: Record<string, unknown>;

  @ApiProperty({ description: 'Комментарий к правке' })
  @IsNotEmpty()
  @IsString()
  comment: string;
}

export class UpdateReviewStatusDto {
  @ApiProperty({ description: 'Статус правки', enum: ReviewStatus })
  @IsNotEmpty()
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slideId?: string;

  @ApiProperty()
  testId?: string;

  @ApiProperty()
  blockId: string;

  @ApiProperty()
  reviewerId: string;

  @ApiProperty()
  reviewerName: string;

  @ApiProperty()
  proposedChanges: Record<string, unknown>;

  @ApiProperty()
  comment: string;

  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
