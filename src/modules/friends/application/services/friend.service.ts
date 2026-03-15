import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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

  /**
   * Get clientId from auditoryId
   */
  private async getClientIdFromAuditoryId(auditoryId: string): Promise<string> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(`Client with auditory ID ${auditoryId} not found`);
    }

    return client.id;
  }

  /**
   * Get client entity by auditoryId
   */
  private async getClientByAuditoryId(auditoryId: string): Promise<ClientOrmEntity> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(`Client with auditory ID ${auditoryId} not found`);
    }

    return client;
  }

  /**
   * Add a friend
   */
  async addFriend(clientAuditoryId: string, friendAuditoryId: string): Promise<Friend> {
    try {
      // Get client IDs from auditory IDs
      const client = await this.getClientByAuditoryId(clientAuditoryId);
      const friend = await this.getClientByAuditoryId(friendAuditoryId);

      // Cannot add yourself as a friend
      if (client.id === friend.id) {
        throw new BadRequestException('Cannot add yourself as a friend');
      }

      // Check if friendship already exists
      const existing = await this.friendRepository.findByClientIdAndFriendId(client.id, friend.id);
      if (existing) {
        throw new ConflictException('Friendship already exists');
      }

      const friendship = new Friend(client.id, friend.id);
      const saved = await this.friendRepository.save(friendship);

      console.log(`Friendship created successfully with ID: ${saved.id}`);

      return saved;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error adding friend:', error);
      throw new BadRequestException(`Failed to add friend: ${error.message}`);
    }
  }

  /**
   * Get friend by ID
   */
  async findById(id: string): Promise<Friend> {
    const friend = await this.friendRepository.findById(id);
    if (!friend) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
    return friend;
  }

  /**
   * Get all friends of a client
   */
  async findByClientId(clientId: string): Promise<Friend[]> {
    return this.friendRepository.findByClientId(clientId);
  }

  /**
   * Get all friends of a client by auditoryId
   */
  async findByClientAuditoryId(clientAuditoryId: string): Promise<Friend[]> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    return this.findByClientId(clientId);
  }

  /**
   * Get all clients who have this client as a friend
   */
  async findByFriendId(friendId: string): Promise<Friend[]> {
    return this.friendRepository.findByFriendId(friendId);
  }

  /**
   * Get all clients who have this client as a friend by auditoryId
   */
  async findByFriendAuditoryId(friendAuditoryId: string): Promise<Friend[]> {
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);
    return this.findByFriendId(friendId);
  }

  /**
   * Search friends by name
   */
  async searchFriends(clientAuditoryId: string, query: string): Promise<Friend[]> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    
    const friends = await this.friendRepository.findByClientId(clientId);
    
    // Get client details for each friend and filter by name
    const friendDetails = await Promise.all(
      friends.map(async (friendship) => {
        const friendClient = await this.clientRepository.findOne({
          where: { id: friendship.friendId },
        });
        return { friendship, friendClient };
      })
    );

    // Filter by query (firstName, lastName, or middleName)
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

  /**
   * Remove a friend
   */
  async removeFriend(clientAuditoryId: string, friendAuditoryId: string): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);

    const friendship = await this.friendRepository.findByClientIdAndFriendId(clientId, friendId);
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    return this.friendRepository.delete(friendship.id);
  }

  /**
   * Remove friend by friendship ID
   */
  async removeFriendById(id: string): Promise<boolean> {
    const friendship = await this.friendRepository.findById(id);
    if (!friendship) {
      throw new NotFoundException(`Friendship with ID ${id} not found`);
    }
    return this.friendRepository.delete(id);
  }

  /**
   * Remove all friends of a client
   */
  async removeAllFriends(clientId: string): Promise<boolean> {
    return this.friendRepository.deleteByClientId(clientId);
  }

  /**
   * Remove all friends of a client by auditoryId
   */
  async removeAllFriendsByAuditoryId(clientAuditoryId: string): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    return this.removeAllFriends(clientId);
  }

  /**
   * Check if friendship exists
   */
  async isFriend(clientAuditoryId: string, friendAuditoryId: string): Promise<boolean> {
    const clientId = await this.getClientIdFromAuditoryId(clientAuditoryId);
    const friendId = await this.getClientIdFromAuditoryId(friendAuditoryId);
    return this.friendRepository.exists(clientId, friendId);
  }

  /**
   * Search users by name (for adding friends)
   */
  async searchUsers(query: string): Promise<ClientOrmEntity[]> {
    const lowerQuery = query.toLowerCase().trim();

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .select(['client.id', 'client.firstName', 'client.lastName', 'client.middleName', 'client.auditoryId'])
      .limit(50);

    // If query is empty, return all users
    if (lowerQuery) {
      queryBuilder
        .where('LOWER(client.firstName) LIKE :query', { query: `%${lowerQuery}%` })
        .orWhere('LOWER(client.lastName) LIKE :query', { query: `%${lowerQuery}%` })
        .orWhere('LOWER(client.middleName) LIKE :query', { query: `%${lowerQuery}%` });
    }

    return queryBuilder.getMany();
  }
}
