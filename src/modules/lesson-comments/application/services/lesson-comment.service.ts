import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonCommentRepository } from '../../domain/interfaces/lesson-comment.repository.interface';
import { LessonComment } from '../../domain/entities/lesson-comment.entity';
import { CreateLessonCommentDto } from '../dtos/create-lesson-comment.dto';
import {
    LessonCommentResponseDto,
    LessonCommentsWithMetaResponseDto,
} from '../dtos/lesson-comment-response.dto';
import { LessonCommentOrmEntity } from '../../infra/typeorm/lesson-comment.orm-entity';

@Injectable()
export class LessonCommentService {
    constructor(
        @Inject('ILessonCommentRepository')
        private readonly commentRepo: ILessonCommentRepository,
        @InjectRepository(LessonCommentOrmEntity)
        private readonly commentOrmRepo: Repository<LessonCommentOrmEntity>,
    ) { }

    async createComment(
        dto: CreateLessonCommentDto,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        // Если есть parentId, проверяем существование родительского комментария
        if (dto.parentId) {
            const parent = await this.commentRepo.findById(dto.parentId);
            if (!parent) {
                throw new NotFoundException('Родительский комментарий не найден');
            }
            // Убедимся, что parentId принадлежит тому же lessonDetails
            if (parent.lessonDetailsId !== dto.lessonDetailsId) {
                throw new BadRequestException('Неверный parentId для данного урока');
            }
        }

        const comment = new LessonComment(
            dto.lessonDetailsId,
            userId,
            dto.content,
            dto.parentId || null,
        );

        const savedComment = await this.commentRepo.create(comment);
        return this.toResponseDto(savedComment, userId);
    }

    async updateComment(
        id: string,
        content: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        // Пользователь может редактировать только свои комментарии
        if (comment.userId !== userId) {
            throw new ForbiddenException('Вы можете редактировать только свои комментарии');
        }

        comment.updateContent(content);
        await this.commentRepo.update(id, comment);

        return this.toResponseDto(comment, userId);
    }

    async deleteComment(id: string, userId: string): Promise<{ success: boolean }> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        // Пользователь может удалять только свои комментарии
        if (comment.userId !== userId) {
            throw new ForbiddenException('Вы можете удалять только свои комментарии');
        }

        const ok = await this.commentRepo.delete(id);
        return { success: ok };
    }

    async getCommentsByLessonDetailsId(
        lessonDetailsId: string,
        userId: string,
    ): Promise<LessonCommentsWithMetaResponseDto> {
        const comments = await this.commentRepo.findAllByLessonDetailsId(lessonDetailsId);
        // Разрешаем комментировать всем пользователям
        const canComment = true;

        // Строим древовидную структуру комментариев
        const rootComments = comments.filter((c) => !c.parentId);
        const commentMap = new Map<string, LessonCommentResponseDto>();

        // Сначала создаем DTO для всех комментариев
        comments.forEach((comment) => {
            const dto = this.toResponseDto(comment, userId);
            dto.replies = [];
            commentMap.set(comment.id, dto);
        });

        // Затем добавляем ответы к родительским комментариям
        comments.forEach((comment) => {
            if (comment.parentId && commentMap.has(comment.parentId)) {
                const parent = commentMap.get(comment.parentId)!;
                if (!parent.replies) {
                    parent.replies = [];
                }
                parent.replies.push(commentMap.get(comment.id)!);
            }
        });

        // Возвращаем только корневые комментарии с ответами
        const rootCommentsWithReplies = rootComments.map((c) => commentMap.get(c.id)!);

        return {
            comments: rootCommentsWithReplies,
            total: comments.length,
            canComment,
        };
    }

    async toggleLike(
        id: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        if (comment.hasLikedBy(userId)) {
            comment.removeLike(userId);
        } else {
            comment.addLike(userId);
        }

        await this.commentRepo.update(id, comment);
        return this.toResponseDto(comment, userId);
    }

    async toggleDislike(
        id: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        if (comment.hasDislikedBy(userId)) {
            comment.removeDislike(userId);
        } else {
            comment.addDislike(userId);
        }

        await this.commentRepo.update(id, comment);
        return this.toResponseDto(comment, userId);
    }

    private toResponseDto(comment: LessonComment, currentUserId: string): LessonCommentResponseDto {
        const dto = new LessonCommentResponseDto();
        dto.id = comment.id;
        dto.lessonDetailsId = comment.lessonDetailsId;
        dto.userId = comment.userId;
        dto.content = comment.content;
        dto.parentId = comment.parentId;
        dto.likes = comment.likes;
        dto.dislikes = comment.dislikes;
        dto.likedByUsers = comment.likedByUsers;
        dto.dislikedByUsers = comment.dislikedByUsers;
        dto.createdAt = comment.createdAt;
        dto.updatedAt = comment.updatedAt;
        dto.hasLiked = comment.hasLikedBy(currentUserId);
        dto.hasDisliked = comment.hasDislikedBy(currentUserId);
        return dto;
    }
}
