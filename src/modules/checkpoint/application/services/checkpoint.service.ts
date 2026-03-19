import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ICheckpointRepository } from '../../domain/interfaces/checkpoint.repository.interface';
import { Checkpoint } from '../../domain/entities/checkpoint.entity';
import { CreateCheckpointDto } from '../dtos/create-checkpoint.dto';
import { UpdateCheckpointDto } from '../dtos/update-checkpoint.dto';
import { CheckpointResponseDto } from '../dtos/checkpoint-response.dto';

@Injectable()
export class CheckpointService {
  constructor(
    @Inject('ICheckpointRepository')
    private readonly checkpointRepository: ICheckpointRepository,
  ) {}

  async createCheckpoint(
    dto: CreateCheckpointDto,
  ): Promise<CheckpointResponseDto> {
    
    const existingCheckpoint =
      await this.checkpointRepository.findByMapElementId(dto.mapElementId);
    if (existingCheckpoint) {
      throw new ConflictException(
        'Checkpoint already exists for this map element',
      );
    }

    const checkpoint = new Checkpoint(
      dto.mapElementId,
      dto.title,
      dto.description,
      dto.type,
      dto.passingScore,
      dto.maxAttempts,
      dto.timeLimit,
      dto.instructions,
      dto.isPublished || false,
    );

    const createdCheckpoint =
      await this.checkpointRepository.create(checkpoint);
    return this.toResponseDto(createdCheckpoint);
  }

  async getCheckpoint(id: string): Promise<CheckpointResponseDto> {
    const checkpoint = await this.checkpointRepository.findById(id);
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found');
    }
    return this.toResponseDto(checkpoint);
  }

  async getCheckpointByMapElementId(
    mapElementId: string,
  ): Promise<CheckpointResponseDto> {
    const checkpoint =
      await this.checkpointRepository.findByMapElementId(mapElementId);
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found for this map element');
    }
    return this.toResponseDto(checkpoint);
  }

  async getCheckpointsByCourseMapId(
    courseMapId: string,
  ): Promise<CheckpointResponseDto[]> {
    const checkpoints =
      await this.checkpointRepository.findAllByCourseMapId(courseMapId);
    return checkpoints.map((checkpoint) => this.toResponseDto(checkpoint));
  }

  async updateCheckpoint(
    id: string,
    dto: UpdateCheckpointDto,
  ): Promise<CheckpointResponseDto> {
    const checkpoint = await this.checkpointRepository.findById(id);
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found');
    }
 
    if (dto.mapElementId && dto.mapElementId !== checkpoint.mapElementId) {
      const existingCheckpoint =
        await this.checkpointRepository.findByMapElementId(dto.mapElementId);
      if (existingCheckpoint && existingCheckpoint.id !== id) {
        throw new ConflictException(
          'Another checkpoint already uses this map element',
        );
      }
    }

    checkpoint.update(dto);
    const updated = await this.checkpointRepository.update(id, checkpoint);
    if (!updated) {
      throw new BadRequestException('Failed to update checkpoint');
    }

    const updatedCheckpoint = await this.checkpointRepository.findById(id);
    return this.toResponseDto(updatedCheckpoint!);
  }

  async deleteCheckpoint(id: string): Promise<{ success: boolean }> {
    const checkpoint = await this.checkpointRepository.findById(id);
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found');
    }

    const deleted = await this.checkpointRepository.delete(id);
    return { success: deleted };
  }

  async deleteCheckpointByMapElementId(
    mapElementId: string,
  ): Promise<{ success: boolean }> {
    const deleted =
      await this.checkpointRepository.deleteByMapElementId(mapElementId);
    return { success: deleted };
  }

  private toResponseDto(checkpoint: Checkpoint): CheckpointResponseDto {
    return {
      id: checkpoint.id,
      mapElementId: checkpoint.mapElementId,
      title: checkpoint.title,
      description: checkpoint.description,
      type: checkpoint.type,
      passingScore: checkpoint.passingScore,
      maxAttempts: checkpoint.maxAttempts,
      timeLimit: checkpoint.timeLimit,
      instructions: checkpoint.instructions,
      isPublished: checkpoint.isPublished,
      createdAt: checkpoint.createdAt,
      updatedAt: checkpoint.updatedAt,
    };
  }
}
