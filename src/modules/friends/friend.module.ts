import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendController } from './interfaces/http/friend.controller';
import { FriendRequestController } from './interfaces/http/friend-request.controller';
import { FriendService } from './application/services/friend.service';
import { FriendRequestService } from './application/services/friend-request.service';
import { FriendRepository } from './infra/repositories/friend.repository.impl';
import { FriendRequestRepository } from './infra/repositories/friend-request.repository.impl';
import { FriendOrmEntity } from './infra/typeorm/friend.orm-entity';
import { FriendRequestOrmEntity } from './infra/typeorm/friend-request.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FriendOrmEntity,
      FriendRequestOrmEntity,
      ClientOrmEntity,
    ]),
  ],
  controllers: [FriendController, FriendRequestController],
  providers: [
    FriendService,
    FriendRequestService,
    {
      provide: 'IFriendRepository',
      useClass: FriendRepository,
    },
    {
      provide: 'IFriendRequestRepository',
      useClass: FriendRequestRepository,
    },
  ],
  exports: [FriendService, FriendRequestService, TypeOrmModule],
})
export class FriendsModule {}
