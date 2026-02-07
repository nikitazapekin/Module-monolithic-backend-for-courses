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
  Res,
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











   // ТЕСТОВЫЙ endpoint - полностью отключите валидацию
  @Post('test')
  async testCreateCourse(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any, // Используем any вместо DTO
  ) {
 console.log("TESYTTTTTT")
    
    // Ответ сразу, без сервиса
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }




  
  /*   @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый курс (только для админов)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Курс успешно создан',
    type: CourseResponseDto,
    }) */
/*  @Post('create')
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
  ): Promise<CourseResponseDto> {
    console.log("DTO", createCourseDto, createCourseDto.description)
    return this.courseService.createCourse(createCourseDto, user.id);
  }
 */






/* 
@Post('create')
async createCourse(
  @Body() createCourseDto: CreateCourseDto,
  @CurrentUser() user: any,
): Promise<any> {
  console.log("=== CREATE COURSE CALLED ===");
  console.log("DTO:", createCourseDto.title);
  console.log("User:", user);
  
  // Если нет пользователя (авторизация отключена), используем тестовый ID
  const adminId = user?.id || 'test_admin_id';
  console.log("Using adminId:", adminId);
  

    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
 // return this.courseService.createCourse(createCourseDto, adminId);
}

 */
/* 
 @Post('create')
  @UseGuards(JwtAuthGuard) // Включаем guard!
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: any, // Используем @Req() вместо @CurrentUser()
  ): Promise<any> {
 
    console.log("LOGIN")
    // Пользователь уже должен быть в req.user благодаря JwtAuthGuard
    const user = req.user;
//   this.logger.log("User from guard:", user);
    
    if (!user) {
      console.log("AUTH ERR")
     // throw new UnauthorizedException('User not authenticated');
    }
    
    const adminId = user.id || user.sub; // sub обычно содержит userId
   // this.logger.log("Using adminId:", adminId);
    console.log("ADMIN IDDDD" , adminId)
    // Теперь используем adminId
    return this.courseService.createCourse(createCourseDto, adminId);
  }
 */

  @Post('create')
async createCourse(
  @Body() createCourseDto: CreateCourseDto,
  @Req() req: any,
): Promise<any> {
  console.log("=== CREATE COURSE CONTROLLER ===");
  
  // 1. Получаем токен из заголовка
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader);
  
  let adminId = 'test_admin_id';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log("Token:", token.substring(0, 50) + '...');
    
    try {
      // Ручная расшифровка
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString()
      );
      
      console.log("Decoded payload:", payload);
      adminId = payload.sub; // Используем sub
      console.log("Extracted adminId:", adminId);
      
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }
  
  // 2. Также проверяем req.user от guard
  console.log("Req.user from guard:", req.user);
  if (req.user && req.user.id) {
    adminId = req.user.id;
    console.log("Using adminId from guard:", adminId);
  }
  
  console.log("Final adminId:", adminId);
  
  return this.courseService.createCourse(createCourseDto, adminId);
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
