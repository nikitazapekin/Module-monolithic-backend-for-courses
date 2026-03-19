import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFactory } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
       

        const dbType: string = 'postgres';
        return DatabaseFactory.createDatabaseConnection(dbType, configService);
      },
    }),
  ],
})
export class DataBaseModule {}
