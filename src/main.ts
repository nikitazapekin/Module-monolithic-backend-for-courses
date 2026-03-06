import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/http-exceptions.filter';
import { ResposneInterceptor } from '@common/interceptors/response.interceptor';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ВРЕМЕННО КОММЕНТИРУЕМ фильтры и интерцепторы
  // app.useGlobalInterceptors(new ResposneInterceptor())
  // app.useGlobalFilters(new AllExceptionsFilter())

    app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());
  
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:8081'],  
    credentials: true,  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  });

  // Добавьте middleware для логирования
  app.use((req: any, res: any, next: any) => {
    console.log('🔥', new Date().toISOString(), req.method, req.url);
    console.log('Origin:', req.headers.origin);
    console.log('Content-Type:', req.headers['content-type']);
    
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
    //    console.log('Body:', body);
      });
    }
    
    next();
  });

  await app.listen(3002);
  console.log('🚀 Сервер запущен на порту 3002 (БЕЗ ФИЛЬТРОВ)');
}
bootstrap();
/* import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/http-exceptions.filter';
import { ResposneInterceptor } from '@common/interceptors/response.interceptor';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResposneInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())
  
  app.use(cookieParser());
   app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000',  'http://localhost:3002'],  
    credentials: true,  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

    await app.listen( 3002);

//  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
 */