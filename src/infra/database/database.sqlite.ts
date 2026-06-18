import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class SQLiteDatabase {
  constructor(private readonly configService: ConfigService) {}

  getConnection(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: `./database.sqlite`,
      entities: [],
      autoLoadEntities: true,
      synchronize:
        this.configService.get<string>('DB_SYNCHRONIZE', 'true') !== 'false',
      logging: this.configService.get<string>('DB_LOGGING', 'false') === 'true',
    };
  }
}
