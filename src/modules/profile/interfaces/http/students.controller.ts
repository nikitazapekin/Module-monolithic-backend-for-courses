import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from '../../application/services/students.service';
import { StudentResponseDto } from '../../application/dtos/student-response.dto';
import { StudentsListResponseDto } from '../../application/dtos/students-list-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение списка студентов с поиском и пагинацией' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список студентов получен',
    type: StudentsListResponseDto,
  })
  @ApiBearerAuth()
  async getStudents(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<StudentsListResponseDto> {
    return this.studentsService.getStudents({
      page: page || 1,
      limit: limit || 10,
      search: search || '',
    });
  }

  @Get('auditory/:auditoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение студента по auditoryId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Студент получен',
    type: StudentResponseDto,
  })
  @ApiBearerAuth()
  async getStudentByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<StudentResponseDto> {
    const student = await this.studentsService.getStudents({ page: 1, limit: 100, search: '' });
    const found = student.students.find(s => s.auditoryId === auditoryId);
    
    if (!found) {
      return null as any;
    }
    
    return found;
  }
}
