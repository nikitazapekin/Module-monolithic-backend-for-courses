import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentResultService } from '../../application/services/student-result.service';
import { CreateStudentResultDto } from '../../application/dtos/create-student-result.dto';
import { UpdateStudentResultDto } from '../../application/dtos/update-student-result.dto';
import { StudentResultResponseDto } from '../../application/dtos/student-result-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';

@ApiTags('profile/student-results')
@Controller('profile/student-results')
export class StudentResultController {
  constructor(
    private readonly studentResultService: StudentResultService,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Создание результата прохождения урока',
    description: 'Для создания результата необходимо передать auditoryId (ID аккаунта). Контроллер автоматически найдет clientId по auditoryId.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Результат успешно создан',
    type: StudentResultResponseDto,
  })
  @ApiBearerAuth()
  async create(
    @Body() createStudentResultDto: CreateStudentResultDto,
  ): Promise<StudentResultResponseDto> {
    // Получаем clientId по auditoryId из DTO
    const client = await this.clientRepository.findOne({
      where: { auditoryId: createStudentResultDto.auditoryId },
    });

    if (!client) {
      throw new NotFoundException(`Client with auditoryId ${createStudentResultDto.auditoryId} not found`);
    }

    // Создаем объект с правильным clientId (первичный ключ clients)
    const dtoWithClientId = {
      clientId: client.id,
      lessonId: createStudentResultDto.lessonId,
      countOfStars: createStudentResultDto.countOfStars,
    };

    const result = await this.studentResultService.create(dtoWithClientId);
    return this.mapToResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение результата по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Результат найден',
    type: StudentResultResponseDto,
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<StudentResultResponseDto> {
    const result = await this.studentResultService.findById(id);
    return this.mapToResponse(result);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получение всех результатов студента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Результаты найдены',
    type: [StudentResultResponseDto],
  })
  @ApiBearerAuth()
  async findByClientId(@Param('clientId') clientId: string): Promise<StudentResultResponseDto[]> {
    const results = await this.studentResultService.findByClientId(clientId);
    return results.map(result => this.mapToResponse(result));
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Получение всех результатов по уроку' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Результаты найдены',
    type: [StudentResultResponseDto],
  })
  @ApiBearerAuth()
  async findByLessonId(@Param('lessonId') lessonId: string): Promise<StudentResultResponseDto[]> {
    const results = await this.studentResultService.findByLessonId(lessonId);
    return results.map(result => this.mapToResponse(result));
  }

  @Get('client/:clientId/lesson/:lessonId/best')
  @ApiOperation({ summary: 'Получение лучшего результата студента по уроку (с наибольшим количеством звезд)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Лучший результат найден',
    type: StudentResultResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Результаты не найдены',
  })
  @ApiBearerAuth()
  async getBestResult(
    @Param('clientId') clientId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<StudentResultResponseDto | null> {
    const result = await this.studentResultService.getBestResultByClientAndLesson(clientId, lessonId);
    return result ? this.mapToResponse(result) : null;
  }

  @Post('client/:clientId/course-progress')
  @ApiOperation({ 
    summary: 'Получение лучших результатов студента по всем урокам курса',
    description: 'Возвращает лучшие результаты (с наибольшим количеством звезд) для каждого урока конкретного курса. Если для урока нет результатов, возвращается null.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Лучшие результаты получены',
    schema: {
      example: [
        { lessonId: 'lesson_1', bestResult: { id: '1', clientId: 'client_1', lessonId: 'lesson_1', countOfStars: 5 } },
        { lessonId: 'lesson_2', bestResult: null },
      ],
    },
  })
  @ApiBearerAuth()
  async getBestResultsForCourse(
    @Param('clientId') clientId: string,
    @Body('courseId') courseId: string,
  ): Promise<{ lessonId: string; bestResult: StudentResultResponseDto | null }[]> {
    const results = await this.studentResultService.getBestResultsForCourse(clientId, courseId);
    return results.map(({ lessonId, bestResult }) => ({
      lessonId,
      bestResult: bestResult ? this.mapToResponse(bestResult) : null,
    }));
  }

  @Get('client/:clientId/progress')
  @ApiOperation({ summary: 'Получение прогресса студента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Прогресс получен',
  })
  @ApiBearerAuth()
  async getStudentProgress(@Param('clientId') clientId: string): Promise<{
    totalLessons: number;
    averageStars: number;
    results: StudentResultResponseDto[];
  }> {
    const progress = await this.studentResultService.getStudentProgress(clientId);
    return {
      ...progress,
      results: progress.results.map(result => this.mapToResponse(result)),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление результата по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Результат успешно обновлен',
    type: StudentResultResponseDto,
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateStudentResultDto: UpdateStudentResultDto,
  ): Promise<StudentResultResponseDto> {
    const result = await this.studentResultService.update(id, updateStudentResultDto);
    return this.mapToResponse(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление результата по ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Результат успешно удален',
  })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this.studentResultService.delete(id);
  }

  @Delete('client/:clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление всех результатов студента' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Результаты успешно удалены',
  })
  @ApiBearerAuth()
  async deleteByClientId(@Param('clientId') clientId: string): Promise<void> {
    await this.studentResultService.deleteByClientId(clientId);
  }

  private mapToResponse(result: any): StudentResultResponseDto {
    const response = new StudentResultResponseDto();
    response.id = result.id;
    response.clientId = result.clientId;
    response.lessonId = result.lessonId;
    response.countOfStars = result.countOfStars;
    response.completedAt = result.completedAt;
    response.createdAt = result.createdAt;
    response.updatedAt = result.updatedAt;
    return response;
  }
}
