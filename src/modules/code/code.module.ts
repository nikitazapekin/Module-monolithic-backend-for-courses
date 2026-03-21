import { Module } from '@nestjs/common';
import { CodeController } from './interfaces/http/code.controller';
import { CodeExecutionService } from './application/services/code-execution.service';

@Module({
  controllers: [CodeController],
  providers: [CodeExecutionService],
  exports: [CodeExecutionService],
})
export class CodeModule {}
