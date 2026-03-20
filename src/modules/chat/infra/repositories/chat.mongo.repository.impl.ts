import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageMongoEntity } from '../mongoose/message.mongo-entity';
import { ConversationMongoEntity } from '../mongoose/conversation.mongo-entity';
import { Message as MessageEntity, Conversation as ConversationEntity } from '../../domain/entities/chat.entity';

@Injectable()
export class ChatMongoRepository {
  constructor(
    @InjectModel(MessageMongoEntity.name)
    private messageModel: Model<MessageMongoEntity>,
    @InjectModel(ConversationMongoEntity.name)
    private conversationModel: Model<ConversationMongoEntity>,
  ) {}

  async createMessage(message: Omit<MessageEntity, 'id'>): Promise<MessageEntity> {
    const createdMessage = await this.messageModel.create(message);
    return this.mapToMessageEntity(createdMessage);
  }

  async findMessagesByConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageEntity[]> {
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return messages
      .map((msg) => this.mapToMessageEntity(msg))
      .reverse();
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderId,
        receiverId,
        read: false,
      },
      { read: true },
    );
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: userId,
      read: false,
    });
  }

  async createConversation(
    conversation: Omit<ConversationEntity, 'id'>,
  ): Promise<ConversationEntity> {
    const createdConversation = await this.conversationModel.create(conversation);
    return this.mapToConversationEntity(createdConversation);
  }

  async findConversation(
    userId1: string,
    userId2: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.conversationModel
      .findOne({
        $or: [
          { participant1Id: userId1, participant2Id: userId2 },
          { participant1Id: userId2, participant2Id: userId1 },
        ],
      })
      .lean();

    if (!conversation) return null;
    return this.mapToConversationEntity(conversation);
  }

  async findConversationsByUserId(
    userId: string,
  ): Promise<ConversationEntity[]> {
    const conversations = await this.conversationModel
      .find({
        $or: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();

    return conversations.map((conv) =>
      this.mapToConversationEntity(conv),
    );
  }

  async updateConversation(
    conversationId: string,
    data: Partial<ConversationEntity>,
  ): Promise<ConversationEntity> {
    await this.conversationModel.findByIdAndUpdate(conversationId, data);
    const updatedConversation = await this.conversationModel.findById(conversationId).lean();

    if (!updatedConversation) {
      throw new Error('Conversation not found');
    }

    return this.mapToConversationEntity(updatedConversation);
  }

  private mapToMessageEntity(entity: any): MessageEntity {
    return new MessageEntity(
      entity._id.toString(),
      entity.senderId,
      entity.receiverId,
      entity.content,
      entity.read,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private mapToConversationEntity(
    entity: any,
  ): ConversationEntity {
    return new ConversationEntity(
      entity._id.toString(),
      entity.participant1Id,
      entity.participant2Id,
      entity.lastMessageId,
      entity.lastMessage,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
