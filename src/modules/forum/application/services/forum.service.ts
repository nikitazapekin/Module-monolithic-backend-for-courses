import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateForumCommentDto } from '../dtos/create-forum-comment.dto';
import { CreateForumQuestionDto } from '../dtos/create-forum-question.dto';
import { ForumCommentResponseDto } from '../dtos/forum-comment-response.dto';
import { ForumQuestionResponseDto } from '../dtos/forum-question-response.dto';
import { ForumQuestionsListResponseDto } from '../dtos/forum-questions-list-response.dto';
import { ForumQuestionStatus } from '../dtos/forum-question-status.enum';
import { UpdateForumCommentDto } from '../dtos/update-forum-comment.dto';
import { UpdateForumQuestionDto } from '../dtos/update-forum-question.dto';
import { ForumCommentOrmEntity } from '../../infra/typeorm/forum-comment.orm-entity';
import { ForumQuestionOrmEntity } from '../../infra/typeorm/forum-question.orm-entity';

type ForumAuthor = {
  id: string;
  name: string;
};

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumQuestionOrmEntity)
    private readonly questionRepository: Repository<ForumQuestionOrmEntity>,
    @InjectRepository(ForumCommentOrmEntity)
    private readonly commentRepository: Repository<ForumCommentOrmEntity>,
  ) {}

  async createQuestion(
    dto: CreateForumQuestionDto,
    author: ForumAuthor,
  ): Promise<ForumQuestionResponseDto> {
    const question = this.questionRepository.create({
      id: this.generateId('forum_question'),
      title: dto.title.trim(),
      content: dto.content.trim(),
      tags: this.normalizeTags(dto.tags),
      status: ForumQuestionStatus.OPEN,
      authorId: author.id,
      authorName: author.name,
      likes: 0,
      dislikes: 0,
      likedByUsers: [],
      dislikedByUsers: [],
    });

    const created = await this.questionRepository.save(question);
    return this.toQuestionDto(created, author.id, 0);
  }

  async getQuestions(params: {
    currentUserId: string;
    page: number;
    limit: number;
    search?: string;
    tag?: string;
    status?: ForumQuestionStatus;
  }): Promise<ForumQuestionsListResponseDto> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const qb = this.questionRepository.createQueryBuilder('question');

    if (params.search?.trim()) {
      const search = `%${params.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(question.title) LIKE :search OR LOWER(question.tags) LIKE :search)',
        { search },
      );
    }

    if (params.tag?.trim()) {
      qb.andWhere('LOWER(question.tags) LIKE :tag', {
        tag: `%${params.tag.trim().toLowerCase()}%`,
      });
    }

    if (params.status) {
      qb.andWhere('question.status = :status', { status: params.status });
    }

    qb.orderBy('question.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    const questionIds = items.map((item) => item.id);
    const counts = await this.getCommentCounts(questionIds);

    return {
      items: items.map((item) =>
        this.toQuestionDto(item, params.currentUserId, counts.get(item.id) ?? 0),
      ),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async getQuestionById(
    id: string,
    currentUserId: string,
  ): Promise<ForumQuestionResponseDto> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const comments = await this.commentRepository.find({
      where: { questionId: id },
      order: { createdAt: 'ASC' },
    });

    return this.toQuestionDto(
      question,
      currentUserId,
      comments.length,
      this.buildCommentTree(comments, currentUserId),
    );
  }

  async updateQuestion(
    id: string,
    dto: UpdateForumQuestionDto,
    authorId: string,
  ): Promise<ForumQuestionResponseDto> {
    const question = await this.requireQuestion(id);
    this.ensureAuthor(question.authorId, authorId, 'You can edit only your own questions');

    if (dto.title !== undefined) {
      question.title = dto.title.trim();
    }

    if (dto.content !== undefined) {
      question.content = dto.content.trim();
    }

    if (dto.tags !== undefined) {
      question.tags = this.normalizeTags(dto.tags);
    }

    const updated = await this.questionRepository.save(question);
    const commentsCount = await this.commentRepository.count({
      where: { questionId: id },
    });

    return this.toQuestionDto(updated, authorId, commentsCount);
  }

  async updateQuestionStatus(
    id: string,
    status: ForumQuestionStatus,
    authorId: string,
  ): Promise<ForumQuestionResponseDto> {
    const question = await this.requireQuestion(id);
    this.ensureAuthor(question.authorId, authorId, 'Only the author can change question status');
    question.status = status;

    const updated = await this.questionRepository.save(question);
    const commentsCount = await this.commentRepository.count({
      where: { questionId: id },
    });

    return this.toQuestionDto(updated, authorId, commentsCount);
  }

  async deleteQuestion(
    id: string,
    authorId: string,
  ): Promise<{ success: boolean }> {
    const question = await this.requireQuestion(id);
    this.ensureAuthor(question.authorId, authorId, 'You can delete only your own questions');
    await this.questionRepository.delete(id);
    return { success: true };
  }

  async toggleQuestionLike(
    id: string,
    userId: string,
  ): Promise<ForumQuestionResponseDto> {
    const question = await this.requireQuestion(id);
    question.likedByUsers = this.normalizeStoredArray(question.likedByUsers);
    question.dislikedByUsers = this.normalizeStoredArray(question.dislikedByUsers);

    if (question.likedByUsers.includes(userId)) {
      question.likedByUsers = question.likedByUsers.filter((item) => item !== userId);
      question.likes = Math.max(0, question.likes - 1);
    } else {
      if (question.dislikedByUsers.includes(userId)) {
        question.dislikedByUsers = question.dislikedByUsers.filter((item) => item !== userId);
        question.dislikes = Math.max(0, question.dislikes - 1);
      }

      question.likedByUsers.push(userId);
      question.likes += 1;
    }

    const updated = await this.questionRepository.save(question);
    const commentsCount = await this.commentRepository.count({
      where: { questionId: id },
    });

    return this.toQuestionDto(updated, userId, commentsCount);
  }

  async toggleQuestionDislike(
    id: string,
    userId: string,
  ): Promise<ForumQuestionResponseDto> {
    const question = await this.requireQuestion(id);
    question.likedByUsers = this.normalizeStoredArray(question.likedByUsers);
    question.dislikedByUsers = this.normalizeStoredArray(question.dislikedByUsers);

    if (question.dislikedByUsers.includes(userId)) {
      question.dislikedByUsers = question.dislikedByUsers.filter((item) => item !== userId);
      question.dislikes = Math.max(0, question.dislikes - 1);
    } else {
      if (question.likedByUsers.includes(userId)) {
        question.likedByUsers = question.likedByUsers.filter((item) => item !== userId);
        question.likes = Math.max(0, question.likes - 1);
      }

      question.dislikedByUsers.push(userId);
      question.dislikes += 1;
    }

    const updated = await this.questionRepository.save(question);
    const commentsCount = await this.commentRepository.count({
      where: { questionId: id },
    });

    return this.toQuestionDto(updated, userId, commentsCount);
  }

  async createComment(
    questionId: string,
    dto: CreateForumCommentDto,
    author: ForumAuthor,
  ): Promise<ForumCommentResponseDto> {
    await this.requireQuestion(questionId);

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parent || parent.questionId !== questionId) {
        throw new BadRequestException(
          'Parent comment does not belong to the selected question',
        );
      }
    }

    const comment = this.commentRepository.create({
      id: this.generateId('forum_comment'),
      questionId,
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
    dto: UpdateForumCommentDto,
    authorId: string,
  ): Promise<ForumCommentResponseDto> {
    const comment = await this.requireComment(id);
    this.ensureAuthor(comment.authorId, authorId, 'You can edit only your own answers');
    comment.content = dto.content.trim();

    const updated = await this.commentRepository.save(comment);
    return this.toCommentDto(updated, authorId);
  }

  async deleteComment(
    id: string,
    authorId: string,
  ): Promise<{ success: boolean }> {
    const comment = await this.requireComment(id);
    this.ensureAuthor(comment.authorId, authorId, 'You can delete only your own answers');
    await this.commentRepository.delete(id);
    return { success: true };
  }

  async toggleCommentLike(
    id: string,
    userId: string,
  ): Promise<ForumCommentResponseDto> {
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
  ): Promise<ForumCommentResponseDto> {
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

  private async requireQuestion(id: string): Promise<ForumQuestionOrmEntity> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  private async requireComment(id: string): Promise<ForumCommentOrmEntity> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Answer not found');
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

  private async getCommentCounts(questionIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();

    if (questionIds.length === 0) {
      return counts;
    }

    const rows = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.questionId', 'questionId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.questionId IN (:...questionIds)', { questionIds })
      .groupBy('comment.questionId')
      .getRawMany<{ questionId: string; count: string }>();

    rows.forEach((row) => {
      counts.set(row.questionId, Number(row.count));
    });

    return counts;
  }

  private buildCommentTree(
    comments: ForumCommentOrmEntity[],
    currentUserId: string,
  ): ForumCommentResponseDto[] {
    const commentMap = new Map<string, ForumCommentResponseDto>();
    const roots: ForumCommentResponseDto[] = [];

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

  private toQuestionDto(
    question: ForumQuestionOrmEntity,
    currentUserId: string,
    commentsCount: number,
    comments?: ForumCommentResponseDto[],
  ): ForumQuestionResponseDto {
    const likedByUsers = this.normalizeStoredArray(question.likedByUsers);
    const dislikedByUsers = this.normalizeStoredArray(question.dislikedByUsers);

    return {
      id: question.id,
      title: question.title,
      content: question.content,
      tags: this.normalizeStoredArray(question.tags),
      status: question.status,
      authorId: question.authorId,
      authorName: question.authorName,
      likes: question.likes || 0,
      dislikes: question.dislikes || 0,
      hasLiked: likedByUsers.includes(currentUserId),
      hasDisliked: dislikedByUsers.includes(currentUserId),
      commentsCount,
      comments,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  private toCommentDto(
    comment: ForumCommentOrmEntity,
    currentUserId: string,
  ): ForumCommentResponseDto {
    const likedByUsers = this.normalizeStoredArray(comment.likedByUsers);
    const dislikedByUsers = this.normalizeStoredArray(comment.dislikedByUsers);

    return {
      id: comment.id,
      questionId: comment.questionId,
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

  private normalizeStoredArray(values?: string[] | null): string[] {
    if (!values) {
      return [];
    }

    return values.filter(Boolean);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
