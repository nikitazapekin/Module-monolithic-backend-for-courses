import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { LessonCommentFacade } from '../../application/facades/lesson-comment.facade';
import { CreateLessonCommentDto } from '../../application/dtos/create-lesson-comment.dto';
import {
  LessonCommentResponseDto,
  LessonCommentsWithMetaResponseDto,
} from '../../application/dtos/lesson-comment-response.dto';

@ApiTags('lesson-comments')
@Controller('lesson-comments')
@UseInterceptors(ClassSerializerInterceptor)
export class LessonCommentController {
  constructor(private readonly facade: LessonCommentFacade) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Создать комментарий к уроку' })
  @ApiResponse({ status: 201, type: LessonCommentResponseDto })
  async create(
    @Request() req: any,
    @Body() dto: CreateLessonCommentDto,
  ): Promise<LessonCommentResponseDto> {
    const userId = req.user.userId;
    return this.facade.createComment(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Обновить свой комментарий' })
  @ApiResponse({ status: 200, type: LessonCommentResponseDto })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { content: string },
  ): Promise<LessonCommentResponseDto> {
    const userId = req.user.userId;
    return this.facade.updateComment(id, dto.content, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить свой комментарий' })
  @ApiResponse({
    status: 200,
    schema: { properties: { success: { type: 'boolean' } } },
  })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user.userId;
    return this.facade.deleteComment(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('lesson-details/:lessonDetailsId')
  @ApiOperation({
    summary: 'Получить все комментарии урока с древовидной структурой',
  })
  @ApiResponse({ status: 200, type: LessonCommentsWithMetaResponseDto })
  @ApiParam({ name: 'lessonDetailsId', type: String })
  async getByLessonDetailsId(
    @Request() req: any,
    @Param('lessonDetailsId') lessonDetailsId: string,
  ): Promise<LessonCommentsWithMetaResponseDto> {
    const userId = req.user.userId;
    return this.facade.getCommentsByLessonDetailsId(lessonDetailsId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  @ApiOperation({ summary: 'Поставить/убрать лайк комментарию' })
  @ApiResponse({ status: 200, type: LessonCommentResponseDto })
  @ApiParam({ name: 'id', type: String })
  async toggleLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<LessonCommentResponseDto> {
    const userId = req.user.userId;
    return this.facade.toggleLike(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/dislike')
  @ApiOperation({ summary: 'Поставить/убрать дизлайк комментарию' })
  @ApiResponse({ status: 200, type: LessonCommentResponseDto })
  @ApiParam({ name: 'id', type: String })
  async toggleDislike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<LessonCommentResponseDto> {
    const userId = req.user.userId;
    return this.facade.toggleDislike(id, userId);
  }
}
