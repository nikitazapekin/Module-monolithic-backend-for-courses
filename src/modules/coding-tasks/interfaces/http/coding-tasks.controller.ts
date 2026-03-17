import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodingTasksService } from '../../application/services/coding-tasks.service';
import { CreateCodeTaskDto } from '../../application/dtos/create-code-task.dto';
import { UpdateCodeTaskDto } from '../../application/dtos/update-code-task.dto';
import { SubmitSolutionDto } from '../../application/dtos/submit-solution.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';
import { AuditoryOrmEntity } from '@modules/auth/infra/typeorm/auditory.orm-entity';
import { ClientOrmEntity } from '@modules/auth/infra/typeorm/client.orm-entity';

@ApiTags('coding-tasks')
@Controller('coding-tasks')
export class CodingTasksController {
  constructor(
    private readonly codingTasksService: CodingTasksService,
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepo: Repository<AdminOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepo: Repository<AuditoryOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepo: Repository<ClientOrmEntity>,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать задачу (только админ)' })
  async createTask(@Body() dto: CreateCodeTaskDto, @Req() req: any) {
    const auditoryId = this.extractAuditoryId(req);
    const admin = await this.findAdmin(auditoryId);
    const authorName = `${admin.firstName} ${admin.lastName}`;
    return this.codingTasksService.createTask(dto, admin.id, authorName);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить задачу (только автор)' })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateCodeTaskDto,
    @Req() req: any,
  ) {
    const auditoryId = this.extractAuditoryId(req);
    const admin = await this.findAdmin(auditoryId);
    return this.codingTasksService.updateTask(id, dto, admin.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить задачу (только автор)' })
  async deleteTask(@Param('id') id: string, @Req() req: any) {
    const auditoryId = this.extractAuditoryId(req);
    const admin = await this.findAdmin(auditoryId);
    return this.codingTasksService.deleteTask(id, admin.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все задачи' })
  async getAllTasks() {
    return this.codingTasksService.getAllTasks();
  }

  @Get('difficulty/:difficulty')
  @ApiOperation({ summary: 'Получить задачи по сложности' })
  async getByDifficulty(@Param('difficulty') difficulty: string) {
    return this.codingTasksService.getTasksByDifficulty(difficulty);
  }

  @Get('student-level')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить уровень студента' })
  async getStudentLevel(@Req() req: any) {
    const auditoryId = this.extractAuditoryId(req);
    const client = await this.findClient(auditoryId);
    return this.codingTasksService.getStudentLevel(client.id);
  }

  @Get('student-level/:clientId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Получить уровень студента по clientId (для просмотра прогресса других пользователей)',
  })
  async getStudentLevelByClientId(@Param('clientId') clientId: string) {
    return this.codingTasksService.getStudentLevel(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по ID' })
  async getTask(@Param('id') id: string) {
    return this.codingTasksService.getTaskById(id);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отправить решение задачи' })
  async submitSolution(@Body() dto: SubmitSolutionDto, @Req() req: any) {
    const auditoryId = this.extractAuditoryId(req);
    const client = await this.findClient(auditoryId);
    return this.codingTasksService.submitSolution(
      client.id,
      dto.taskId,
      dto.code,
      dto.language,
    );
  }

  private extractAuditoryId(req: any): string {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Token is required');

    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async findAdmin(auditoryId: string): Promise<AdminOrmEntity> {
    const admin = await this.adminRepo.findOne({ where: { auditoryId } });
    if (!admin) throw new UnauthorizedException('Admin not found');
    return admin;
  }

  private async findClient(auditoryId: string): Promise<ClientOrmEntity> {
    const client = await this.clientRepo.findOne({ where: { auditoryId } });
    if (!client) throw new UnauthorizedException('Client not found');
    return client;
  }
}
