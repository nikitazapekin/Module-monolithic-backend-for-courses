import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CodeExecutionService } from '../../application/services/code-execution.service';
import { ExecuteCodeDto } from '../../application/dtos/execute-code.dto';

@ApiTags('code')
@Controller('code')
export class CodeController {
  constructor(private readonly codeExecutionService: CodeExecutionService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Выполнить произвольный код' })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        output: { type: 'string' },
      },
    },
  })
  async execute(@Body() dto: ExecuteCodeDto): Promise<{ output: string }> {
    const output = await this.codeExecutionService.executeCode(dto.language, dto.code);
    return { output };
  }

  @Get('health')
  @ApiOperation({ summary: 'Проверка доступности языков и временной директории' })
  async health() {
    return this.codeExecutionService.getHealth();
  }
}

