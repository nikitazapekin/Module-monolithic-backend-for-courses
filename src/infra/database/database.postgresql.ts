import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import * as dotenv from 'dotenv';
 
dotenv.config();

export class PostgresDatabase {
  constructor(private readonly configService: ConfigService) {}

  getConnection(): TypeOrmModuleOptions {
   
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'platform',
      synchronize: process.env.DB_SYNCHRONIZE !== 'false', 
      logging: process.env.DB_LOGGING === 'true',
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000'),
      autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES !== 'false',
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
      ssl: process.env.DB_SSL === 'true',
    };
 
    const entities = this.loadEntities();
    console.log(` Loaded ${entities.length} entities`);

    return {
      type: 'postgres',
      host: dbConfig.host, 
      port: dbConfig.port, 
      username: dbConfig.username, 
      password: dbConfig.password, 
      database: dbConfig.database, 
      entities: entities,
      synchronize: dbConfig.synchronize, 
      logging: dbConfig.logging,  
      retryAttempts: dbConfig.retryAttempts, 
      retryDelay: dbConfig.retryDelay, 
      autoLoadEntities: dbConfig.autoLoadEntities, 
      migrationsRun: dbConfig.migrationsRun, 
      migrations: [join(__dirname, '../../database/migrations/*.{ts,js}')],

      extra: {
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 20,
      },
      ssl: dbConfig.ssl
        ? {
         
            rejectUnauthorized: false,
          }
        : false,
    };
  }

  private loadEntities(): any[] {
  
    const searchDirs = [
      join(process.cwd(), 'src/**/*.orm-entity.{ts,js}'),
      join(process.cwd(), 'dist/**/*.orm-entity.{ts,js}'),
    ];

    const entities: any[] = [];
 
    const findEntities = (dir: string, pattern: RegExp): void => {
      if (!statSync(dir).isDirectory()) return;

      const files = readdirSync(dir);

      files.forEach((file) => {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          findEntities(fullPath, pattern);
        } else if (pattern.test(file)) {
          try {
            console.log(`Found entity: ${fullPath}`);

            if (
              file.endsWith('.ts') &&
              !process.env.NODE_ENV?.includes('prod')
            ) {
              delete require.cache[require.resolve(fullPath)];
              const module = require(fullPath);
              if (module.default) {
                entities.push(module.default);
              }
            } else if (
              file.endsWith('.js') ||
              process.env.NODE_ENV?.includes('prod')
            ) {
              const jsPath = fullPath.replace('.ts', '.js');
              if (statSync(jsPath, { throwIfNoEntry: false })) {
                const module = require(jsPath);
                if (module.default) {
                  entities.push(module.default);
                }
              }
            }
          } catch (error) {
            console.error(
              `Failed to load entity ${fullPath}:`,
              error.message,
            );
          }
        }
      });
    };
 
    searchDirs.forEach((dirPattern) => {
      const baseDir = dirPattern.split('*')[0];
      try {
        if (statSync(baseDir, { throwIfNoEntry: false })) {
          const pattern = /\.orm-entity\.(ts|js)$/;
          findEntities(baseDir, pattern);
        }
      } catch (error) {
        console.log(`Directory ${baseDir} not found, skipping...`);
      }
    });
 
    if (entities.length === 0) {
      console.log('No entities found with pattern, using default path...');

      const defaultPath = join(process.cwd(), 'dist/**/*.entity{.ts,.js}');
      const defaultBaseDir = defaultPath.split('*')[0];

      if (statSync(defaultBaseDir, { throwIfNoEntry: false })) {
        const pattern = /\.entity\.(ts|js)$/;
        findEntities(defaultBaseDir, pattern);
      }
    }
    console.log(`Successfully loaded ${entities.length} entities`);
    if (entities.length > 0) {
      entities.forEach((entity, index) => {
        console.log(`  ${index + 1}. ${entity.name || 'Unnamed Entity'}`);
      });
    }
    return entities;
  }

  static async testConnection(): Promise<boolean> {
    try {

      const testConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'Belorus2010',
        database: process.env.DB_NAME || 'platform',
      };

      

      const { Client } = require('pg');
      const client = new Client({
        host: testConfig.host,
        port: testConfig.port,
        user: testConfig.user,
        password: testConfig.password,
        database: testConfig.database,
        connectionTimeoutMillis: 10000,
      });

      await client.connect();
      console.log(' Database connection successful!');

 
      const result = await client.query('SELECT current_database(), version()');
      console.log(' Database Info:', result.rows[0]);

      await client.end();
      return true;
    } catch (error) {
      console.error(' Database connection failed:', error.message);
      console.error('Full error:', error);


      return false;
    }
  }

  static async createMigration(): Promise<void> {
    console.log(' Creating database migration...');

    try {
  
      const migrationSQL = `
                -- Create todos table
                CREATE TABLE IF NOT EXISTS todos (
                    id VARCHAR(50) PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    description TEXT,
                    isCompleted BOOLEAN DEFAULT false,
                    "createdAt" TIMESTAMP DEFAULT NOW(),
                    "updatedAt" TIMESTAMP DEFAULT NOW()
                );
                
                -- Create index for faster queries
                CREATE INDEX IF NOT EXISTS idx_todos_iscompleted ON todos(isCompleted);
                CREATE INDEX IF NOT EXISTS idx_todos_createdat ON todos("createdAt");
                
                -- Create function to update updatedAt timestamp
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW."updatedAt" = NOW();
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
                
                -- Create trigger for automatic updatedAt
                DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
                CREATE TRIGGER update_todos_updated_at
                    BEFORE UPDATE ON todos
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `;

      const fs = require('fs');
      const path = require('path');
      const migrationsDir = path.join(process.cwd(), 'migrations');

      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
      const migrationFile = path.join(
        migrationsDir,
        `${timestamp}_create_todos_table.sql`,
      );

      fs.writeFileSync(migrationFile, migrationSQL);
      console.log(`Migration saved to: ${migrationFile}`);
    } catch (error) {
      console.error('Failed to create migration:', error.message);
    }
  }
}

export const testPostgresConnection = async (): Promise<boolean> => {
  return PostgresDatabase.testConnection();
};

export const getHardcodedDbConfig = (): TypeOrmModuleOptions => {
  const hardcodedConfig = {
    type: 'postgres' as const,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Belorus2010',
    database: 'platform',
    synchronize: true,
    logging: true,
    autoLoadEntities: true,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    cli: {
      migrationsDir: join(__dirname, '../migrations'),
    },
    extra: {
      connectionTimeoutMillis: 10000,
    },
  };

  return hardcodedConfig;
};