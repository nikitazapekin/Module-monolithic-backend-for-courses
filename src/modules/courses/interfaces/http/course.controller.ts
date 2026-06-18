import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseService } from '../../application/services/course.service';
import { CreateCourseDto } from '../../application/dtos/create-course.dto';
import { UpdateCourseDto } from '../../application/dtos/update-course.dto';
import { CourseResponseDto } from '../../application/dtos/course-response.dto';
import { CourseStatsResponseDto } from '../../application/dtos/course-stats-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/entities/auditory.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CourseStatus } from '../../domain/entities/course.entity';
import { AuditoryOrmEntity } from '@modules/auth/infra/typeorm/auditory.orm-entity';
import { AdminOrmEntity } from '@modules/auth/infra/typeorm/admin.orm-entity';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepository: Repository<AdminOrmEntity>,
  ) {}

  @Post('test')
  async testCreateCourse(@Req() req: Request, @Body() body: any) {
  
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: any,
  ): Promise<CourseResponseDto> {
    console.log('=== CREATE COURSE CONTROLLER ===');
 
    const auditoryId = this.extractAuditoryIdFromToken(req);
    console.log('Extracted auditoryId:', auditoryId);

    if (!auditoryId) {
      throw new UnauthorizedException('Invalid token or user not found');
    } 
    const admin = await this.findAdminByAuditoryId(auditoryId);
    console.log('Found admin:', admin);

    if (!admin) {
      throw new UnauthorizedException('Admin not found for this user');
    }

   
    const auditory = await this.auditoryRepository.findOne({
      where: { id: auditoryId },
    });

    if (!auditory || auditory.role !== 'admin') {
      throw new UnauthorizedException('Only admins can create courses');
    }

    console.log('Using adminId for course:', admin.id);
 
    return this.courseService.createCourse(createCourseDto, admin.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список курсов' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов',
    type: [CourseResponseDto],
  })
  async getCourses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: CourseStatus,
    @Query('search') search?: string,
  ) {
    return this.courseService.getCourses({
      page,
      limit,
      status,
      search,
    });
  }

  @Get('published')
  @ApiOperation({ summary: 'Получить опубликованные курсы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список опубликованных курсов',
    type: [CourseResponseDto],
  })
  async getPublishedCourses(): Promise<CourseResponseDto[]> {
    return this.courseService.getPublishedCourses();
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Получить курсы по тегу' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов по тегу',
    type: [CourseResponseDto],
  })
  async getCoursesByTag(
    @Param('tag') tag: string,
  ): Promise<CourseResponseDto[]> {
    return this.courseService.getCoursesByTag(tag);
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить курсы текущего администратора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Курсы администратора',
    type: [CourseResponseDto],
  })
  async getMyCourses(@CurrentUser() user: any): Promise<CourseResponseDto[]> {
 
    const auditoryId = user.id || user.sub;
    const admin = await this.findAdminByAuditoryId(auditoryId);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return this.courseService.getAdminCourses(admin.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Получить статистику курса' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статистика курса',
    type: CourseStatsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Курс не найден',
  })
  async getCourseStats(
    @Param('id') id: string,
  ): Promise<CourseStatsResponseDto> {
    return this.courseService.getCourseStats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить курс по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Курс найден',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Курс не найден',
  })
  async getCourse(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.courseService.getCourseById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить курс (только автор)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Курс обновлен',
    type: CourseResponseDto,
  })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: any,
  ): Promise<CourseResponseDto> {
    const auditoryId = this.extractAuditoryIdFromToken(req);
    const admin = await this.findAdminByAuditoryId(auditoryId);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return this.courseService.updateCourse(id, updateCourseDto, admin.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить курс (только автор)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Курс удален',
  })
  async deleteCourse(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    const auditoryId = this.extractAuditoryIdFromToken(req);
    const admin = await this.findAdminByAuditoryId(auditoryId);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return this.courseService.deleteCourse(id, admin.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Опубликовать курс (только автор)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Курс опубликован',
    type: CourseResponseDto,
  })
  async publishCourse(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<CourseResponseDto> {
    const auditoryId = this.extractAuditoryIdFromToken(req);
    const admin = await this.findAdminByAuditoryId(auditoryId);

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return this.courseService.publishCourse(id, admin.id);
  }

 
  private extractAuditoryIdFromToken(req: any): string {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required');
    }

    const token = authHeader.substring(7);

    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString(),
      );

      return payload.sub; 
    } catch (error) {
      console.error('Token decode error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async findAdminByAuditoryId(
    auditoryId: string,
  ): Promise<AdminOrmEntity | null> {
 
    const admin = await this.adminRepository.findOne({
      where: { auditoryId: auditoryId },
    });

    return admin;
  }
}
