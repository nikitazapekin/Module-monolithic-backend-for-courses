import { NestFactory } from '@nestjs/core';
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
    origin: ['http://localhost:3001', 'http://localhost:3000'],  
    credentials: true,  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

    await app.listen( 3002);

//  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
