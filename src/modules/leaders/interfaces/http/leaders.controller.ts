import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { LeadersService } from '../../application/services/leaders.service';
import { LeaderboardResponseDto } from '../../application/dtos/leaderboard-response.dto';

@ApiTags('leaders')
@Controller('leaders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить лидерборд студентов по общему XP' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы рейтинга',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Лидерборд получен',
    type: LeaderboardResponseDto,
  })
  async getLeaderboard(
    @Req() req: Request & { user: { userId: string } },
    @Query('page') page?: string,
  ): Promise<LeaderboardResponseDto> {
    const parsedPage = Number(page);
    const normalizedPage =
      Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    return this.leadersService.getLeaderboardByAuditoryId(
      req.user.userId,
      normalizedPage,
    );
  }
}
