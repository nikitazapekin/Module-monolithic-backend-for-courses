import { Module } from '@nestjs/common';
import { CodeWithTimeController } from './interfaces/http/code-with-time.controller';
import { CodeExecutionWithTimeService } from './application/services/code-execution-with-time.service';

@Module({
  controllers: [CodeWithTimeController],
  providers: [CodeExecutionWithTimeService],
  exports: [CodeExecutionWithTimeService],
})
export class CodeWithTimeModule {}
