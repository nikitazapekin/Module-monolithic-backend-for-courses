import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SlideResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() lessonDetailsId: string;
  @ApiProperty() @Expose() title: string;
  @ApiProperty() @Expose() type: string;
  @ApiProperty() @Expose() orderIndex: number;
  @ApiProperty() @Expose() blocks: object[];
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;
}

export class TestResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() lessonDetailsId: string;
  @ApiProperty() @Expose() title: string;
  @ApiProperty() @Expose() orderIndex: number;
  @ApiProperty() @Expose() blocks: object[];
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;
}

export class LessonDetailsResponseDto {
  @ApiProperty({ description: 'ID lesson_details' }) @Expose() id: string;
  @ApiProperty({ description: 'ID урока', required: false })
  @Expose()
  lessonId?: string | null;
  @ApiProperty({ description: 'ID контрольной точки', required: false })
  @Expose()
  checkpointId?: string | null;
  @ApiProperty({ type: [SlideResponseDto] })
  @Expose()
  @Type(() => SlideResponseDto)
  slides: SlideResponseDto[];
  @ApiProperty({ type: [TestResponseDto] })
  @Expose()
  @Type(() => TestResponseDto)
  tests: TestResponseDto[];
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;
}
