import { Injectable } from '@nestjs/common';
import { CourseMapService } from '../services/course-map.service';
import { CreateCourseMapDto } from '../dtos/create-course-map.dto';
import { UpdateCourseMapDto } from '../dtos/update-course-map.dto';
import { CreateMapElementDto } from '../dtos/create-map-element.dto';
import { CourseMapResponseDto } from '../dtos/course-map-response.dto';
import { MapElementDto } from '../dtos/map-element.dto';
import { MapElementType } from '../../domain/entities/map-element-types.enum';

@Injectable()
export class CourseMapFacade {
  constructor(private readonly courseMapService: CourseMapService) {}

  async createCourseMap(
    dto: CreateCourseMapDto,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapService.createCourseMap(dto);
  }

  async getCourseMap(id: string): Promise<CourseMapResponseDto> {
    return this.courseMapService.getCourseMap(id);
  }

  async getCourseMapByCourseId(
    courseId: string,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapService.getCourseMapByCourseId(courseId);
  }

  async updateCourseMap(
    id: string,
    dto: UpdateCourseMapDto,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapService.updateCourseMap(id, dto);
  }

  async deleteCourseMap(id: string): Promise<{ success: boolean }> {
    return this.courseMapService.deleteCourseMap(id);
  }
 
  async addMapElement(
    mapId: string,
    dto: CreateMapElementDto,
  ): Promise<MapElementDto> {
    return this.courseMapService.addMapElement(mapId, dto);
  }

  async getMapElement(elementId: string): Promise<MapElementDto> {
    return this.courseMapService.getMapElement(elementId);
  }

  async getMapElements(mapId: string): Promise<MapElementDto[]> {
    return this.courseMapService.getMapElements(mapId);
  }

  async getMapElementsByType(
    mapId: string,
    type: MapElementType,
  ): Promise<MapElementDto[]> {
    return this.courseMapService.getMapElementsByType(mapId, type);
  }

  async updateMapElement(
    elementId: string,
    dto: Partial<CreateMapElementDto>,
  ): Promise<MapElementDto> {
    return this.courseMapService.updateMapElement(elementId, dto);
  }

  async deleteMapElement(elementId: string): Promise<{ success: boolean }> {
    return this.courseMapService.deleteMapElement(elementId);
  }
}
