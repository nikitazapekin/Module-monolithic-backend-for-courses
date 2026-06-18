import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
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
import { ArticleCommentResponseDto } from '../../application/dtos/article-comment-response.dto';
import { ArticleResponseDto } from '../../application/dtos/article-response.dto';
import { ArticlesListResponseDto } from '../../application/dtos/articles-list-response.dto';
import { CreateArticleCommentDto } from '../../application/dtos/create-article-comment.dto';
import { CreateArticleDto } from '../../application/dtos/create-article.dto';
import { UpdateArticleCommentDto } from '../../application/dtos/update-article-comment.dto';
import { UpdateArticleDto } from '../../application/dtos/update-article.dto';
import { ArticlesService } from '../../application/services/articles.service';

@ApiTags('articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @ApiResponse({ status: 201, type: ArticleResponseDto })
  async createArticle(
    @Request() req: any,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.createArticle(dto, this.getStudentAuthor(req));
  }

  @Get()
  @ApiOperation({ summary: 'Get articles with search and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiResponse({ status: 200, type: ArticlesListResponseDto })
  async getArticles(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ): Promise<ArticlesListResponseDto> {
    return this.articlesService.getArticles({
      currentUserId: req.user.userId,
      page,
      limit,
      search,
      tag,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiResponse({ status: 200, type: ArticleResponseDto })
  async getArticleById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.getArticleById(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, type: ArticleResponseDto })
  async updateArticle(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.updateArticle(id, dto, this.getStudentAuthor(req).id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  async deleteArticle(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.articlesService.deleteArticle(id, this.getStudentAuthor(req).id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle article like' })
  @ApiResponse({ status: 200, type: ArticleResponseDto })
  async toggleLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.toggleLike(id, req.user.userId);
  }

  @Post(':id/dislike')
  @ApiOperation({ summary: 'Toggle article dislike' })
  @ApiResponse({ status: 200, type: ArticleResponseDto })
  async toggleDislike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.toggleDislike(id, req.user.userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Create article comment or reply' })
  @ApiResponse({ status: 201, type: ArticleCommentResponseDto })
  async createComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateArticleCommentDto,
  ): Promise<ArticleCommentResponseDto> {
    return this.articlesService.createComment(id, dto, this.getStudentAuthor(req));
  }

  @Put('comments/:id')
  @ApiOperation({ summary: 'Update article comment' })
  @ApiResponse({ status: 200, type: ArticleCommentResponseDto })
  async updateComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateArticleCommentDto,
  ): Promise<ArticleCommentResponseDto> {
    return this.articlesService.updateComment(id, dto, this.getStudentAuthor(req).id);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete article comment' })
  async deleteComment(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.articlesService.deleteComment(id, this.getStudentAuthor(req).id);
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Toggle like for article comment' })
  @ApiResponse({ status: 200, type: ArticleCommentResponseDto })
  async toggleCommentLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ArticleCommentResponseDto> {
    return this.articlesService.toggleCommentLike(id, req.user.userId);
  }

  @Post('comments/:id/dislike')
  @ApiOperation({ summary: 'Toggle dislike for article comment' })
  @ApiResponse({ status: 200, type: ArticleCommentResponseDto })
  async toggleCommentDislike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ArticleCommentResponseDto> {
    return this.articlesService.toggleCommentDislike(id, req.user.userId);
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
