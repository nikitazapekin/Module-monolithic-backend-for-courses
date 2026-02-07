import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { ICourseMapRepository } from '../../domain/interfaces/course-map.repository.interface';
import { CourseMap } from '../../domain/entities/course-map.entity';
import { MapElement } from '../../domain/entities/map-element.entity';
import { CreateCourseMapDto } from '../dtos/create-course-map.dto';
import { UpdateCourseMapDto } from '../dtos/update-course-map.dto';
import { CreateMapElementDto } from '../dtos/create-map-element.dto';
import { CourseMapResponseDto } from '../dtos/course-map-response.dto';
import { MapElementDto } from '../dtos/map-element.dto';
import { MapElementType } from '@modules/map/infra/typeorm/map-element-types.enum';

@Injectable()
export class CourseMapService {
  constructor(
    @Inject('ICourseMapRepository')
    private readonly courseMapRepository: ICourseMapRepository,
  ) {}

  async createCourseMap(createDto: CreateCourseMapDto): Promise<CourseMapResponseDto> {
    // Проверяем, нет ли уже карты для этого курса
    const existingMap = await this.courseMapRepository.findByCourseId(createDto.courseId);
    if (existingMap) {
      throw new ConflictException('Course map already exists for this course');
    }

    const courseMap = new CourseMap(
      createDto.courseId,
      createDto.width,
      createDto.height,
      createDto.backgroundColor,
      createDto.backgroundRepeat,
      createDto.backgroundSize,
      createDto.backgroundImage
    );

    const createdMap = await this.courseMapRepository.create(courseMap);

    // Добавляем элементы, если они есть
    if (createDto.elements && createDto.elements.length > 0) {
      for (const elementDto of createDto.elements) {
        const element = this.createMapElementFromDto(elementDto, createdMap.id);
        await this.courseMapRepository.createElement(element);
      }
    }

    // Получаем полную карту с элементами
    const fullMap = await this.courseMapRepository.findById(createdMap.id);
    return this.toResponseDto(fullMap!);
  }

  async getCourseMap(id: string): Promise<CourseMapResponseDto> {
    const courseMap = await this.courseMapRepository.findById(id);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }
    return this.toResponseDto(courseMap);
  }

  async getCourseMapByCourseId(courseId: string): Promise<CourseMapResponseDto> {
    const courseMap = await this.courseMapRepository.findByCourseId(courseId);
    if (!courseMap) {
      throw new NotFoundException('Course map not found for this course');
    }
    return this.toResponseDto(courseMap);
  }

  async updateCourseMap(id: string, updateDto: UpdateCourseMapDto): Promise<CourseMapResponseDto> {
    const courseMap = await this.courseMapRepository.findById(id);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    courseMap.update({
      width: updateDto.width,
      height: updateDto.height,
      backgroundColor: updateDto.backgroundColor,
      backgroundImage: updateDto.backgroundImage,
      backgroundRepeat: updateDto.backgroundRepeat,
      backgroundSize: updateDto.backgroundSize,
    });

    const updated = await this.courseMapRepository.update(id, courseMap);
    if (!updated) {
      throw new BadRequestException('Failed to update course map');
    }

    const updatedMap = await this.courseMapRepository.findById(id);
    return this.toResponseDto(updatedMap!);
  }

  async deleteCourseMap(id: string): Promise<{ success: boolean }> {
    const courseMap = await this.courseMapRepository.findById(id);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    // Удаляем все элементы карты
    await this.courseMapRepository.deleteElementsByMapId(id);
    
    const deleted = await this.courseMapRepository.delete(id);
    return { success: deleted };
  }

  // Элементы карты
  async addMapElement(mapId: string, elementDto: CreateMapElementDto): Promise<MapElementDto> {
    const courseMap = await this.courseMapRepository.findById(mapId);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    const element = this.createMapElementFromDto(elementDto, mapId);
    const createdElement = await this.courseMapRepository.createElement(element);
    return this.toElementDto(createdElement);
  }

  async getMapElement(elementId: string): Promise<MapElementDto> {
    const element = await this.courseMapRepository.findElementById(elementId);
    if (!element) {
      throw new NotFoundException('Map element not found');
    }
    return this.toElementDto(element);
  }

  async getMapElements(mapId: string): Promise<MapElementDto[]> {
    const courseMap = await this.courseMapRepository.findById(mapId);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    const elements = await this.courseMapRepository.findElementsByMapId(mapId);
    return elements.map(element => this.toElementDto(element));
  }

  async getMapElementsByType(mapId: string, type: MapElementType): Promise<MapElementDto[]> {
    const courseMap = await this.courseMapRepository.findById(mapId);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    const elements = await this.courseMapRepository.findElementsByType(mapId, type);
    return elements.map(element => this.toElementDto(element));
  }

  async updateMapElement(elementId: string, updates: Partial<CreateMapElementDto>): Promise<MapElementDto> {
    const element = await this.courseMapRepository.findElementById(elementId);
    if (!element) {
      throw new NotFoundException('Map element not found');
    }

    const updated = await this.courseMapRepository.updateElement(elementId, updates);
    if (!updated) {
      throw new BadRequestException('Failed to update map element');
    }

    const updatedElement = await this.courseMapRepository.findElementById(elementId);
    return this.toElementDto(updatedElement!);
  }

  async deleteMapElement(elementId: string): Promise<{ success: boolean }> {
    const element = await this.courseMapRepository.findElementById(elementId);
    if (!element) {
      throw new NotFoundException('Map element not found');
    }

    const deleted = await this.courseMapRepository.deleteElement(elementId);
    return { success: deleted };
  }

  private createMapElementFromDto(dto: CreateMapElementDto, courseMapId: string): MapElement {
    return new MapElement(
      dto.type as MapElementType,
      courseMapId,
      dto.positionX,
      dto.positionY,
      dto.positioning,
      dto.offsetX,
      dto.offsetY,
      dto.rotation || 0,
      dto.title,
      dto.text,
      dto.color,
      dto.imageUrl,
      dto.emoji,
      dto.fontSize,
      dto.fontFamily,
      dto.fontWeight,
      dto.fontStyle,
      dto.width,
      dto.height,
      dto.isActive,
      dto.stars,
      dto.breakpoints
    );
  }

  private toResponseDto(courseMap: CourseMap): CourseMapResponseDto {
    const elements = courseMap.elements.map(element => this.toElementDto(element));
    
    return {
      id: courseMap.id,
      courseId: courseMap.courseId,
      width: courseMap.width,
      height: courseMap.height,
      backgroundColor: courseMap.backgroundColor,
      backgroundImage: courseMap.backgroundImage,
      backgroundRepeat: courseMap.backgroundRepeat,
      backgroundSize: courseMap.backgroundSize,
      elements,
      createdAt: courseMap.createdAt,
      updatedAt: courseMap.updatedAt,
    };
  }

  private toElementDto(element: MapElement): MapElementDto {
    return {
      id: element.id,
      type: element.type,
      title: element.title,
      text: element.text,
      color: element.color,
      imageUrl: element.imageUrl,
      emoji: element.emoji,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      positionX: element.positionX,
      positionY: element.positionY,
      positioning: element.positioning,
      offsetX: element.offsetX,
      offsetY: element.offsetY,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      isActive: element.isActive,
      stars: element.stars,
      breakpoints: element.breakpoints,
      createdAt: element.createdAt,
      updatedAt: element.updatedAt,
    };
  }
}
