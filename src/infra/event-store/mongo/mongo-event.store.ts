import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEventStore } from '../event-store.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export type StoredEvent = {
  aggregateId: string;
  type: string;
  payload: any;
  timestamp: Date;
};

@Injectable()
export class MongoEventStore {
 
}
