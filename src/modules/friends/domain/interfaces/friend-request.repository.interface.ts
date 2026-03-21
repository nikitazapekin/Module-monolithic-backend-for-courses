import { FriendRequest } from '../entities/friend-request.entity';
import { FriendRequestStatus } from '../entities/friend-request.entity';

export interface IFriendRequestRepository {
  findById(id: string): Promise<FriendRequest | null>;
  findBySenderId(senderId: string): Promise<FriendRequest[]>;
  findByReceiverId(receiverId: string): Promise<FriendRequest[]>;
  findBySenderIdAndReceiverId(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest | null>;
  findByStatus(
    userId: string,
    status: FriendRequestStatus,
    isReceiver: boolean,
  ): Promise<FriendRequest[]>;
  save(request: FriendRequest): Promise<FriendRequest>;
  delete(id: string): Promise<boolean>;
  exists(senderId: string, receiverId: string): Promise<boolean>;
}
