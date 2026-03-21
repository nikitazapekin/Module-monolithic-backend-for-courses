import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
 
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

 

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:8081',
      'http://192.168.*:*',
      'ws://192.168.*:*',
      'exp://192.168.*:*',
      'http://localhost:*',
      'ws://localhost:*',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  });
 
  app.use((req: any, res: any, next: any) => {
 

    if (req.method === 'POST' || req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
      
      });
    }

    next();
  });

  await app.listen(3002);
  console.log('Сервер запущен на порту 3002 (БЕЗ ФИЛЬТРОВ)');
}
bootstrap(); 