import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AchievementService } from '../../application/services/achievement.service';
import { CreateAchievementDto } from '../../application/dtos/create-achievement.dto';
import { UpdateAchievementDto } from '../../application/dtos/update-achievement.dto';
import { AchievementResponseDto } from '../../application/dtos/achievement-response.dto';
import { ACHIEVEMENT_DEFINITIONS } from '../../application/services/achievement.service';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание нового достижения' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Достижение успешно создано',
    type: AchievementResponseDto,
  })
  @ApiBearerAuth()
  async create(
    @Body() createAchievementDto: CreateAchievementDto,
  ): Promise<AchievementResponseDto> {
    const achievement =
      await this.achievementService.create(createAchievementDto);
    return this.mapToResponse(achievement);
  }

  @Post('check-and-award')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Проверить и выдать достижения пользователю' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Достижения проверены и выданы',
    type: [AchievementResponseDto],
  })
  @ApiBearerAuth()
  async checkAndAward(
    @Body('auditoryId') auditoryId: string,
  ): Promise<AchievementResponseDto[]> {
    const achievements =
      await this.achievementService.checkAndAwardAchievements(auditoryId);
    return achievements.map((achv) => this.mapToResponse(achv));
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Получить все определения достижений' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Определения достижений получены',
  })
  @ApiBearerAuth()
  async getDefinitions(): Promise<Record<string, any>> {
    return this.achievementService.getAchievementDefinitions();
  }

  @Get('progress/:auditoryId')
  @ApiOperation({ summary: 'Получить прогресс достижений пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Прогресс достижений получен',
  })
  @ApiBearerAuth()
  async getProgress(@Param('auditoryId') auditoryId: string): Promise<any> {
    return this.achievementService.getAchievementProgress(auditoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение достижения по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Достижение найдено',
    type: AchievementResponseDto,
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<AchievementResponseDto> {
    const achievement = await this.achievementService.findById(id);
    return this.mapToResponse(achievement);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получение всех достижений клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Достижения найдены',
    type: [AchievementResponseDto],
  })
  @ApiBearerAuth()
  async findByClientId(
    @Param('clientId') clientId: string,
  ): Promise<AchievementResponseDto[]> {
    const achievements = await this.achievementService.findByClientId(clientId);
    return achievements.map((achv) => this.mapToResponse(achv));
  }

  @Get('auditory/:auditoryId')
  @ApiOperation({ summary: 'Получение всех достижений по auditoryId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Достижения найдены',
    type: [AchievementResponseDto],
  })
  @ApiBearerAuth()
  async findByAuditoryId(
    @Param('auditoryId') auditoryId: string,
  ): Promise<AchievementResponseDto[]> {
    const achievements =
      await this.achievementService.findByAuditoryId(auditoryId);
    return achievements.map((achv) => this.mapToResponse(achv));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление достижения по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Достижение успешно обновлено',
    type: AchievementResponseDto,
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ): Promise<AchievementResponseDto> {
    const achievement = await this.achievementService.update(
      id,
      updateAchievementDto,
    );
    return this.mapToResponse(achievement);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление достижения по ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Достижение успешно удалено',
  })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this.achievementService.delete(id);
  }

  @Delete('client/:clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление всех достижений клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Достижения успешно удалены',
  })
  @ApiBearerAuth()
  async deleteByClientId(@Param('clientId') clientId: string): Promise<void> {
    await this.achievementService.deleteByClientId(clientId);
  }

  private mapToResponse(achievement: any): AchievementResponseDto {
    const response = new AchievementResponseDto();
    response.id = achievement.id;
    response.clientId = achievement.clientId;
    response.type = achievement.type;
    response.tier = achievement.tier;
    response.title = achievement.title;
    response.description = achievement.description;
    response.image = achievement.image;
    response.earnedAt = achievement.earnedAt;
    response.createdAt = achievement.createdAt;
    response.updatedAt = achievement.updatedAt;
    return response;
  }
}
