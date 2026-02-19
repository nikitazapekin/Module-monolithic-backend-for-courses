import { Injectable } from '@nestjs/common';
import { LessonDetailsService } from '../services/lesson-details.service';
import { CreateLessonDetailsDto } from '../dtos/create-lesson-details.dto';
import { UpdateLessonDetailsDto } from '../dtos/update-lesson-details.dto';
import { LessonDetailsResponseDto } from '../dtos/lesson-details-response.dto';

@Injectable()
export class LessonDetailsFacade {
    constructor(private readonly service: LessonDetailsService) { }

    createLessonDetails(dto: CreateLessonDetailsDto): Promise<LessonDetailsResponseDto> {
        return this.service.createLessonDetails(dto);
    }

    getLessonDetailsById(id: string): Promise<LessonDetailsResponseDto> {
        return this.service.getLessonDetailsById(id);
    }

    getLessonDetailsByLessonId(lessonId: string): Promise<LessonDetailsResponseDto> {
        return this.service.getLessonDetailsByLessonId(lessonId);
    }

    updateLessonDetails(id: string, dto: UpdateLessonDetailsDto): Promise<LessonDetailsResponseDto> {
        return this.service.updateLessonDetails(id, dto);
    }

    deleteLessonDetails(id: string): Promise<{ success: boolean }> {
        return this.service.deleteLessonDetails(id);
    }

    deleteLessonDetailsByLessonId(lessonId: string): Promise<{ success: boolean }> {
        return this.service.deleteLessonDetailsByLessonId(lessonId);
    }
}
