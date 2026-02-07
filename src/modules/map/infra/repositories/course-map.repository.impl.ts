import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICourseMapRepository } from '../../domain/interfaces/course-map.repository.interface';
import { CourseMap } from '../../domain/entities/course-map.entity';
import { MapElement } from '../../domain/entities/map-element.entity';
import { CourseMapOrmEntity } from '../typeorm/course-map.orm-entity';
import { MapElementOrmEntity } from '../typeorm/map-element.orm-entity';
import { MapElementType } from '../typeorm/map-element-types.enum';
@Injectable()
export class CourseMapRepository implements ICourseMapRepository {
  constructor(
    @InjectRepository(CourseMapOrmEntity)
    private readonly courseMapRepository: Repository<CourseMapOrmEntity>,
    
    @InjectRepository(MapElementOrmEntity)
    private readonly mapElementRepository: Repository<MapElementOrmEntity>,
  ) {}

  // CourseMap methods
  async create(courseMap: CourseMap): Promise<CourseMap> {
    const entity = this.toCourseMapOrmEntity(courseMap);
    const saved = await this.courseMapRepository.save(entity);
    return this.toCourseMapDomain(saved);
  }

  async findById(id: string): Promise<CourseMap | null> {
    const entity = await this.courseMapRepository.findOne({
      where: { id },
      relations: ['elements']
    });
    return entity ? this.toCourseMapDomain(entity) : null;
  }

  async findByCourseId(courseId: string): Promise<CourseMap | null> {
    const entity = await this.courseMapRepository.findOne({
      where: { courseId },
      relations: ['elements']
    });
    return entity ? this.toCourseMapDomain(entity) : null;
  }

  async update(id: string, updates: Partial<CourseMap>): Promise<boolean> {
  /*   const result = await this.courseMapRepository.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    return result.affected > 0; */

    return true
  }

  async delete(id: string): Promise<boolean> {
/*     const result = await this.courseMapRepository.delete(id);
    return result.affected > 0; */
    return false
  }

  // MapElement methods
  async createElement(element: MapElement): Promise<MapElement> {
    const entity = this.toMapElementOrmEntity(element);
    const saved = await this.mapElementRepository.save(entity);
    return this.toMapElementDomain(saved);
  }

  async findElementById(elementId: string): Promise<MapElement | null> {
    const entity = await this.mapElementRepository.findOne({
      where: { id: elementId }
    });
    return entity ? this.toMapElementDomain(entity) : null;
  }

  async findElementsByMapId(mapId: string): Promise<MapElement[]> {
    const entities = await this.mapElementRepository.find({
      where: { courseMapId: mapId },
      order: { createdAt: 'ASC' }
    });
    return entities.map(entity => this.toMapElementDomain(entity));
  }

  async findElementsByType(mapId: string, type: MapElementType): Promise<MapElement[]> {
    const entities = await this.mapElementRepository.find({
      where: { courseMapId: mapId, type },
      order: { createdAt: 'ASC' }
    });
    return entities.map(entity => this.toMapElementDomain(entity));
  }

  async updateElement(elementId: string, updates: Partial<MapElement>): Promise<boolean> {
   /*  const result = await this.mapElementRepository.update(elementId, {
      ...updates,
      updatedAt: new Date(),
    });
    return result.affected > 0; */

    return false
  }

  async deleteElement(elementId: string): Promise<boolean> {
 /*    const result = await this.mapElementRepository.delete(elementId);
    return result.affected > 0; */

       return false
  }

  async deleteElementsByMapId(mapId: string): Promise<boolean> {
 /*    const result = await this.mapElementRepository.delete({ courseMapId: mapId });
    return result.affected > 0; */

    return false
  }

  // Преобразования Domain ↔ ORM
  private toCourseMapDomain(entity: CourseMapOrmEntity): CourseMap {
    const courseMap = new CourseMap(
      entity.courseId,
      entity.width,
      entity.height,
      entity.backgroundColor,
      entity.backgroundRepeat,
      entity.backgroundSize,
      entity.backgroundImage
    );
    
    Object.assign(courseMap, {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    // Добавляем элементы
    if (entity.elements) {
      courseMap.elements = entity.elements.map(element => this.toMapElementDomain(element));
    }
    
    return courseMap;
  }

  private toCourseMapOrmEntity(courseMap: CourseMap): CourseMapOrmEntity {
    const entity = new CourseMapOrmEntity();
    entity.id = courseMap.id;
    entity.courseId = courseMap.courseId;
    entity.width = courseMap.width;
    entity.height = courseMap.height;
    entity.backgroundColor = courseMap.backgroundColor;
    entity.backgroundImage = courseMap.backgroundImage;
    entity.backgroundRepeat = courseMap.backgroundRepeat;
    entity.backgroundSize = courseMap.backgroundSize;
    entity.createdAt = courseMap.createdAt;
    entity.updatedAt = courseMap.updatedAt;
    
    return entity;
  }

  private toMapElementDomain(entity: MapElementOrmEntity): MapElement {
    return new MapElement(
      entity.type,
      entity.courseMapId,
      entity.positionX,
      entity.positionY,
      entity.positioning,
      entity.offsetX,
      entity.offsetY,
      entity.rotation,
      entity.title,
      entity.text,
      entity.color,
      entity.imageUrl,
      entity.emoji,
      entity.fontSize,
      entity.fontFamily,
      entity.fontWeight,
      entity.fontStyle,
      entity.width,
      entity.height,
      entity.isActive,
      entity.stars,
      entity.breakpoints
    );
  }

  private toMapElementOrmEntity(element: MapElement): MapElementOrmEntity {
    const entity = new MapElementOrmEntity();
    entity.id = element.id;
    entity.type = element.type;
    entity.courseMapId = element.courseMapId;
    entity.title = element.title;
    entity.text = element.text;
    entity.color = element.color;
    entity.imageUrl = element.imageUrl;
    entity.emoji = element.emoji;
    entity.fontSize = element.fontSize;
    entity.fontFamily = element.fontFamily;
    entity.fontWeight = element.fontWeight;
    entity.fontStyle = element.fontStyle;
    entity.positionX = element.positionX;
    entity.positionY = element.positionY;
    entity.positioning = element.positioning;
    entity.offsetX = element.offsetX;
    entity.offsetY = element.offsetY;
    entity.width = element.width;
    entity.height = element.height;
    entity.rotation = element.rotation;
    entity.isActive = element.isActive;
    entity.stars = element.stars;
    entity.breakpoints = element.breakpoints;
    entity.createdAt = element.createdAt;
    entity.updatedAt = element.updatedAt;
    
    return entity;
  }
}
