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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CourseService } from '../../application/services/course.service';
import { CreateCourseDto } from '../../application/dtos/create-course.dto';
import { UpdateCourseDto } from '../../application/dtos/update-course.dto';
import { CourseResponseDto } from '../../application/dtos/course-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/entities/auditory.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CourseStatus } from '../../domain/entities/course.entity';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый курс (только для админов)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Курс успешно создан',
    type: CourseResponseDto,
  })
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
  ): Promise<CourseResponseDto> {
    return this.courseService.createCourse(createCourseDto, user.id);
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
  async getCoursesByTag(@Param('tag') tag: string): Promise<CourseResponseDto[]> {
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
    return this.courseService.getAdminCourses(user.id);
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
    @CurrentUser() user: any,
  ): Promise<CourseResponseDto> {
    return this.courseService.updateCourse(id, updateCourseDto, user.id);
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
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.courseService.deleteCourse(id, user.id);
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
    @CurrentUser() user: any,
  ): Promise<CourseResponseDto> {
    return this.courseService.publishCourse(id, user.id);
  }
}
