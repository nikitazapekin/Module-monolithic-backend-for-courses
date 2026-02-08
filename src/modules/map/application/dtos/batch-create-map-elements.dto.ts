import { ApiProperty } from '@nestjs/swagger';
import { CreateMapElementDto } from './create-map-element.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchCreateMapElementsDto {
  @ApiProperty({ type: [CreateMapElementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMapElementDto)
  elements: CreateMapElementDto[];
}
