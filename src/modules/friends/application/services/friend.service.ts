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
import { Friend } from '../../domain/entities/friend.entity';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
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

  async getClientById(clientId: string): Promise<ClientOrmEntity | null> {
    return this.clientRepository.findOne({
      where: { id: clientId },
    });
  }
 
  async addFriend(
    clientAuditoryId: string,
    friendAuditoryId: string,
  ): Promise<Friend> {
    try {
    
      const client = await this.getClientByAuditoryId(clientAuditoryId);
      const friend = await this.getClientByAuditoryId(friendAuditoryId);
 
      if (client.id === friend.id) {
        throw new BadRequestException('Cannot add yourself as a friend');
      }
 
      const existing = await this.friendRepository.findByClientIdAndFriendId(
        client.id,
        friend.id,
      );
      if (existing) {
        throw new ConflictException('Friendship already exists');
      }

      const friendship = new Friend(client.id, friend.id);
      const reverseFriendship = new Friend(friend.id, client.id);
      const [saved] = await Promise.all([
        this.friendRepository.save(friendship),
        this.friendRepository.save(reverseFriendship),
      ]);

      console.log(`Friendship created successfully with ID: ${saved.id}`);

      return saved;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error adding friend:', error);
      throw new BadRequestException(`Failed to add friend: ${error.message}`);
    }
  }
 
  async findById(id: string): Promise<Friend> {
    const friend = await this.friendRepository.findById(id);
    if (!friend) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
    return friend;
  }
 
  async findByClientId(clientId: string): Promise<Friend[]> {
    return this.friendRepository.findByClientId(clientId);
  }
 
  async findByClientAuditoryId(clientAuditoryId: string): Promise<Friend[]> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    return this.findByClientId(clientId);
  }
 
  async findByFriendId(friendId: string): Promise<Friend[]> {
    return this.friendRepository.findByFriendId(friendId);
  }
 
  async findByFriendAuditoryId(friendAuditoryId: string): Promise<Friend[]> {
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);
    return this.findByFriendId(friendId);
  }
 
  async searchFriends(
    clientAuditoryId: string,
    query: string,
  ): Promise<Friend[]> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);

    const friends = await this.friendRepository.findByClientId(clientId);
 
    const friendDetails = await Promise.all(
      friends.map(async (friendship) => {
        const friendClient = await this.clientRepository.findOne({
          where: { id: friendship.friendId },
        });
        return { friendship, friendClient };
      }),
    );
 
    const lowerQuery = query.toLowerCase();
    const filtered = friendDetails.filter(({ friendClient }) => {
      if (!friendClient) return false;

      const firstName = friendClient.firstName?.toLowerCase() || '';
      const lastName = friendClient.lastName?.toLowerCase() || '';
      const middleName = friendClient.middleName?.toLowerCase() || '';

      return (
        firstName.includes(lowerQuery) ||
        lastName.includes(lowerQuery) ||
        middleName.includes(lowerQuery)
      );
    });

    return filtered.map(({ friendship }) => friendship);
  }
 
  async removeFriend(
    clientAuditoryId: string,
    friendAuditoryId: string,
  ): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);

    const friendship = await this.friendRepository.findByClientIdAndFriendId(
      clientId,
      friendId,
    );
    const reverseFriendship =
      await this.friendRepository.findByClientIdAndFriendId(friendId, clientId);

    if (!friendship && !reverseFriendship) {
      throw new NotFoundException('Friendship not found');
    }

    const results = await Promise.all([
      friendship ? this.friendRepository.delete(friendship.id) : Promise.resolve(false),
      reverseFriendship
        ? this.friendRepository.delete(reverseFriendship.id)
        : Promise.resolve(false),
    ]);

    return results.some(Boolean);
  }
 
  async removeFriendById(id: string): Promise<boolean> {
    const friendship = await this.friendRepository.findById(id);
    if (!friendship) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
    return this.friendRepository.delete(id);
  }
 
  async removeAllFriends(clientId: string): Promise<boolean> {
    return this.friendRepository.deleteByClientId(clientId);
  }
 
  async removeAllFriendsByAuditoryId(
    clientAuditoryId: string,
  ): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    return this.removeAllFriends(clientId);
  }
 
  async isFriend(
    clientAuditoryId: string,
    friendAuditoryId: string,
  ): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);
    return this.friendRepository.exists(clientId, friendId);
  }
 
  async searchUsers(query: string): Promise<ClientOrmEntity[]> {
    const lowerQuery = query.toLowerCase().trim();

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .select([
        'client.id',
        'client.firstName',
        'client.lastName',
        'client.middleName',
        'client.auditoryId',
      ])
      .limit(50);

    
    if (lowerQuery) {
      queryBuilder
        .where('LOWER(client.firstName) LIKE :query', {
          query: `%${lowerQuery}%`,
        })
        .orWhere('LOWER(client.lastName) LIKE :query', {
          query: `%${lowerQuery}%`,
        })
        .orWhere('LOWER(client.middleName) LIKE :query', {
          query: `%${lowerQuery}%`,
        });
    }

    return queryBuilder.getMany();
  }
}
