import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../typeorm/message.orm-entity';
import { ConversationOrmEntity } from '../typeorm/conversation.orm-entity';
import { Message as MessageEntity, Conversation as ConversationEntity } from '../../domain/entities/chat.entity';

@Injectable()
export class ChatTypeOrmRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private messageRepository: Repository<MessageOrmEntity>,
    @InjectRepository(ConversationOrmEntity)
    private conversationRepository: Repository<ConversationOrmEntity>,
  ) {}

  async createMessage(message: Omit<MessageEntity, 'id'>): Promise<MessageEntity> {
    const createdMessage = this.messageRepository.create(message);
    const savedMessage = await this.messageRepository.save(createdMessage);
    return this.mapToMessageEntity(savedMessage);
  }

  async findMessagesByConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageEntity[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR ' +
        '(message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .skip(offset)
      .getMany();

    return messages
      .map((msg) => this.mapToMessageEntity(msg))
      .reverse();
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    await this.messageRepository.update(
      {
        senderId,
        receiverId,
        read: false,
      },
      { read: true },
    );
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }

  async getUnreadMessagesCountByConversation(
    senderId: string,
    receiverId: string,
  ): Promise<number> {
    return this.messageRepository.count({
      where: {
        senderId,
        receiverId,
        read: false,
      },
    });
  }

  async createConversation(
    conversation: Omit<ConversationEntity, 'id'>,
  ): Promise<ConversationEntity> {
    const createData: any = {
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      lastMessageId: conversation.lastMessageId || undefined,
      lastMessage: conversation.lastMessage,
    };
    
    const createdConversation = this.conversationRepository.create(createData);
    const savedConversation = await this.conversationRepository.save(
      createdConversation,
    );
    
    const savedEntity = Array.isArray(savedConversation) ? savedConversation[0] : savedConversation;
    return this.mapToConversationEntity(savedEntity);
  }

  async findConversation(
    userId1: string,
    userId2: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        '(conversation.participant1Id = :userId1 AND conversation.participant2Id = :userId2) OR ' +
        '(conversation.participant1Id = :userId2 AND conversation.participant2Id = :userId1)',
        { userId1, userId2 },
      )
      .getOne();

    if (!conversation) return null;
    return this.mapToConversationEntity(conversation);
  }

  async findConversationsByUserId(
    userId: string,
  ): Promise<ConversationEntity[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        'conversation.participant1Id = :userId OR conversation.participant2Id = :userId',
        { userId },
      )
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    return conversations.map((conv) =>
      this.mapToConversationEntity(conv),
    );
  }

  async updateConversation(
    conversationId: string,
    data: Partial<ConversationEntity>,
  ): Promise<ConversationEntity> {
    const updateData: any = {
      ...data,
      lastMessageId: data.lastMessageId || undefined,
    };
    
    await this.conversationRepository.update(conversationId, updateData);
    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!updatedConversation) {
      throw new Error('Conversation not found');
    }

    return this.mapToConversationEntity(updatedConversation);
  }

  private mapToMessageEntity(entity: MessageOrmEntity): MessageEntity {
    return new MessageEntity(
      entity.id,
      entity.senderId,
      entity.receiverId,
      entity.content,
      entity.read,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private mapToConversationEntity(
    entity: ConversationOrmEntity,
  ): ConversationEntity {
    return new ConversationEntity(
      entity.id,
      entity.participant1Id,
      entity.participant2Id,
      entity.lastMessageId,
      entity.lastMessage,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
