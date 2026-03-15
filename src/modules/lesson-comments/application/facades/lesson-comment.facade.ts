import { Injectable } from '@nestjs/common';
import { LessonCommentService } from '../services/lesson-comment.service';
import { CreateLessonCommentDto } from '../dtos/create-lesson-comment.dto';
import {
    LessonCommentResponseDto,
    LessonCommentsWithMetaResponseDto,
} from '../dtos/lesson-comment-response.dto';

@Injectable()
export class LessonCommentFacade {
    constructor(private readonly service: LessonCommentService) { }

    createComment(
        dto: CreateLessonCommentDto,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        return this.service.createComment(dto, userId);
    }

    updateComment(
        id: string,
        content: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        return this.service.updateComment(id, content, userId);
    }

    deleteComment(
        id: string,
        userId: string,
    ): Promise<{ success: boolean }> {
        return this.service.deleteComment(id, userId);
    }

    getCommentsByLessonDetailsId(
        lessonDetailsId: string,
        userId: string,
    ): Promise<LessonCommentsWithMetaResponseDto> {
        return this.service.getCommentsByLessonDetailsId(lessonDetailsId, userId);
    }

    toggleLike(
        id: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        return this.service.toggleLike(id, userId);
    }

    toggleDislike(
        id: string,
        userId: string,
    ): Promise<LessonCommentResponseDto> {
        return this.service.toggleDislike(id, userId);
    }
}
