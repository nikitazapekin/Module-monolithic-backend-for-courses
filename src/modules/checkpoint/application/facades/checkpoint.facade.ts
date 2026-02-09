import { Injectable } from '@nestjs/common';
import { CheckpointService } from '../services/checkpoint.service';
import { CreateCheckpointDto } from '../dtos/create-checkpoint.dto';
import { UpdateCheckpointDto } from '../dtos/update-checkpoint.dto';
import { CheckpointResponseDto } from '../dtos/checkpoint-response.dto';

@Injectable()
export class CheckpointFacade {
  constructor(private readonly checkpointService: CheckpointService) {}

  async createCheckpoint(dto: CreateCheckpointDto): Promise<CheckpointResponseDto> {
    return this.checkpointService.createCheckpoint(dto);
  }

  async getCheckpoint(id: string): Promise<CheckpointResponseDto> {
    return this.checkpointService.getCheckpoint(id);
  }

  async getCheckpointByMapElementId(mapElementId: string): Promise<CheckpointResponseDto> {
    return this.checkpointService.getCheckpointByMapElementId(mapElementId);
  }

  async getCheckpointsByCourseMapId(courseMapId: string): Promise<CheckpointResponseDto[]> {
    return this.checkpointService.getCheckpointsByCourseMapId(courseMapId);
  }

  async updateCheckpoint(id: string, dto: UpdateCheckpointDto): Promise<CheckpointResponseDto> {
    return this.checkpointService.updateCheckpoint(id, dto);
  }

  async deleteCheckpoint(id: string): Promise<{ success: boolean }> {
    return this.checkpointService.deleteCheckpoint(id);
  }

  async deleteCheckpointByMapElementId(mapElementId: string): Promise<{ success: boolean }> {
    return this.checkpointService.deleteCheckpointByMapElementId(mapElementId);
  }
}
