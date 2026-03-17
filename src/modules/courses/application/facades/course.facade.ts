import { Injectable } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { CourseResponseDto } from '../dtos/course-response.dto';
import { CourseStatus } from '../../domain/entities/course.entity';

@Injectable()
export class CourseFacade {
  constructor(private readonly courseService: CourseService) {}

  async createCourse(
    dto: CreateCourseDto,
    adminId: string,
  ): Promise<CourseResponseDto> {
    return this.courseService.createCourse(dto, adminId);
  }

  async getCourse(id: string): Promise<CourseResponseDto> {
    return this.courseService.getCourseById(id);
  }

  async getCourses(options?: {
    adminId?: string;
    status?: CourseStatus;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    courses: CourseResponseDto[];
    total: number;
    page: number;
    pages: number;
  }> {
    return this.courseService.getCourses(options);
  }

  async updateCourse(
    id: string,
    dto: UpdateCourseDto,
    adminId?: string,
  ): Promise<CourseResponseDto> {
    return this.courseService.updateCourse(id, dto, adminId);
  }

  async deleteCourse(
    id: string,
    adminId?: string,
  ): Promise<{ success: boolean }> {
    return this.courseService.deleteCourse(id, adminId);
  }

  async publishCourse(
    id: string,
    adminId?: string,
  ): Promise<CourseResponseDto> {
    return this.courseService.publishCourse(id, adminId);
  }

  async getAdminCourses(adminId: string): Promise<CourseResponseDto[]> {
    return this.courseService.getAdminCourses(adminId);
  }

  async getCoursesByTag(tag: string): Promise<CourseResponseDto[]> {
    return this.courseService.getCoursesByTag(tag);
  }

  async getPublishedCourses(): Promise<CourseResponseDto[]> {
    return this.courseService.getPublishedCourses();
  }
}
