import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ChatService } from '../../application/services/chat.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { SendMessageDto } from '../../application/dtos/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
    return { success: true, data: [] };
  }

  @Get('messages/:userId1/:userId2')
  async getConversationMessages(
    @CurrentUser() user: any,
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    const messages = await this.chatService.getConversationMessages(
      userId1,
      userId2,
      limit,
      offset,
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
