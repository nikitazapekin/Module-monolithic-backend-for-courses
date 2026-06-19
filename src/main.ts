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
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
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

  const port = Number(process.env.PORT) || 3009;
  await app.listen(port);
  console.log(`Сервер запущен на порту ${port}`);
}
bootstrap(); 