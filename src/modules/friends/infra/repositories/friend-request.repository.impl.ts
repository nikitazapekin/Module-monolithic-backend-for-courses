import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFriendRequestRepository } from '../../domain/interfaces/friend-request.repository.interface';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../../domain/entities/friend-request.entity';
import { FriendRequestOrmEntity } from '../typeorm/friend-request.orm-entity';

@Injectable()
export class FriendRequestRepository implements IFriendRequestRepository {
  constructor(
    @InjectRepository(FriendRequestOrmEntity)
    private readonly friendRequestRepository: Repository<FriendRequestOrmEntity>,
  ) {}

  async findById(id: string): Promise<FriendRequest | null> {
    const entity = await this.friendRequestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findBySenderId(senderId: string): Promise<FriendRequest[]> {
    const entities = await this.friendRequestRepository.find({
      where: { senderId },
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByReceiverId(receiverId: string): Promise<FriendRequest[]> {
    const entities = await this.friendRequestRepository.find({
      where: { receiverId },
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findBySenderIdAndReceiverId(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest | null> {
    const entity = await this.friendRequestRepository.findOne({
      where: { senderId, receiverId },
      relations: ['sender', 'receiver'],
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByStatus(
    userId: string,
    status: FriendRequestStatus,
    isReceiver: boolean,
  ): Promise<FriendRequest[]> {
    const entities = await this.friendRequestRepository.find({
      where: {
        ...(isReceiver ? { receiverId: userId } : { senderId: userId }),
        status,
      },
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async save(request: FriendRequest): Promise<FriendRequest> {
    const entity = this.toOrmEntity(request);
    const saved = await this.friendRequestRepository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.friendRequestRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(senderId: string, receiverId: string): Promise<boolean> {
    const count = await this.friendRequestRepository.count({
      where: { senderId, receiverId },
    });
    return count > 0;
  }

  private toDomain(entity: FriendRequestOrmEntity): FriendRequest {
    const request = new FriendRequest(entity.senderId, entity.receiverId);

    Object.assign(request, {
      id: entity.id,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return request;
  }

  private toOrmEntity(request: FriendRequest): FriendRequestOrmEntity {
    const entity = new FriendRequestOrmEntity();
    entity.id = request.id;
    entity.senderId = request.senderId;
    entity.receiverId = request.receiverId;
    entity.status = request.status;
    entity.createdAt = request.createdAt;
    entity.updatedAt = request.updatedAt;

    return entity;
  }
}
