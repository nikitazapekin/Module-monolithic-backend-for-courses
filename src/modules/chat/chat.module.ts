import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';
import { ChatGateway } from './interfaces/gateways/chat.gateway';
import { SimpleChatGateway } from './interfaces/gateways/simple-chat.gateway';
import { ChatController } from './interfaces/http/chat.controller';
import { UsersController } from './interfaces/http/users.controller';
import { ChatService } from './application/services/chat.service';
import { ChatMongoRepository } from './infra/repositories/chat.mongo.repository.impl';
import { MessageMongoEntity, MessageSchema } from './infra/mongoose/message.mongo-entity';
import { ConversationMongoEntity, ConversationSchema } from './infra/mongoose/conversation.mongo-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientOrmEntity,
    ]),
    MongooseModule.forFeature([
      { name: MessageMongoEntity.name, schema: MessageSchema },
      { name: ConversationMongoEntity.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ChatController, UsersController],
  providers: [
    ChatGateway,
    SimpleChatGateway,
    ChatService,
    {
      provide: 'IChatRepository',
      useClass: ChatMongoRepository,
    },
  ],
  exports: [ChatService, 'IChatRepository'],
})
export class ChatModule {}
