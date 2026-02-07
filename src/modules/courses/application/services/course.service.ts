import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  ConflictException,
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { ICourseRepository } from '../../domain/interfaces/course.repository.interface';
import { Course, CourseStatus } from '../../domain/entities/course.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { CourseResponseDto } from '../dtos/course-response.dto';
import { CourseMapService } from '@modules/map/application/services/course-map.service';

@Injectable()
export class CourseService {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
      private readonly courseMapService: CourseMapService,
      
  ) {}

  async createCourse(createCourseDto: CreateCourseDto, adminId: string): Promise<CourseResponseDto> {
    // Проверка на уникальность названия
    const exists = await this.courseRepository.existsByTitle(createCourseDto.title);
    if (exists) {
      throw new ConflictException('Course with this title already exists');
    }
    console.log("ADMIIN IN SERVICES", adminId)

    const course = new Course(
      createCourseDto.title,
      createCourseDto.description,
      createCourseDto.type,
      createCourseDto.language,
      createCourseDto.tags || [],
      createCourseDto.logo,
      adminId,
      
      createCourseDto.status || 'draft'
    );

    const createdCourse = await this.courseRepository.create(course);







     try {
      await this.courseMapService.createCourseMap({
        courseId: createdCourse.id,
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      });
    } catch (error) {
 
      console.error('Failed to create course map:', error);
    }

    return this.toResponseDto(createdCourse);
  }

  async getCourseById(id: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.toResponseDto(course);
  }

  async getCourses(options?: {
    adminId?: string;
    status?: CourseStatus;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ courses: CourseResponseDto[]; total: number; page: number; pages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const { courses, total } = await this.courseRepository.findAll({
      adminId: options?.adminId,
      status: options?.status,
      skip,
      take: limit,
      search: options?.search,
    });

    const responseCourses = courses.map(course => this.toResponseDto(course));
    const pages = Math.ceil(total / limit);

    return {
      courses: responseCourses,
      total,
      page,
      pages,
    };
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, adminId?: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Проверка прав администратора (если требуется)
    if (adminId && course.adminId !== adminId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    // Проверка на уникальность названия (если изменяется)
    if (updateCourseDto.title && updateCourseDto.title !== course.title) {
      const exists = await this.courseRepository.existsByTitle(updateCourseDto.title);
      if (exists) {
        throw new ConflictException('Course with this title already exists');
      }
    }

    course.update(updateCourseDto);
    
    const updated = await this.courseRepository.update(id, course);
    if (!updated) {
      throw new BadRequestException('Failed to update course');
    }

    // Получаем обновленный курс
    const updatedCourse = await this.courseRepository.findById(id);
    return this.toResponseDto(updatedCourse!);
  }

  async deleteCourse(id: string, adminId?: string): Promise<{ success: boolean }> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Проверка прав администратора (если требуется)
    if (adminId && course.adminId !== adminId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    const deleted = await this.courseRepository.delete(id);
    return { success: deleted };
  }

  async publishCourse(id: string, adminId?: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (adminId && course.adminId !== adminId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    course.publish();
    
    const updated = await this.courseRepository.update(id, course);
    if (!updated) {
      throw new BadRequestException('Failed to publish course');
    }

    const publishedCourse = await this.courseRepository.findById(id);
    return this.toResponseDto(publishedCourse!);
  }

  async getAdminCourses(adminId: string): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.findByAdminId(adminId);
    return courses.map(course => this.toResponseDto(course));
  }

  async getCoursesByTag(tag: string): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.findByTag(tag);
    return courses.map(course => this.toResponseDto(course));
  }

  async getPublishedCourses(): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.findByStatus('published');
    return courses.map(course => this.toResponseDto(course));
  }

  private toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      type: course.type,
      language: course.language,
      tags: course.tags,
      logo: course.logo,
      status: course.status,
      adminId: course.adminId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
    };
  }
}
