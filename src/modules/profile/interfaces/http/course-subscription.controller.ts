import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CourseSubscriptionService } from '../../application/services/course-subscription.service';
import { CourseSubscriptionDto } from '../../application/dtos/course-subscription.dto';
import { StudentCourseResponseDto } from '../../application/dtos/student-course-response.dto';
import { AuthorizedCourseResponseDto } from '../../application/dtos/authorized-course-response.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('course-subscriptions')
@Controller('course-subscriptions')
export class CourseSubscriptionController {
  constructor(
    private readonly courseSubscriptionService: CourseSubscriptionService,
  ) {}

  @Post('subscribe/:courseId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Подписаться на курс' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Успешная подписка',
    type: CourseSubscriptionDto,
  })
  @ApiBearerAuth()
  async subscribe(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
  ): Promise<CourseSubscriptionDto> {
    const auditoryId = this.extractAuditoryId(user);
    return this.courseSubscriptionService.subscribe(auditoryId, courseId);
  }

  @Delete('unsubscribe/:courseId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отписаться от курса' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Успешная отписка',
  })
  @ApiBearerAuth()
  async unsubscribe(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    const auditoryId = this.extractAuditoryId(user);
    return this.courseSubscriptionService.unsubscribe(auditoryId, courseId);
  }

  @Get('check/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Проверить подписку на курс' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус подписки на курс',
  })
  @ApiBearerAuth()
  async checkSubscription(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
  ): Promise<{ subscribed: boolean }> {
    const auditoryId = this.extractAuditoryId(user);
    const subscribed = await this.courseSubscriptionService.isSubscribed(
      auditoryId,
      courseId,
    );

    return { subscribed };
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить курсы текущего пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов',
    type: [StudentCourseResponseDto],
  })
  @ApiBearerAuth()
  async getMyCourses(@CurrentUser() user: any): Promise<StudentCourseResponseDto[]> {
    const auditoryId = this.extractAuditoryId(user);
    return this.courseSubscriptionService.getCoursesByAuditoryId(auditoryId);
  }

  @Get('allcourses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Получить все опубликованные курсы с отметкой подписки для текущего пользователя',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список всех опубликованных курсов с полем isSubscribed',
    type: [AuthorizedCourseResponseDto],
  })
  @ApiBearerAuth()
  async getAllCourses(
    @CurrentUser() user: any,
  ): Promise<AuthorizedCourseResponseDto[]> {
    const auditoryId = this.extractAuditoryId(user);
    return this.courseSubscriptionService.getAllCoursesForAuditory(auditoryId);
  }

  @Get('mycourses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить только курсы, на которые подписан текущий пользователь',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов текущего пользователя',
    type: [StudentCourseResponseDto],
  })
  @ApiBearerAuth()
  async getMySubscribedCourses(
    @CurrentUser() user: any,
  ): Promise<StudentCourseResponseDto[]> {
    const auditoryId = this.extractAuditoryId(user);
    return this.courseSubscriptionService.getCoursesByAuditoryId(auditoryId);
  }

  @Get('course/:courseId/students')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить студентов курса' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список студентов курса',
  })
  @ApiBearerAuth()
  async getCourseStudents(@Param('courseId') courseId: string): Promise<any[]> {
    return this.courseSubscriptionService.getStudentsByCourseId(courseId);
  }

  private extractAuditoryId(user: any): string {
    const auditoryId =
      user?.userId ||
      user?.id ||
      user?.sub ||
      user?.profile?.auditoryId;

    if (!auditoryId) {
      throw new UnauthorizedException('Unable to resolve auditoryId from token');
    }

    return auditoryId;
  }
}
