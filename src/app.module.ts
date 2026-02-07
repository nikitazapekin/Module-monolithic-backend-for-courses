import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from '@infra/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@infra/logger/logger.module';
 
import { AuthModule } from '@modules/auth/auth.module';
 
import { TodoModule } from '@modules/todo/todo.module';
import { CoursesModule } from '@modules/courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    DataBaseModule,
    
    TodoModule,
    AuthModule,
    CoursesModule
 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
