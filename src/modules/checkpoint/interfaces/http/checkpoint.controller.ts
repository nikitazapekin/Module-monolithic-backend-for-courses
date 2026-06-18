import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CheckpointFacade } from '../../application/facades/checkpoint.facade';
import { CreateCheckpointDto } from '../../application/dtos/create-checkpoint.dto';
import { UpdateCheckpointDto } from '../../application/dtos/update-checkpoint.dto';
import { CheckpointResponseDto } from '../../application/dtos/checkpoint-response.dto';

@ApiTags('checkpoints')
@Controller('checkpoints')
@UseInterceptors(ClassSerializerInterceptor)
export class CheckpointController {
  constructor(private readonly checkpointFacade: CheckpointFacade) {}

  @Post()
  @ApiOperation({ summary: 'Создать контрольную точку' })
  @ApiResponse({ status: 201, type: CheckpointResponseDto })
  async create(
    @Body() dto: CreateCheckpointDto,
  ): Promise<CheckpointResponseDto> {
    return this.checkpointFacade.createCheckpoint(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить контрольную точку по ID' })
  @ApiResponse({ status: 200, type: CheckpointResponseDto })
  @ApiParam({ name: 'id', type: String })
  async getById(@Param('id') id: string): Promise<CheckpointResponseDto> {
    return this.checkpointFacade.getCheckpoint(id);
  }

  @Get('map-element/:mapElementId')
  @ApiOperation({ summary: 'Получить контрольную точку по ID элемента карты' })
  @ApiResponse({ status: 200, type: CheckpointResponseDto })
  @ApiParam({ name: 'mapElementId', type: String })
  async getByMapElementId(
    @Param('mapElementId') mapElementId: string,
  ): Promise<CheckpointResponseDto> {
    return this.checkpointFacade.getCheckpointByMapElementId(mapElementId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить контрольные точки по ID карты курса' })
  @ApiResponse({ status: 200, type: [CheckpointResponseDto] })
  @ApiQuery({ name: 'courseMapId', type: String, required: true })
  async getByCourseMapId(
    @Query('courseMapId') courseMapId: string,
  ): Promise<CheckpointResponseDto[]> {
    return this.checkpointFacade.getCheckpointsByCourseMapId(courseMapId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить контрольную точку' })
  @ApiResponse({ status: 200, type: CheckpointResponseDto })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCheckpointDto,
  ): Promise<CheckpointResponseDto> {
    return this.checkpointFacade.updateCheckpoint(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить контрольную точку' })
  @ApiResponse({
    status: 200,
    schema: { properties: { success: { type: 'boolean' } } },
  })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.checkpointFacade.deleteCheckpoint(id);
  }

  @Delete('map-element/:mapElementId')
  @ApiOperation({ summary: 'Удалить контрольную точку по ID элемента карты' })
  @ApiResponse({
    status: 200,
    schema: { properties: { success: { type: 'boolean' } } },
  })
  @ApiParam({ name: 'mapElementId', type: String })
  async deleteByMapElementId(
    @Param('mapElementId') mapElementId: string,
  ): Promise<{ success: boolean }> {
    return this.checkpointFacade.deleteCheckpointByMapElementId(mapElementId);
  }
}
