import { Friend } from '../entities/friend.entity';

export interface IFriendRepository {
  findById(id: string): Promise<Friend | null>;
  findByClientId(clientId: string): Promise<Friend[]>;
  findByFriendId(friendId: string): Promise<Friend[]>;
  findByClientIdAndFriendId(
    clientId: string,
    friendId: string,
  ): Promise<Friend | null>;
  save(friend: Friend): Promise<Friend>;
  delete(id: string): Promise<boolean>;
  deleteByClientId(clientId: string): Promise<boolean>;
  deleteByFriendId(friendId: string): Promise<boolean>;
  exists(clientId: string, friendId: string): Promise<boolean>;
}
