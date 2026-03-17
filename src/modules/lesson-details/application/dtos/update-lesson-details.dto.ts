import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSlideDto, CreateTestDto } from './create-lesson-details.dto';

export class UpdateSlideDto extends CreateSlideDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}

export class UpdateTestDto extends CreateTestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;
}

export class UpdateLessonDetailsDto {
  @ApiProperty({ type: [UpdateSlideDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSlideDto)
  slides?: UpdateSlideDto[];

  @ApiProperty({ type: [UpdateTestDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateTestDto)
  tests?: UpdateTestDto[];
}
