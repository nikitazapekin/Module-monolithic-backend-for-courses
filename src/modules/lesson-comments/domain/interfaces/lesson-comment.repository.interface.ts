import { LessonComment } from '../entities/lesson-comment.entity';

export interface ILessonCommentRepository {
    findById(id: string): Promise<LessonComment | null>;
    findAllByLessonDetailsId(lessonDetailsId: string): Promise<LessonComment[]>;
    findRepliesByParentId(parentId: string): Promise<LessonComment[]>;
    create(comment: LessonComment): Promise<LessonComment>;
    update(id: string, comment: LessonComment): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    deleteAllByLessonDetailsId(lessonDetailsId: string): Promise<boolean>;
}
