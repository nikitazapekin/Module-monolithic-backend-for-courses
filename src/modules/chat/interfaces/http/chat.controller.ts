import { Controller, Get, Post, Body, Param, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from '../../application/services/chat.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { SendMessageDto } from '../../application/dtos/chat.dto';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  @Post('messages')
  async sendMessage(
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const { receiverId, content } = sendMessageDto;
    
    const message = await this.chatService.sendMessage(
      user.userId,
      receiverId,
      content,
    );

    return { success: true, data: message };
  }

  @Get('conversations/:userId')
  async getConversations(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const targetUserId = userId === user.userId ? userId : user.userId;
    const conversations = await this.chatService.getConversations(targetUserId);

    if (conversations.length === 0) {
      return { success: true, data: [] };
    }

    const participantIds = Array.from(
      new Set(
        conversations.map((conversation) =>
          conversation.participant1Id === targetUserId
            ? conversation.participant2Id
            : conversation.participant1Id,
        ),
      ),
    );

    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.auditoryId IN (:...participantIds)', { participantIds })
      .orWhere('client.id IN (:...participantIds)', { participantIds })
      .select([
        'client.id',
        'client.auditoryId',
        'client.firstName',
        'client.lastName',
      ])
      .getMany();

    const profiles = clients.reduce(
      (acc, client) => {
        const profile = {
          firstName: client.firstName,
          lastName: client.lastName,
        };

        acc[client.auditoryId] = profile;
        acc[client.id] = profile;

        return acc;
      },
      {} as Record<string, { firstName: string; lastName: string }>,
    );

    return {
      success: true,
      data: conversations.map((conversation) => {
        const participantId =
          conversation.participant1Id === targetUserId
            ? conversation.participant2Id
            : conversation.participant1Id;

        return {
          ...conversation,
          participantFirstName: profiles[participantId]?.firstName || 'Unknown',
          participantLastName: profiles[participantId]?.lastName || 'User',
          participantAvatar: undefined,
        };
      }),
    };
  }

  @Get('messages/:userId1/:userId2')
  async getConversationMessages(
    @CurrentUser() user: any,
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    if (user.userId !== userId1 && user.userId !== userId2) {
      throw new ForbiddenException('Access to this conversation is denied');
    }

    const messages = await this.chatService.getConversationMessages(
      userId1,
      userId2,
      Number(limit) || 50,
      Number(offset) || 0,
    );

    return { success: true, data: messages };
  }

  @Post('mark-read/:senderId/:receiverId')
  async markMessagesAsRead(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    await this.chatService.markMessagesAsRead(senderId, receiverId);

    return { success: true };
  }

  @Get('unread-count')
  async getUnreadMessagesCount(@CurrentUser() user: any) {
    const count = await this.chatService.getUnreadMessagesCount(user.userId);

    return { success: true, data: { count } };
  }
}
