import { ApiProperty } from '@nestjs/swagger';
import { UpdateMapElementDto } from './update-map-element.dto';
import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchUpdateMapElementItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateMapElementDto)
  data: UpdateMapElementDto;
}

export class BatchUpdateMapElementsDto {
  @ApiProperty({ type: [BatchUpdateMapElementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateMapElementItemDto)
  elements: BatchUpdateMapElementItemDto[];
}
