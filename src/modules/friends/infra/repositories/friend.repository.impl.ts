import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFriendRepository } from '../../domain/interfaces/friend.repository.interface';
import { Friend } from '../../domain/entities/friend.entity';
import { FriendOrmEntity } from '../typeorm/friend.orm-entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class FriendRepository implements IFriendRepository {
  constructor(
    @InjectRepository(FriendOrmEntity)
    private readonly friendRepository: Repository<FriendOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  async findById(id: string): Promise<Friend | null> {
    const entity = await this.friendRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<Friend[]> {
    const entities = await this.friendRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      relations: ['friend'],
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByFriendId(friendId: string): Promise<Friend[]> {
    const entities = await this.friendRepository.find({
      where: { friendId },
      order: { createdAt: 'DESC' },
      relations: ['client'],
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByClientIdAndFriendId(
    clientId: string,
    friendId: string,
  ): Promise<Friend | null> {
    const entity = await this.friendRepository.findOne({
      where: { clientId, friendId },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async save(friend: Friend): Promise<Friend> {
    const entity = this.toOrmEntity(friend);
    const saved = await this.friendRepository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.friendRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await this.friendRepository.delete({ clientId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByFriendId(friendId: string): Promise<boolean> {
    const result = await this.friendRepository.delete({ friendId });
    return (result.affected ?? 0) > 0;
  }

  async exists(clientId: string, friendId: string): Promise<boolean> {
    const count = await this.friendRepository.count({
      where: { clientId, friendId },
    });
    return count > 0;
  }

  private toDomain(entity: FriendOrmEntity): Friend {
    const friend = new Friend(entity.clientId, entity.friendId);

    Object.assign(friend, {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return friend;
  }

  private toOrmEntity(friend: Friend): FriendOrmEntity {
    const entity = new FriendOrmEntity();
    entity.id = friend.id;
    entity.clientId = friend.clientId;
    entity.friendId = friend.friendId;
    entity.createdAt = friend.createdAt;
    entity.updatedAt = friend.updatedAt;

    return entity;
  }
}
