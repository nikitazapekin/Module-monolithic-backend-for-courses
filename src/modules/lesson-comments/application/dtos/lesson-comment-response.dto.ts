import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class LessonCommentResponseDto {
    @Expose()
    @ApiProperty({ description: 'ID комментария' })
    id: string;

    @Expose()
    @ApiProperty({ description: 'ID lesson_details' })
    lessonDetailsId: string;

    @Expose()
    @ApiProperty({ description: 'ID пользователя' })
    userId: string;

    @Expose()
    @ApiProperty({ description: 'Текст комментария' })
    content: string;

    @Expose()
    @ApiPropertyOptional({ description: 'ID родительского комментария' })
    parentId?: string | null;

    @Expose()
    @ApiProperty({ description: 'Количество лайков' })
    likes: number;

    @Expose()
    @ApiProperty({ description: 'Количество дизлайков' })
    dislikes: number;

    @Expose()
    @ApiProperty({ description: 'Пользователи, поставившие лайк', isArray: true })
    likedByUsers: string[];

    @Expose()
    @ApiProperty({ description: 'Пользователи, поставившие дизлайк', isArray: true })
    dislikedByUsers: string[];

    @Expose()
    @ApiProperty({ description: 'Дата создания' })
    createdAt: Date;

    @Expose()
    @ApiProperty({ description: 'Дата обновления' })
    updatedAt: Date;

    @Expose()
    @ApiProperty({ description: 'Поставил ли текущий пользователь лайк' })
    hasLiked: boolean;

    @Expose()
    @ApiProperty({ description: 'Поставил ли текущий пользователь дизлайк' })
    hasDisliked: boolean;

    @Expose()
    @ApiProperty({ description: 'Ответы на комментарий', type: [LessonCommentResponseDto], nullable: true })
    replies?: LessonCommentResponseDto[];
}

export class LessonCommentsWithMetaResponseDto {
    @ApiProperty({ description: 'Список комментариев', type: [LessonCommentResponseDto] })
    comments: LessonCommentResponseDto[];

    @ApiProperty({ description: 'Общее количество комментариев' })
    total: number;

    @ApiProperty({ description: 'Пользователь решил урок с звездой', type: Boolean })
    canComment: boolean;
}
