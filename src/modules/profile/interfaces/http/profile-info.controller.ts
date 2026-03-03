import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileInfoService } from '../../application/services/profile-info.service';
import { CourseSubscriptionService } from '../../application/services/course-subscription.service';
import { FullClientInfoDto } from '../../application/dtos/full-client-info.dto';
import { CourseSubscriptionDto } from '../../application/dtos/course-subscription.dto';
import { StudentCourseResponseDto } from '../../application/dtos/student-course-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('profile/client')
@Controller('profile/client')
export class ProfileInfoController {
  constructor(
    private readonly profileInfoService: ProfileInfoService,
    private readonly courseSubscriptionService: CourseSubscriptionService,
  ) {}

  @Get('auditory/:auditoryId/full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение полной информации о клиенте по auditoryId с использованием JOIN' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Полная информация о клиенте получена',
    type: FullClientInfoDto,
  })
  @ApiBearerAuth()
  async getFullClientInfoByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<FullClientInfoDto> {
    return this.profileInfoService.getFullClientInfoByAuditoryId(auditoryId);
  }

  @Get(':clientId/full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение полной информации о клиенте по clientId с использованием JOIN' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Полная информация о клиенте получена',
    type: FullClientInfoDto,
  })
  @ApiBearerAuth()
  async getFullClientInfoByClientId(@Param('clientId') clientId: string): Promise<FullClientInfoDto> {
    return this.profileInfoService.getFullClientInfoByClientId(clientId);
  }

  @Post(':clientId/courses/:courseId/subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Подписка студента на курс' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Подписка успешно оформлена',
    type: CourseSubscriptionDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Клиент уже подписан на этот курс',
  })
  @ApiBearerAuth()
  async subscribeToCourse(
    @Param('clientId') clientId: string,
    @Param('courseId') courseId: string,
  ): Promise<CourseSubscriptionDto> {
    return this.courseSubscriptionService.subscribe(clientId, courseId);
  }

  @Delete(':clientId/courses/:courseId/unsubscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отписка студента от курса' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Подписка успешно удалена',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Подписка не найдена',
  })
  @ApiBearerAuth()
  async unsubscribeFromCourse(
    @Param('clientId') clientId: string,
    @Param('courseId') courseId: string,
  ): Promise<void> {
    return this.courseSubscriptionService.unsubscribe(clientId, courseId);
  }

  @Get(':clientId/courses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение списка курсов студента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов студента получен',
    type: [StudentCourseResponseDto],
  })
  @ApiBearerAuth()
  async getCoursesByClientId(@Param('clientId') clientId: string): Promise<StudentCourseResponseDto[]> {
    return this.courseSubscriptionService.getCoursesByClientId(clientId);
  }
}
