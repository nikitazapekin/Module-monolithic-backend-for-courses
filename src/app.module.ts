import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from '@infra/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@infra/logger/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@modules/auth/auth.module';
import { TodoModule } from '@modules/todo/todo.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { LessonModule } from '@modules/lesson/lesson.module';
import { CheckpointModule } from '@modules/checkpoint/checkpoint.module';
import { CodeModule } from '@modules/code/code.module';
import { CodeWithTimeModule } from '@modules/codeWithTime/code-with-time.module';
import { LessonDetailsModule } from '@modules/lesson-details/lesson-details.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { CertificateModule } from '@modules/certificate/certificate.module';
import { CodingTasksModule } from '@modules/coding-tasks/coding-tasks.module';
import { AchievementsModule } from '@modules/achievements/achievement.module';
import { FriendsModule } from '@modules/friends/friend.module';
import { LessonCommentsModule } from '@modules/lesson-comments/lesson-comments.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AnnouncementModule } from '@modules/announcements/announcement.module';
import { LeadersModule } from '@modules/leaders/leaders.module';
import { ForumModule } from '@modules/forum/forum.module';
import { ArticlesModule } from '@modules/articles/articles.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URL') ||
          'mongodb://localhost:27017/eventstore',
      }),
    }),
    LoggerModule,
    DataBaseModule,
    TodoModule,
    AuthModule,
    CoursesModule,
    LessonModule,
    CheckpointModule,
    LessonDetailsModule,
    CodeModule,
    CodeWithTimeModule,
    ProfileModule,
    CertificateModule,
    CodingTasksModule,
    AchievementsModule,
    FriendsModule,
    LessonCommentsModule,
    ChatModule,
    AnnouncementModule,
    LeadersModule,
    ForumModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
