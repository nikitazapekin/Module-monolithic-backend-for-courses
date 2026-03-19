import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFriendRepository } from '../../domain/interfaces/friend.repository.interface';
import { IFriendRequestRepository } from '../../domain/interfaces/friend-request.repository.interface';
import { Friend } from '../../domain/entities/friend.entity';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../../domain/entities/friend-request.entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class FriendRequestService {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
    @Inject('IFriendRequestRepository')
    private readonly friendRequestRepository: IFriendRequestRepository,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

 
  private async getClientIdFromAuditoryId(auditoryId: string): Promise<string> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with auditory ID ${auditoryId} not found`,
      );
    }

    return client.id;
  }
 
  private async getClientByAuditoryId(
    auditoryId: string,
  ): Promise<ClientOrmEntity> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with auditory ID ${auditoryId} not found`,
      );
    }

    return client;
  }
 
  async sendFriendRequest(
    senderAuditoryId: string,
    receiverAuditoryId: string,
  ): Promise<FriendRequest> {
    try {
      const sender = await this.getClientByAuditoryId(senderAuditoryId);
      const receiver = await this.getClientByAuditoryId(receiverAuditoryId);

      
      if (sender.id === receiver.id) {
        throw new BadRequestException('Cannot send friend request to yourself');
      }
 
      const existingFriendship =
        await this.friendRepository.findByClientIdAndFriendId(
          sender.id,
          receiver.id,
        );
      if (existingFriendship) {
        throw new ConflictException('You are already friends');
      }
 
      const existingRequest =
        await this.friendRequestRepository.findBySenderIdAndReceiverId(
          sender.id,
          receiver.id,
        );
      if (existingRequest) {
        throw new ConflictException('Friend request already sent');
      }

      const request = new FriendRequest(sender.id, receiver.id);
      const saved = await this.friendRequestRepository.save(request);

      console.log(`Friend request created successfully with ID: ${saved.id}`);

      return saved;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error sending friend request:', error);
      throw new BadRequestException(
        `Failed to send friend request: ${error.message}`,
      );
    }
  }
 
  async acceptFriendRequest(requestId: string): Promise<Friend> {
    const request = await this.friendRequestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException(
        `Friend request with ID ${requestId} not found`,
      );
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Friend request is not pending');
    }
 
    request.accept();
    await this.friendRequestRepository.save(request);
 
    const friendship = new Friend(request.senderId, request.receiverId);
    const savedFriendship = await this.friendRepository.save(friendship);

    return savedFriendship;
  }
 
  async rejectFriendRequest(requestId: string): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException(
        `Friend request with ID ${requestId} not found`,
      );
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Friend request is not pending');
    }

    request.reject();
    return await this.friendRequestRepository.save(request);
  }
 
  async getPendingFriendRequests(
    userAuditoryId: string,
  ): Promise<FriendRequest[]> {
    const userId = await this.getClientIdFromAuditoryId(userAuditoryId);
    return await this.friendRequestRepository.findByStatus(
      userId,
      FriendRequestStatus.PENDING,
      true,
    );
  }
 
  async getSentFriendRequests(
    userAuditoryId: string,
  ): Promise<FriendRequest[]> {
    const userId = await this.getClientIdFromAuditoryId(userAuditoryId);
    return await this.friendRequestRepository.findByStatus(
      userId,
      FriendRequestStatus.PENDING,
      false,
    );
  }
 
  async cancelFriendRequest(
    senderAuditoryId: string,
    receiverAuditoryId: string,
  ): Promise<boolean> {
    const senderId = await this.getClientIdFromAuditoryId(senderAuditoryId);
    const receiverId = await this.getClientIdFromAuditoryId(receiverAuditoryId);

    const request =
      await this.friendRequestRepository.findBySenderIdAndReceiverId(
        senderId,
        receiverId,
      );

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Cannot cancel a non-pending request');
    }

    return await this.friendRequestRepository.delete(request.id);
  }
 
  async findById(id: string): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Friend request with ID ${id} not found`);
    }
    return request;
  }
 
  async hasPendingRequest(
    senderAuditoryId: string,
    receiverAuditoryId: string,
  ): Promise<{ hasRequest: boolean }> {
    const senderId = await this.getClientIdFromAuditoryId(senderAuditoryId);
    const receiverId = await this.getClientIdFromAuditoryId(receiverAuditoryId);
    const exists = await this.friendRequestRepository.exists(
      senderId,
      receiverId,
    );
    return { hasRequest: exists };
  }
}
