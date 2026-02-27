import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileInfoService } from '../../application/services/profile-info.service';
import { FullClientInfoDto } from '../../application/dtos/full-client-info.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('profile/client')
@Controller('profile/client')
export class ProfileInfoController {
  constructor(private readonly profileInfoService: ProfileInfoService) {}

  @Get('auditory/:auditoryId/full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение полной информации о клиенте по auditoryId с использованием JOIN' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Полная информация о клиенте получена',
    type: FullClientInfoDto,
  })
  @ApiBearerAuth()
  async getFullClientInfoByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<FullClientInfoDto> {
    return this.profileInfoService.getFullClientInfoByAuditoryId(auditoryId);
  }

  @Get(':clientId/full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение полной информации о клиенте по clientId с использованием JOIN' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Полная информация о клиенте получена',
    type: FullClientInfoDto,
  })
  @ApiBearerAuth()
  async getFullClientInfoByClientId(@Param('clientId') clientId: string): Promise<FullClientInfoDto> {
    return this.profileInfoService.getFullClientInfoByClientId(clientId);
  }
}
