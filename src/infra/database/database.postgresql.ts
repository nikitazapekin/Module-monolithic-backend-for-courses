import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import * as dotenv from 'dotenv';

// Загружаем .env файл для дебага
dotenv.config();

export class PostgresDatabase {
    constructor(private readonly configService: ConfigService) { }

    getConnection(): TypeOrmModuleOptions {
        // ЗАХАРДКОЖЕННЫЕ ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ
        const hardcodedConfig = {
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'Belorus2010', // Ваш пароль из тестового подключения
            database: 'platform',
            synchronize: true,
            logging: true,
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
            migrationsRun: false,
            ssl: false
        };

        console.log('🔍 POSTGRES CONFIGURATION (HARDCODED):');
        console.log('======================================');
        console.log('Host:', hardcodedConfig.host);
        console.log('Port:', hardcodedConfig.port);
        console.log('Database:', hardcodedConfig.database);
        console.log('Username:', hardcodedConfig.username);
        console.log('Password:', '***' + hardcodedConfig.password.slice(-3)); // Показываем последние 3 символа для проверки
        console.log('Synchronize:', hardcodedConfig.synchronize);
        console.log('Logging:', hardcodedConfig.logging);
        console.log('======================================');

        // Динамическая загрузка entities
        const entities = this.loadEntities();
        console.log(`📦 Loaded ${entities.length} entities`);

        return {
            type: 'postgres',
            host: hardcodedConfig.host,
            port: hardcodedConfig.port,
            username: hardcodedConfig.username,
            password: hardcodedConfig.password, // Теперь это точно строка
            database: hardcodedConfig.database,
            entities: entities,
            synchronize: hardcodedConfig.synchronize,
            logging: hardcodedConfig.logging,
            retryAttempts: hardcodedConfig.retryAttempts,
            retryDelay: hardcodedConfig.retryDelay,
            autoLoadEntities: hardcodedConfig.autoLoadEntities,
            migrationsRun: hardcodedConfig.migrationsRun,
            migrations: [join(__dirname, '../../migrations/*.{ts,js}')],
          
            extra: {
                connectionTimeoutMillis: 10000,
                idleTimeoutMillis: 30000,
                max: 20,
            },
            ssl: hardcodedConfig.ssl ? {
                rejectUnauthorized: false
            } : false,
        };
    }

    private loadEntities(): any[] {
        // Определяем директории для поиска entities
        const searchDirs = [
            join(process.cwd(), 'src/**/*.orm-entity.{ts,js}'),
            join(process.cwd(), 'dist/**/*.orm-entity.{ts,js}'),
        ];

        const entities: any[] = [];

        // Функция для рекурсивного поиска файлов
        const findEntities = (dir: string, pattern: RegExp): void => {
            if (!statSync(dir).isDirectory()) return;

            const files = readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = join(dir, file);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    findEntities(fullPath, pattern);
                } else if (pattern.test(file)) {
                    try {
                        console.log(`📄 Found entity: ${fullPath}`);
                        
                        if (file.endsWith('.ts') && !process.env.NODE_ENV?.includes('prod')) {
                            delete require.cache[require.resolve(fullPath)];
                            const module = require(fullPath);
                            if (module.default) {
                                entities.push(module.default);
                            }
                        } 
                        else if (file.endsWith('.js') || process.env.NODE_ENV?.includes('prod')) {
                            const jsPath = fullPath.replace('.ts', '.js');
                            if (statSync(jsPath, { throwIfNoEntry: false })) {
                                const module = require(jsPath);
                                if (module.default) {
                                    entities.push(module.default);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`❌ Failed to load entity ${fullPath}:`, error.message);
                    }
                }
            });
        };

        // Поиск во всех директориях
        searchDirs.forEach(dirPattern => {
            const baseDir = dirPattern.split('*')[0];
            try {
                if (statSync(baseDir, { throwIfNoEntry: false })) {
                    const pattern = /\.orm-entity\.(ts|js)$/;
                    findEntities(baseDir, pattern);
                }
            } catch (error) {
                console.log(`ℹ️  Directory ${baseDir} not found, skipping...`);
            }
        });

