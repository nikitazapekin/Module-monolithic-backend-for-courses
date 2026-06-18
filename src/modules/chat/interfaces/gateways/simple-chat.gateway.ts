import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { ChatService } from '../../application/services/chat.service';

@WebSocketGateway({
  path: '/ws/chat',
  transports: ['websocket'],
  cors: {
    origin: true,
    credentials: true,
  },
})
export class SimpleChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, any> = new Map();

  constructor(private readonly chatService: ChatService) {}

  private getConversationRoom(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('_');
  }

  async handleConnection(client: any, req: any) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        client.close();
        return;
      }

      this.userSockets.set(userId, client);
      console.log(`User ${userId} connected to simple WebSocket`);

      client.on('close', () => {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected from simple WebSocket`);
      });
    } catch (error) {
      console.error('Connection error:', error);
      client.close();
    }
  }

  handleDisconnect(client: any) {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket === client) {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  broadcast(userId: string, message: any) {
    const client = this.userSockets.get(userId);
    
    if (client && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string; senderId: string },
    @ConnectedSocket() client: any,
  ) {
    const { receiverId, content, senderId } = data;

    try {
      const message = await this.chatService.sendMessage(
        senderId,
        receiverId,
        content,
      );
      const roomName = this.getConversationRoom(senderId, receiverId);

      this.broadcast(senderId, { event: 'newMessage', roomName, data: message });
      this.broadcast(receiverId, { event: 'newMessage', roomName, data: message });

      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { userId1: string; userId2: string },
  ) {
    console.log(`User joined conversation ${data.userId1}-${data.userId2}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { userId1: string; userId2: string },
  ) {
    console.log(`User left conversation ${data.userId1}-${data.userId2}`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string; receiverId: string },
  ) {
    const { senderId, receiverId } = data;
    const roomName = this.getConversationRoom(senderId, receiverId);

    try {
      await this.chatService.markMessagesAsRead(senderId, receiverId);

      this.broadcast(senderId, { event: 'messagesRead', roomName, data: { senderId, receiverId } });
      this.broadcast(receiverId, { event: 'messagesRead', roomName, data: { senderId, receiverId } });

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
