import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodingTasksController } from './interfaces/http/coding-tasks.controller';
import { CodingTasksService } from './application/services/coding-tasks.service';
import { CodeTaskOrmEntity } from './infra/typeorm/code-task.orm-entity';
import { StudentLevelOrmEntity } from './infra/typeorm/student-level.orm-entity';
import { SolvedTaskOrmEntity } from './infra/typeorm/solved-task.orm-entity';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';
import { AuditoryOrmEntity } from '@modules/auth/infra/typeorm/auditory.orm-entity';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';
import { CodeModule } from '@modules/code/code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CodeTaskOrmEntity,
      StudentLevelOrmEntity,
      SolvedTaskOrmEntity,
      AdminOrmEntity,
      AuditoryOrmEntity,
      ClientOrmEntity,
    ]),
    CodeModule,
  ],
  controllers: [CodingTasksController],
  providers: [CodingTasksService],
  exports: [CodingTasksService],
})
export class CodingTasksModule {}
