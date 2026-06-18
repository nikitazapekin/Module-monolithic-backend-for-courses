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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnnouncementService } from '../../application/services/announcement.service';
import {
  CreateAnnouncementDto,
  AnnouncementResponseDto,
} from '../../application/dtos/announcement.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Announcement } from '../../domain/entities/announcement.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('announcements')
@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение списка всех анонсов' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список анонсов получен',
    type: [AnnouncementResponseDto],
  })
  @ApiBearerAuth()
  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.announcementService.getAllAnnouncements();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение анонса по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Анонс получен',
    type: AnnouncementResponseDto,
  })
  @ApiBearerAuth()
  async getAnnouncementById(
    @Param('id') id: string,
  ): Promise<Announcement | null> {
    return this.announcementService.getAnnouncementById(id);
  }

  @Get('admin/:adminId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение анонсов по ID администратора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список анонсов администратора получен',
    type: [AnnouncementResponseDto],
  })
  @ApiBearerAuth()
  async getAnnouncementsByAdminId(
    @Param('adminId') adminId: string,
  ): Promise<Announcement[]> {
    return this.announcementService.getAnnouncementsByAdminId(adminId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание нового анонса' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Анонс создан',
    type: AnnouncementResponseDto,
  })
  @ApiBearerAuth()
  async createAnnouncement(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @CurrentUser() user: any,
  ): Promise<Announcement> {
    const adminId = user.userId;
    return this.announcementService.createAnnouncement(
      adminId,
      createAnnouncementDto,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление анонса' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Анонс обновлен',
    type: AnnouncementResponseDto,
  })
  @ApiBearerAuth()
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: Partial<CreateAnnouncementDto>,
  ): Promise<Announcement | null> {
    return this.announcementService.updateAnnouncement(
      id,
      updateAnnouncementDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удаление анонса' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Анонс удален',
  })
  @ApiBearerAuth()
  async deleteAnnouncement(
    @Param('id') id: string,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.announcementService.deleteAnnouncement(id);
    return { deleted };
  }
}
