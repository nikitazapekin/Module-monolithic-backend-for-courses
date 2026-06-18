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
import { FriendRequestResponseDto } from '../../application/dtos/friend-request-response.dto';

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
    type: [FriendRequestResponseDto],
  })
  @ApiBearerAuth()
  async getPendingFriendRequests(
    @Param('userAuditoryId') userAuditoryId: string,
  ): Promise<FriendRequestResponseDto[]> {
    const requests = await this.friendRequestService.getPendingFriendRequests(
      userAuditoryId,
    );
    return this.mapRequestsToResponse(requests);
  }

  @Get('pending/sent/:userAuditoryId')
  @ApiOperation({ summary: 'Получить исходящие заявки в друзья' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Исходящие заявки получены',
    type: [FriendRequestResponseDto],
  })
  @ApiBearerAuth()
  async getSentFriendRequests(
    @Param('userAuditoryId') userAuditoryId: string,
  ): Promise<FriendRequestResponseDto[]> {
    const requests = await this.friendRequestService.getSentFriendRequests(
      userAuditoryId,
    );
    return this.mapRequestsToResponse(requests);
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

  private async mapFriendshipToResponse(friendship: any): Promise<FriendResponseDto> {
    const response = new FriendResponseDto();
    response.id = friendship.id;
    response.clientId = friendship.clientId;
    response.createdAt = friendship.createdAt;
    response.updatedAt = friendship.updatedAt;

    const friendClient = await this.friendRequestService.getClientById(
      friendship.friendId,
    );
    response.friendId = friendClient?.auditoryId || friendship.friendId;

    return response;
  }

  private async mapRequestsToResponse(
    requests: FriendRequest[],
  ): Promise<FriendRequestResponseDto[]> {
    return Promise.all(
      requests.map(async (request) => {
        const response = new FriendRequestResponseDto();
        response.id = request.id;
        response.senderId = request.senderId;
        response.receiverId = request.receiverId;
        response.status = request.status;
        response.createdAt = request.createdAt;
        response.updatedAt = request.updatedAt;

        const [sender, receiver] = await Promise.all([
          this.friendRequestService.getClientById(request.senderId),
          this.friendRequestService.getClientById(request.receiverId),
        ]);

        if (sender) {
          response.senderAuditoryId = sender.auditoryId;
          response.senderFirstName = sender.firstName;
          response.senderLastName = sender.lastName;
          response.senderMiddleName = sender.middleName;
        }

        if (receiver) {
          response.receiverAuditoryId = receiver.auditoryId;
          response.receiverFirstName = receiver.firstName;
          response.receiverLastName = receiver.lastName;
          response.receiverMiddleName = receiver.middleName;
        }

        return response;
      }),
    );
  }
}
