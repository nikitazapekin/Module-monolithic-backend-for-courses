import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface LastMessage {
  content: string;
  senderId: string;
  createdAt: Date;
}

@Schema({ collection: 'chat_conversations' })
export class ConversationMongoEntity extends Document {
  @Prop({ required: true, index: true })
  participant1Id: string;

  @Prop({ required: true, index: true })
  participant2Id: string;

  @Prop({ nullable: true })
  lastMessageId: string;

  @Prop({ type: Object, nullable: true })
  lastMessage: LastMessage | null;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationMongoEntity);
ConversationSchema.index({ participant1Id: 1, participant2Id: 1 }, { unique: true });
ConversationSchema.index({ updatedAt: -1 });
