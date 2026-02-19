import { LessonSlide } from '../entities/lesson-slide.entity';

export interface ILessonSlideRepository {
    create(slide: LessonSlide): Promise<LessonSlide>;
    createMany(slides: LessonSlide[]): Promise<LessonSlide[]>;
    findById(id: string): Promise<LessonSlide | null>;
    findAllByLessonDetailsId(lessonDetailsId: string): Promise<LessonSlide[]>;
    update(id: string, updates: Partial<LessonSlide>): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    deleteAllByLessonDetailsId(lessonDetailsId: string): Promise<boolean>;
}
