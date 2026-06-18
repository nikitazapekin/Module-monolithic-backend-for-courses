import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CodeExecutionWithTimeService } from '../../application/services/code-execution-with-time.service';
import { ExecuteCodeWithTimeDto, ExecuteCodeWithTimeResult } from '../../application/dtos/execute-code-with-time.dto';

@ApiTags('code-with-time')
@Controller('code-with-time')
export class CodeWithTimeController {
  constructor(private readonly codeExecutionWithTimeService: CodeExecutionWithTimeService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Выполнить произвольный код с измерением времени' })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        output: { type: 'string' },
        error: {
          type: 'string',
          description: 'Compile or runtime error (stderr)',
        },
        executionTimeMs: { type: 'number', description: 'Execution time in milliseconds' },
      },
    },
  })
  async execute(
    @Body() dto: ExecuteCodeWithTimeDto,
  ): Promise<ExecuteCodeWithTimeResult> {
    return this.codeExecutionWithTimeService.executeCodeWithTime(dto.language, dto.code);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Проверка доступности языков и временной директории',
  })
  async health() {
    return this.codeExecutionWithTimeService.getHealth();
  }
}
