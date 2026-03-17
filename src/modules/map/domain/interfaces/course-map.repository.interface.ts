import { CourseMap } from '../entities/course-map.entity';
import { MapElement } from '../entities/map-element.entity';
import { MapElementType } from '../entities/map-element-types.enum';

export interface ICourseMapRepository {
  // CourseMap methods
  create(courseMap: CourseMap): Promise<CourseMap>;
  findById(id: string): Promise<CourseMap | null>;
  findByCourseId(courseId: string): Promise<CourseMap | null>;
  update(id: string, updates: Partial<CourseMap>): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // MapElement methods
  createElement(element: MapElement): Promise<MapElement>;
  findElementById(elementId: string): Promise<MapElement | null>;
  findElementsByMapId(mapId: string): Promise<MapElement[]>;
  findElementsByType(
    mapId: string,
    type: MapElementType,
  ): Promise<MapElement[]>;
  updateElement(
    elementId: string,
    updates: Partial<MapElement>,
  ): Promise<boolean>;
  deleteElement(elementId: string): Promise<boolean>;
  deleteElementsByMapId(mapId: string): Promise<boolean>;
}