        // Если не найдено entities, используем дефолтный путь
        if (entities.length === 0) {
            console.log('ℹ️  No entities found with pattern, using default path...');
            
            const defaultPath = join(process.cwd(), 'dist/**/*.entity{.ts,.js}');
            const defaultBaseDir = defaultPath.split('*')[0];
            
            if (statSync(defaultBaseDir, { throwIfNoEntry: false })) {
                const pattern = /\.entity\.(ts|js)$/;
                findEntities(defaultBaseDir, pattern);
            }
        }

        console.log(`✅ Successfully loaded ${entities.length} entities`);
        if (entities.length > 0) {
            entities.forEach((entity, index) => {
                console.log(`  ${index + 1}. ${entity.name || 'Unnamed Entity'}`);
            });
        }

        return entities;
    }

    /**
     * Вспомогательный метод для проверки подключения к БД
     */
    static async testConnection(): Promise<boolean> {
        try {
            console.log('🧪 Testing database connection...');
            
            // ТЕСТОВЫЕ ХАРДКОДНЫЕ ДАННЫЕ
            const testConfig = {
                host: 'localhost',
                port: 5432,
                user: 'postgres',
                password: 'Belorus2010',
                database: 'platform'
            };
            
            console.log('📊 Test config:', {
                ...testConfig,
                password: '***' + testConfig.password.slice(-3)
            });
            
            const { Client } = require('pg');
            const client = new Client({
                host: testConfig.host,
                port: testConfig.port,
                user: testConfig.user,
                password: testConfig.password,
                database: testConfig.database,
                connectionTimeoutMillis: 5000,
            });

            await client.connect();
            console.log('✅ Database connection successful!');
            
            // Проверяем наличие базы данных
            const result = await client.query('SELECT current_database(), version()');
            console.log('📊 Database Info:', result.rows[0]);
            
            await client.end();
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            
            // Детальная информация об ошибке
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Проверьте, запущен ли PostgreSQL:');
            console.log('   Windows: services.msc -> ищите "PostgreSQL"');
            console.log('   Linux: sudo service postgresql status');
            console.log('2. Попробуйте подключиться вручную:');
            console.log('   psql -h localhost -U postgres -d platform');
            console.log('3. Если базы данных нет, создайте ее:');
            console.log('   createdb -U postgres platform');
            console.log('4. Или создайте через psql:');
            console.log('   psql -U postgres');
            console.log('   CREATE DATABASE platform;');
            console.log('   \\q');
            
            return false;
        }
    }

    /**
     * Создает миграцию для базы данных
     */
    static async createMigration(): Promise<void> {
        console.log('📝 Creating database migration...');
        
        try {
            // Простая SQL миграция для создания таблицы todos
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

            console.log('✅ Migration SQL generated');
            
            // Сохраняем в файл
            const fs = require('fs');
            const path = require('path');
            const migrationsDir = path.join(process.cwd(), 'migrations');
            
            if (!fs.existsSync(migrationsDir)) {
                fs.mkdirSync(migrationsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const migrationFile = path.join(migrationsDir, `${timestamp}_create_todos_table.sql`);
            
            fs.writeFileSync(migrationFile, migrationSQL);
            console.log(`📄 Migration saved to: ${migrationFile}`);
            
        } catch (error) {
            console.error('❌ Failed to create migration:', error.message);
        }
    }
}

// Экспортируем вспомогательные функции
export const testPostgresConnection = async (): Promise<boolean> => {
    return PostgresDatabase.testConnection();
};

export const createPostgresMigration = PostgresDatabase.createMigration;

// Экспортируем хардкодную конфигурацию для использования в других местах
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
        }
    };
    
    return hardcodedConfig;
};
