import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CreateForumCommentDto } from '../../application/dtos/create-forum-comment.dto';
import { CreateForumQuestionDto } from '../../application/dtos/create-forum-question.dto';
import { ForumCommentResponseDto } from '../../application/dtos/forum-comment-response.dto';
import { ForumQuestionsListResponseDto } from '../../application/dtos/forum-questions-list-response.dto';
import { ForumQuestionResponseDto } from '../../application/dtos/forum-question-response.dto';
import { ForumQuestionStatus } from '../../application/dtos/forum-question-status.enum';
import { UpdateForumCommentDto } from '../../application/dtos/update-forum-comment.dto';
import { UpdateForumQuestionStatusDto } from '../../application/dtos/update-forum-question-status.dto';
import { UpdateForumQuestionDto } from '../../application/dtos/update-forum-question.dto';
import { ForumService } from '../../application/services/forum.service';

@ApiTags('forum')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('questions')
  @ApiOperation({ summary: 'Create forum question' })
  @ApiResponse({ status: 201, type: ForumQuestionResponseDto })
  async createQuestion(
    @Request() req: any,
    @Body() dto: CreateForumQuestionDto,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.createQuestion(dto, this.getStudentAuthor(req));
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get forum questions with search and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ForumQuestionStatus })
  @ApiResponse({ status: 200, type: ForumQuestionsListResponseDto })
  async getQuestions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: ForumQuestionStatus,
  ): Promise<ForumQuestionsListResponseDto> {
    return this.forumService.getQuestions({
      currentUserId: req.user.userId,
      page,
      limit,
      search,
      tag,
      status,
    });
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get forum question by id with answers' })
  @ApiResponse({ status: 200, type: ForumQuestionResponseDto })
  async getQuestionById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.getQuestionById(id, req.user.userId);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update forum question' })
  @ApiResponse({ status: 200, type: ForumQuestionResponseDto })
  async updateQuestion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateForumQuestionDto,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.updateQuestion(id, dto, this.getStudentAuthor(req).id);
  }

  @Patch('questions/:id/status')
  @ApiOperation({ summary: 'Update forum question status' })
  @ApiResponse({ status: 200, type: ForumQuestionResponseDto })
  async updateQuestionStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateForumQuestionStatusDto,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.updateQuestionStatus(
      id,
      dto.status,
      this.getStudentAuthor(req).id,
    );
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete forum question' })
  async deleteQuestion(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.forumService.deleteQuestion(id, this.getStudentAuthor(req).id);
  }

  @Post('questions/:id/like')
  @ApiOperation({ summary: 'Toggle like for forum question' })
  @ApiResponse({ status: 200, type: ForumQuestionResponseDto })
  async toggleQuestionLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.toggleQuestionLike(id, req.user.userId);
  }

  @Post('questions/:id/dislike')
  @ApiOperation({ summary: 'Toggle dislike for forum question' })
  @ApiResponse({ status: 200, type: ForumQuestionResponseDto })
  async toggleQuestionDislike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ForumQuestionResponseDto> {
    return this.forumService.toggleQuestionDislike(id, req.user.userId);
  }

  @Post('questions/:id/comments')
  @ApiOperation({ summary: 'Create answer or reply for forum question' })
  @ApiResponse({ status: 201, type: ForumCommentResponseDto })
  async createComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateForumCommentDto,
  ): Promise<ForumCommentResponseDto> {
    return this.forumService.createComment(id, dto, this.getStudentAuthor(req));
  }

  @Put('comments/:id')
  @ApiOperation({ summary: 'Update forum answer' })
  @ApiResponse({ status: 200, type: ForumCommentResponseDto })
  async updateComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateForumCommentDto,
  ): Promise<ForumCommentResponseDto> {
    return this.forumService.updateComment(id, dto, this.getStudentAuthor(req).id);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete forum answer' })
  async deleteComment(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.forumService.deleteComment(id, this.getStudentAuthor(req).id);
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Toggle like for forum answer' })
  @ApiResponse({ status: 200, type: ForumCommentResponseDto })
  async toggleCommentLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ForumCommentResponseDto> {
    return this.forumService.toggleCommentLike(id, req.user.userId);
  }

  @Post('comments/:id/dislike')
  @ApiOperation({ summary: 'Toggle dislike for forum answer' })
  @ApiResponse({ status: 200, type: ForumCommentResponseDto })
  async toggleCommentDislike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ForumCommentResponseDto> {
    return this.forumService.toggleCommentDislike(id, req.user.userId);
  }

  private getStudentAuthor(req: any): { id: string; name: string } {
    if (req.user?.role !== 'client' || !req.user?.profile) {
      throw new ForbiddenException('Only students can perform this action');
    }

    const profile = req.user.profile;
    const name = [profile.lastName, profile.firstName, profile.middleName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id: req.user.userId,
      name: name || 'Student',
    };
  }
}
