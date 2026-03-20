import { Injectable, Inject } from '@nestjs/common';
import { ChatTypeOrmRepository } from '../../infra/repositories/chat.typeorm.repository.impl';
import { Message, Conversation } from '../../domain/entities/chat.entity';
import {
  MessageResponseDto,
  ConversationResponseDto,
  ConversationWithProfileDto,
} from '../dtos/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('IChatRepository') 
    private readonly chatRepository: ChatTypeOrmRepository
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<MessageResponseDto> {
    const message = await this.chatRepository.createMessage({
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.updateConversation(senderId, receiverId, message);
    await this.markMessagesAsRead(senderId, receiverId);

    return this.mapToMessageDto(message);
  }

  async getConversationMessages(
    userId1: string,
    userId2: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.chatRepository.findMessagesByConversation(
      userId1,
      userId2,
      limit,
      offset,
    );

    return messages.map((msg) => this.mapToMessageDto(msg));
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.chatRepository.markMessagesAsRead(senderId, receiverId);
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return this.chatRepository.getUnreadMessagesCount(userId);
  }

  async getConversations(
    userId: string,
    profiles: Record<string, { firstName: string; lastName: string }>,
  ): Promise<ConversationWithProfileDto[]> {
    const conversations = await this.chatRepository.findConversationsByUserId(
      userId,
    );

    const result: ConversationWithProfileDto[] = [];

    for (const conv of conversations) {
      const participantId =
        conv.participant1Id === userId
          ? conv.participant2Id
          : conv.participant1Id;

      const profile = profiles[participantId];

      const unreadCount = await this.chatRepository.getUnreadMessagesCount(
        userId,
      );

      result.push({
        id: conv.id,
        participant1Id: conv.participant1Id,
        participant2Id: conv.participant2Id,
        lastMessage: conv.lastMessage,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participantFirstName: profile?.firstName || 'Unknown',
        participantLastName: profile?.lastName || 'User',
        participantAvatar: undefined,
      });
    }

    return result;
  }

  async getConversation(
    userId1: string,
    userId2: string,
  ): Promise<ConversationResponseDto | null> {
    const conv = await this.chatRepository.findConversation(userId1, userId2);

    if (!conv) return null;

    return {
      id: conv.id,
      participant1Id: conv.participant1Id,
      participant2Id: conv.participant2Id,
      lastMessage: conv.lastMessage,
      unreadCount: 0,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  }

  private async updateConversation(
    senderId: string,
    receiverId: string,
    message: Message,
  ): Promise<void> {
    let conv = await this.chatRepository.findConversation(senderId, receiverId);

    if (!conv) {
      const participantIds = [senderId, receiverId].sort();
      conv = await this.chatRepository.createConversation({
        participant1Id: participantIds[0],
        participant2Id: participantIds[1],
        lastMessageId: null,
        lastMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await this.chatRepository.updateConversation(conv.id, {
      lastMessageId: message.id,
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
      },
      updatedAt: new Date(),
    });
  }

  private mapToMessageDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt,
    };
  }
}
