import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export class ConversationResponseDto {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationWithProfileDto extends ConversationResponseDto {
  participantFirstName: string;
  participantLastName: string;
  participantAvatar?: string;
}
