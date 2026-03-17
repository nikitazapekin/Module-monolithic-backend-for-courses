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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FriendService } from '../../application/services/friend.service';
import { CreateFriendDto } from '../../application/dtos/create-friend.dto';
import { SearchFriendsDto } from '../../application/dtos/search-friends.dto';
import { FriendResponseDto } from '../../application/dtos/friend-response.dto';

@ApiTags('friends')
@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Добавить друга' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Друг успешно добавлен',
    type: FriendResponseDto,
  })
  @ApiBearerAuth()
  async addFriend(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<FriendResponseDto> {
    const friendship = await this.friendService.addFriend(
      createFriendDto.clientAuditoryId,
      createFriendDto.friendAuditoryId,
    );
    return this.mapToResponse(friendship);
  }

  // Specific routes MUST come before parameterized routes (:id, :clientId, etc.)
  @Get('search-users')
  @ApiOperation({
    summary: 'Поиск пользователей по имени для добавления в друзья',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователи найдены',
    type: [FriendResponseDto],
  })
  @ApiBearerAuth()
  async searchUsers(
    @Query('query') query: string,
  ): Promise<FriendResponseDto[]> {
    const users = await this.friendService.searchUsers(query);
    return users.map((user) => {
      const response = new FriendResponseDto();
      response.friendId = user.auditoryId;
      response.friendFirstName = user.firstName;
      response.friendLastName = user.lastName;
      response.friendMiddleName = user.middleName;
      return response;
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск друзей по имени' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Друзья найдены',
    type: [FriendResponseDto],
  })
  @ApiBearerAuth()
  async searchFriends(
    @Query('clientAuditoryId') clientAuditoryId: string,
    @Query('query') query: string,
  ): Promise<FriendResponseDto[]> {
    const friendships = await this.friendService.searchFriends(
      clientAuditoryId,
      query,
    );
    return this.mapToResponseWithDetails(friendships);
  }

  @Get('check')
  @ApiOperation({ summary: 'Проверить, является ли пользователь другом' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус дружбы получен',
  })
  @ApiBearerAuth()
  async isFriend(
    @Query('clientAuditoryId') clientAuditoryId: string,
    @Query('friendAuditoryId') friendAuditoryId: string,
  ): Promise<{ isFriend: boolean }> {
    const result = await this.friendService.isFriend(
      clientAuditoryId,
      friendAuditoryId,
    );
    return { isFriend: result };
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получить всех друзей клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Друзья найдены',
    type: [FriendResponseDto],
  })
  @ApiBearerAuth()
  async findByClientId(
    @Param('clientId') clientId: string,
  ): Promise<FriendResponseDto[]> {
    const friendships = await this.friendService.findByClientId(clientId);
    return this.mapToResponseWithDetails(friendships);
  }

  @Get('auditory/:clientAuditoryId')
  @ApiOperation({ summary: 'Получить всех друзей клиента по auditoryId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Друзья найдены',
    type: [FriendResponseDto],
  })
  @ApiBearerAuth()
  async findByClientAuditoryId(
    @Param('clientAuditoryId') clientAuditoryId: string,
  ): Promise<FriendResponseDto[]> {
    const friendships =
      await this.friendService.findByClientAuditoryId(clientAuditoryId);
    return this.mapToResponseWithDetails(friendships);
  }

  @Get('inverse/:friendAuditoryId')
  @ApiOperation({
    summary: 'Получить всех, кто добавил этого клиента в друзья',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Записи о дружбе найдены',
    type: [FriendResponseDto],
  })
  @ApiBearerAuth()
  async findByFriendAuditoryId(
    @Param('friendAuditoryId') friendAuditoryId: string,
  ): Promise<FriendResponseDto[]> {
    const friendships =
      await this.friendService.findByFriendAuditoryId(friendAuditoryId);
    return this.mapToResponseWithDetails(friendships, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить запись о дружбе по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Запись о дружбе найдена',
    type: FriendResponseDto,
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<FriendResponseDto> {
    const friendship = await this.friendService.findById(id);
    return this.mapToResponse(friendship);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить запись о дружбе по ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Запись о дружбе успешно удалена',
  })
  @ApiBearerAuth()
  async removeFriendById(@Param('id') id: string): Promise<void> {
    await this.friendService.removeFriendById(id);
  }

  @Delete('client/:clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить всех друзей клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Друзья успешно удалены',
  })
  @ApiBearerAuth()
  async removeAllFriends(@Param('clientId') clientId: string): Promise<void> {
    await this.friendService.removeAllFriends(clientId);
  }

  @Delete('auditory/:clientAuditoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить всех друзей клиента по auditoryId' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Друзья успешно удалены',
  })
  @ApiBearerAuth()
  async removeAllFriendsByAuditoryId(
    @Param('clientAuditoryId') clientAuditoryId: string,
  ): Promise<void> {
    await this.friendService.removeAllFriendsByAuditoryId(clientAuditoryId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить друга' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Друг успешно удален',
  })
  @ApiBearerAuth()
  async removeFriend(
    @Query('clientAuditoryId') clientAuditoryId: string,
    @Query('friendAuditoryId') friendAuditoryId: string,
  ): Promise<void> {
    await this.friendService.removeFriend(clientAuditoryId, friendAuditoryId);
  }

  private mapToResponse(friendship: any): FriendResponseDto {
    const response = new FriendResponseDto();
    response.id = friendship.id;
    response.clientId = friendship.clientId;
    response.friendId = friendship.friendId;
    response.createdAt = friendship.createdAt;
    response.updatedAt = friendship.updatedAt;
    return response;
  }

  private async mapToResponseWithDetails(
    friendships: any[],
    inverse: boolean = false,
  ): Promise<FriendResponseDto[]> {
    return Promise.all(
      friendships.map(async (friendship) => {
        const response = new FriendResponseDto();
        response.id = friendship.id;
        response.clientId = friendship.clientId;
        response.friendId = friendship.friendId;
        response.createdAt = friendship.createdAt;
        response.updatedAt = friendship.updatedAt;

        // Get friend client details
        const friendClientId = inverse
          ? friendship.clientId
          : friendship.friendId;
        const friendClient = await this.friendService[
          'clientRepository'
        ].findOne({
          where: { id: friendClientId },
        });

        if (friendClient) {
          response.friendFirstName = friendClient.firstName;
          response.friendLastName = friendClient.lastName;
          response.friendMiddleName = friendClient.middleName;
        }

        return response;
      }),
    );
  }
}
