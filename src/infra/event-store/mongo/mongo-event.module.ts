import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongoEventStore } from './mongo-event.store';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventSchema } from '@infra/schemas/event.schema';

@Global()
@Module({})
export class MongoEventStoreModule {
  static register(): any {
   
  }
}
