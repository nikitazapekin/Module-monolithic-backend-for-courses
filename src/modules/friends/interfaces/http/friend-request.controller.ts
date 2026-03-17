import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FriendRequestService } from '../../application/services/friend-request.service';
import {
  CreateFriendRequestDto,
  UpdateFriendRequestDto,
} from '../../application/dtos/friend-request.dto';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../../domain/entities/friend-request.entity';
import { FriendResponseDto } from '../../application/dtos/friend-response.dto';

@ApiTags('friend-requests')
@Controller('friend-requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Отправить заявку в друзья' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Заявка в друзья успешно отправлена',
  })
  @ApiBearerAuth()
  async sendFriendRequest(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
  ): Promise<FriendRequest> {
    return await this.friendRequestService.sendFriendRequest(
      createFriendRequestDto.senderAuditoryId,
      createFriendRequestDto.receiverAuditoryId,
    );
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Принять заявку в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заявка принята, дружба создана',
    type: FriendResponseDto,
  })
  @ApiBearerAuth()
  async acceptFriendRequest(
    @Param('id') id: string,
  ): Promise<FriendResponseDto> {
    const friendship = await this.friendRequestService.acceptFriendRequest(id);
    return this.mapFriendshipToResponse(friendship);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отклонить заявку в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заявка отклонена',
  })
  @ApiBearerAuth()
  async rejectFriendRequest(@Param('id') id: string): Promise<FriendRequest> {
    return await this.friendRequestService.rejectFriendRequest(id);
  }

  @Get('pending/received/:userAuditoryId')
  @ApiOperation({ summary: 'Получить входящие заявки в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Входящие заявки получены',
    type: [FriendRequest],
  })
  @ApiBearerAuth()
  async getPendingFriendRequests(
    @Param('userAuditoryId') userAuditoryId: string,
  ): Promise<FriendRequest[]> {
    return await this.friendRequestService.getPendingFriendRequests(
      userAuditoryId,
    );
  }

  @Get('pending/sent/:userAuditoryId')
  @ApiOperation({ summary: 'Получить исходящие заявки в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Исходящие заявки получены',
    type: [FriendRequest],
  })
  @ApiBearerAuth()
  async getSentFriendRequests(
    @Param('userAuditoryId') userAuditoryId: string,
  ): Promise<FriendRequest[]> {
    return await this.friendRequestService.getSentFriendRequests(
      userAuditoryId,
    );
  }

  @Delete('cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить отправленную заявку в друзья' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Заявка отменена',
  })
  @ApiBearerAuth()
  async cancelFriendRequest(
    @Query('senderAuditoryId') senderAuditoryId: string,
    @Query('receiverAuditoryId') receiverAuditoryId: string,
  ): Promise<void> {
    await this.friendRequestService.cancelFriendRequest(
      senderAuditoryId,
      receiverAuditoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заявку в друзья по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заявка найдена',
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<FriendRequest> {
    return await this.friendRequestService.findById(id);
  }

  @Get('check')
  @ApiOperation({ summary: 'Проверить наличие заявки в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус заявки получен',
  })
  @ApiBearerAuth()
  async hasPendingRequest(
    @Query('senderAuditoryId') senderAuditoryId: string,
    @Query('receiverAuditoryId') receiverAuditoryId: string,
  ): Promise<{ hasRequest: boolean }> {
    return await this.friendRequestService.hasPendingRequest(
      senderAuditoryId,
      receiverAuditoryId,
    );
  }

  private mapFriendshipToResponse(friendship: any): FriendResponseDto {
    const response = new FriendResponseDto();
    response.id = friendship.id;
    response.clientId = friendship.clientId;
    response.friendId = friendship.friendId;
    response.createdAt = friendship.createdAt;
    response.updatedAt = friendship.updatedAt;
    return response;
  }
}
