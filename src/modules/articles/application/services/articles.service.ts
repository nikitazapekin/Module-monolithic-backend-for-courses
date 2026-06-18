import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleCommentResponseDto } from '../dtos/article-comment-response.dto';
import { ArticleResponseDto } from '../dtos/article-response.dto';
import { ArticlesListResponseDto } from '../dtos/articles-list-response.dto';
import { CreateArticleCommentDto } from '../dtos/create-article-comment.dto';
import {
  ArticleContentBlockDto,
  CreateArticleDto,
} from '../dtos/create-article.dto';
import { UpdateArticleCommentDto } from '../dtos/update-article-comment.dto';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { ArticleCommentOrmEntity } from '../../infra/typeorm/article-comment.orm-entity';
import { ArticleOrmEntity } from '../../infra/typeorm/article.orm-entity';

type ArticleAuthor = {
  id: string;
  name: string;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleOrmEntity)
    private readonly articleRepository: Repository<ArticleOrmEntity>,
    @InjectRepository(ArticleCommentOrmEntity)
    private readonly commentRepository: Repository<ArticleCommentOrmEntity>,
  ) {}

  async createArticle(
    dto: CreateArticleDto,
    author: ArticleAuthor,
  ): Promise<ArticleResponseDto> {
    const article = this.articleRepository.create({
      id: this.generateId('article'),
      title: dto.title.trim(),
      tags: this.normalizeTags(dto.tags),
      authorId: author.id,
      authorName: author.name,
      contentBlocks: this.normalizeContentBlocks(dto.contentBlocks),
      likes: 0,
      dislikes: 0,
      likedByUsers: [],
      dislikedByUsers: [],
    });

    const created = await this.articleRepository.save(article);
    return this.toArticleDto(created, author.id, 0);
  }

  async getArticles(params: {
    currentUserId: string;
    page: number;
    limit: number;
    search?: string;
    tag?: string;
  }): Promise<ArticlesListResponseDto> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const qb = this.articleRepository.createQueryBuilder('article');

    if (params.search?.trim()) {
      const search = `%${params.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(article.title) LIKE :search OR LOWER(article.tags) LIKE :search)',
        { search },
      );
    }

    if (params.tag?.trim()) {
      qb.andWhere('LOWER(article.tags) LIKE :tag', {
        tag: `%${params.tag.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    const articleIds = items.map((item) => item.id);
    const counts = await this.getCommentCounts(articleIds);

    return {
      items: items.map((item) =>
        this.toArticleDto(item, params.currentUserId, counts.get(item.id) ?? 0),
      ),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async getArticleById(
    id: string,
    currentUserId: string,
  ): Promise<ArticleResponseDto> {
    const article = await this.requireArticle(id);
    const comments = await this.commentRepository.find({
      where: { articleId: id },
      order: { createdAt: 'ASC' },
    });

    return this.toArticleDto(
      article,
      currentUserId,
      comments.length,
      this.buildCommentTree(comments, currentUserId),
    );
  }

  async updateArticle(
    id: string,
    dto: UpdateArticleDto,
    authorId: string,
  ): Promise<ArticleResponseDto> {
    const article = await this.requireArticle(id);
    this.ensureAuthor(article.authorId, authorId, 'You can edit only your own articles');

    if (dto.title !== undefined) {
      article.title = dto.title.trim();
    }

    if (dto.tags !== undefined) {
      article.tags = this.normalizeTags(dto.tags);
    }

    if (dto.contentBlocks !== undefined) {
      article.contentBlocks = this.normalizeContentBlocks(dto.contentBlocks);
    }

    const updated = await this.articleRepository.save(article);
    const commentsCount = await this.commentRepository.count({
      where: { articleId: id },
    });

    return this.toArticleDto(updated, authorId, commentsCount);
  }

  async deleteArticle(
    id: string,
    authorId: string,
  ): Promise<{ success: boolean }> {
    const article = await this.requireArticle(id);
    this.ensureAuthor(article.authorId, authorId, 'You can delete only your own articles');
    await this.articleRepository.delete(id);
    return { success: true };
  }

  async toggleLike(
    id: string,
    userId: string,
  ): Promise<ArticleResponseDto> {
    const article = await this.requireArticle(id);
    article.likedByUsers = this.normalizeStoredArray(article.likedByUsers);
    article.dislikedByUsers = this.normalizeStoredArray(article.dislikedByUsers);

    if (article.likedByUsers.includes(userId)) {
      article.likedByUsers = article.likedByUsers.filter((item) => item !== userId);
      article.likes = Math.max(0, article.likes - 1);
    } else {
      if (article.dislikedByUsers.includes(userId)) {
        article.dislikedByUsers = article.dislikedByUsers.filter((item) => item !== userId);
        article.dislikes = Math.max(0, article.dislikes - 1);
      }

      article.likedByUsers.push(userId);
      article.likes += 1;
    }

    const updated = await this.articleRepository.save(article);
    const commentsCount = await this.commentRepository.count({
      where: { articleId: id },
    });

    return this.toArticleDto(updated, userId, commentsCount);
  }

  async toggleDislike(
    id: string,
    userId: string,
  ): Promise<ArticleResponseDto> {
    const article = await this.requireArticle(id);
    article.likedByUsers = this.normalizeStoredArray(article.likedByUsers);
    article.dislikedByUsers = this.normalizeStoredArray(article.dislikedByUsers);

    if (article.dislikedByUsers.includes(userId)) {
      article.dislikedByUsers = article.dislikedByUsers.filter((item) => item !== userId);
      article.dislikes = Math.max(0, article.dislikes - 1);
    } else {
      if (article.likedByUsers.includes(userId)) {
        article.likedByUsers = article.likedByUsers.filter((item) => item !== userId);
        article.likes = Math.max(0, article.likes - 1);
      }

      article.dislikedByUsers.push(userId);
      article.dislikes += 1;
    }

    const updated = await this.articleRepository.save(article);
    const commentsCount = await this.commentRepository.count({
      where: { articleId: id },
    });

    return this.toArticleDto(updated, userId, commentsCount);
  }

  async createComment(
    articleId: string,
    dto: CreateArticleCommentDto,
    author: ArticleAuthor,
  ): Promise<ArticleCommentResponseDto> {
    await this.requireArticle(articleId);

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parent || parent.articleId !== articleId) {
        throw new BadRequestException(
          'Parent comment does not belong to the selected article',
        );
      }
    }

    const comment = this.commentRepository.create({
      id: this.generateId('article_comment'),
      articleId,
      authorId: author.id,
      authorName: author.name,
      content: dto.content.trim(),
      parentId: dto.parentId ?? null,
      likes: 0,
      dislikes: 0,
      likedByUsers: [],
      dislikedByUsers: [],
    });

    const created = await this.commentRepository.save(comment);
    return this.toCommentDto(created, author.id);
  }

  async updateComment(
    id: string,
    dto: UpdateArticleCommentDto,
    authorId: string,
  ): Promise<ArticleCommentResponseDto> {
    const comment = await this.requireComment(id);
    this.ensureAuthor(comment.authorId, authorId, 'You can edit only your own comments');
    comment.content = dto.content.trim();

    const updated = await this.commentRepository.save(comment);
    return this.toCommentDto(updated, authorId);
  }

  async deleteComment(
    id: string,
    authorId: string,
  ): Promise<{ success: boolean }> {
    const comment = await this.requireComment(id);
    this.ensureAuthor(comment.authorId, authorId, 'You can delete only your own comments');
    await this.commentRepository.delete(id);
    return { success: true };
  }

  async toggleCommentLike(
    id: string,
    userId: string,
  ): Promise<ArticleCommentResponseDto> {
    const comment = await this.requireComment(id);
    comment.likedByUsers = this.normalizeStoredArray(comment.likedByUsers);
    comment.dislikedByUsers = this.normalizeStoredArray(comment.dislikedByUsers);

    if (comment.likedByUsers.includes(userId)) {
      comment.likedByUsers = comment.likedByUsers.filter((item) => item !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      if (comment.dislikedByUsers.includes(userId)) {
        comment.dislikedByUsers = comment.dislikedByUsers.filter((item) => item !== userId);
        comment.dislikes = Math.max(0, comment.dislikes - 1);
      }

      comment.likedByUsers.push(userId);
      comment.likes += 1;
    }

    const updated = await this.commentRepository.save(comment);
    return this.toCommentDto(updated, userId);
  }

  async toggleCommentDislike(
    id: string,
    userId: string,
  ): Promise<ArticleCommentResponseDto> {
    const comment = await this.requireComment(id);
    comment.likedByUsers = this.normalizeStoredArray(comment.likedByUsers);
    comment.dislikedByUsers = this.normalizeStoredArray(comment.dislikedByUsers);

    if (comment.dislikedByUsers.includes(userId)) {
      comment.dislikedByUsers = comment.dislikedByUsers.filter((item) => item !== userId);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    } else {
      if (comment.likedByUsers.includes(userId)) {
        comment.likedByUsers = comment.likedByUsers.filter((item) => item !== userId);
        comment.likes = Math.max(0, comment.likes - 1);
      }

      comment.dislikedByUsers.push(userId);
      comment.dislikes += 1;
    }

    const updated = await this.commentRepository.save(comment);
    return this.toCommentDto(updated, userId);
  }

  private async requireArticle(id: string): Promise<ArticleOrmEntity> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  private async requireComment(id: string): Promise<ArticleCommentOrmEntity> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  private ensureAuthor(
    entityAuthorId: string,
    currentAuthorId: string,
    message: string,
  ): void {
    if (entityAuthorId !== currentAuthorId) {
      throw new ForbiddenException(message);
    }
  }

  private async getCommentCounts(articleIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();

    if (articleIds.length === 0) {
      return counts;
    }

    const rows = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.articleId', 'articleId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.articleId IN (:...articleIds)', { articleIds })
      .groupBy('comment.articleId')
      .getRawMany<{ articleId: string; count: string }>();

    rows.forEach((row) => {
      counts.set(row.articleId, Number(row.count));
    });

    return counts;
  }

  private buildCommentTree(
    comments: ArticleCommentOrmEntity[],
    currentUserId: string,
  ): ArticleCommentResponseDto[] {
    const commentMap = new Map<string, ArticleCommentResponseDto>();
    const roots: ArticleCommentResponseDto[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, this.toCommentDto(comment, currentUserId));
    });

    comments.forEach((comment) => {
      const dto = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(dto);
      } else {
        roots.push(dto);
      }
    });

    return roots;
  }

  private toArticleDto(
    article: ArticleOrmEntity,
    currentUserId: string,
    commentsCount: number,
    comments?: ArticleCommentResponseDto[],
  ): ArticleResponseDto {
    const likedByUsers = this.normalizeStoredArray(article.likedByUsers);
    const dislikedByUsers = this.normalizeStoredArray(article.dislikedByUsers);
    const contentBlocks = (article.contentBlocks || []) as ArticleContentBlockDto[];

    return {
      id: article.id,
      title: article.title,
      tags: this.normalizeStoredArray(article.tags),
      authorId: article.authorId,
      authorName: article.authorName,
      contentBlocks,
      excerpt: this.buildExcerpt(contentBlocks),
      likes: article.likes || 0,
      dislikes: article.dislikes || 0,
      hasLiked: likedByUsers.includes(currentUserId),
      hasDisliked: dislikedByUsers.includes(currentUserId),
      commentsCount,
      comments,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  private toCommentDto(
    comment: ArticleCommentOrmEntity,
    currentUserId: string,
  ): ArticleCommentResponseDto {
    const likedByUsers = this.normalizeStoredArray(comment.likedByUsers);
    const dislikedByUsers = this.normalizeStoredArray(comment.dislikedByUsers);

    return {
      id: comment.id,
      articleId: comment.articleId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      content: comment.content,
      parentId: comment.parentId,
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      hasLiked: likedByUsers.includes(currentUserId),
      hasDisliked: dislikedByUsers.includes(currentUserId),
      replies: [],
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private normalizeTags(tags: string[]): string[] {
    const normalized = (tags || [])
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.toLowerCase());

    return Array.from(new Set(normalized));
  }

  private normalizeContentBlocks(
    contentBlocks: ArticleContentBlockDto[],
  ): ArticleContentBlockDto[] {
    const normalized = (contentBlocks || [])
      .filter((block) => block?.type && block?.data)
      .map((block) => ({
        type: String(block.type).trim(),
        data: block.data,
      }));

    if (normalized.length === 0) {
      throw new BadRequestException('Article must contain at least one content block');
    }

    return normalized;
  }

  private normalizeStoredArray(values?: string[] | null): string[] {
    if (!values) {
      return [];
    }

    return values.filter(Boolean);
  }

  private buildExcerpt(contentBlocks: ArticleContentBlockDto[]): string {
    const textBlock = contentBlocks.find((block) => block.type === 'text');
    const textValue = textBlock?.data?.text
      ? String(textBlock.data.text)
      : 'Article without text preview';

    return textValue.length > 180 ? `${textValue.slice(0, 177)}...` : textValue;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
