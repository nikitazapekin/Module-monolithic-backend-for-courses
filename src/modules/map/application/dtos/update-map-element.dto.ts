import { PartialType } from '@nestjs/swagger';
import { CreateMapElementDto } from './create-map-element.dto';

export class UpdateMapElementDto extends PartialType(CreateMapElementDto) {}
