import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../../application/services/chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:8081',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<string, string> = new Map();

  constructor(private readonly chatService: ChatService) {}

  private getConversationRoom(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('_');
  }

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;
      
      if (!userId) {
        client.disconnect();
        return;
      }

      this.userSocketMap.set(userId, client.id);
      client.join(userId);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { receiverId, content, senderId } = data;

    try {
      const message = await this.chatService.sendMessage(
        senderId,
        receiverId,
        content,
      );
      const roomName = this.getConversationRoom(senderId, receiverId);

      this.server.to(roomName).emit('newMessage', message);
      this.server.to(senderId).emit('newMessage', message);
      this.server.to(receiverId).emit('newMessage', message);

      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { userId1: string; userId2: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId1, userId2 } = data;
    const roomName = [userId1, userId2].sort().join('_');
    
    client.join(roomName);
    console.log(`Client ${client.id} joined conversation ${roomName}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { userId1: string; userId2: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId1, userId2 } = data;
    const roomName = [userId1, userId2].sort().join('_');
    
    client.leave(roomName);
    console.log(`Client ${client.id} left conversation ${roomName}`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string; receiverId: string },
  ) {
    const { senderId, receiverId } = data;
    const roomName = this.getConversationRoom(senderId, receiverId);

    try {
      await this.chatService.markMessagesAsRead(senderId, receiverId);

      this.server.to(roomName).emit('messagesRead', { senderId, receiverId });
      this.server.to(senderId).emit('messagesRead', { senderId, receiverId });
      this.server.to(receiverId).emit('messagesRead', { senderId, receiverId });

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: 'Failed to mark as read' };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@MessageBody() data: { userId: string }) {
    const { userId } = data;

    try {
      const count = await this.chatService.getUnreadMessagesCount(userId);
      return { success: true, count };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { success: false, error: 'Failed to get unread count' };
    }
  }
}
