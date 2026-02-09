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
import { elementAt } from 'rxjs';
import { ILessonRepository } from '@modules/lesson/domain/interfaces/lesson.repository.interface';
import { ICheckpointRepository } from '@modules/checkpoint/domain/interfaces/checkpoint.repository.interface';
import { Lesson } from '@modules/lesson/domain/entities/lesson.entity';
import { Checkpoint } from '@modules/checkpoint/domain/entities/checkpoint.entity';

@Injectable()
export class CourseMapService {
  constructor(
    @Inject('ICourseMapRepository')
    private readonly courseMapRepository: ICourseMapRepository,


     @Inject('ILessonRepository')
  private readonly lessonRepository: ILessonRepository,
  @Inject('ICheckpointRepository')
  private readonly checkpointRepository: ICheckpointRepository,
  ) {}

  /* async createCourseMap(createDto: CreateCourseMapDto): Promise<CourseMapResponseDto> {
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
  } */


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
      const createdElement = await this.courseMapRepository.createElement(element);
      
      // Создаем связанные сущности для уроков и контрольных точек
      await this.createRelatedEntityForMapElement(createdElement, elementDto);
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

  // Обновляем настройки карты
  courseMap.update({
    width: updateDto.width,
    height: updateDto.height,
    backgroundColor: updateDto.backgroundColor,
    backgroundImage: updateDto.backgroundImage,
    backgroundRepeat: updateDto.backgroundRepeat,
    backgroundSize: updateDto.backgroundSize,
  });

  // Если есть элементы в updateDto, обрабатываем их
  if (updateDto.elements && updateDto.elements.length > 0) {
    console.log(`🔄 Синхронизация элементов: ${updateDto.elements.length} элементов`);
    await this.synchronizeMapElements(id, updateDto.elements);
  }

  const updated = await this.courseMapRepository.update(id, courseMap);
  if (!updated) {
    throw new BadRequestException('Failed to update course map');
  }

  const updatedMap = await this.courseMapRepository.findById(id);
  return this.toResponseDto(updatedMap!);
}

private async synchronizeMapElements(mapId: string, newElements: CreateMapElementDto[]): Promise<void> {
  // Получаем текущие элементы
  const existingElements = await this.courseMapRepository.findElementsByMapId(mapId);
  
  console.log(`📊 До: ${existingElements.length} элементов, После: ${newElements.length} элементов`);

  // Создаем мапы для быстрого поиска
  const existingElementsMap = new Map<string, MapElement>();
  existingElements.forEach(el => existingElementsMap.set(el.id, el));
  
  // Для новых элементов проверяем, есть ли ID в DTO
  for (const newElDto of newElements) {
    const elementWithId = newElDto as any;
    
    if (!elementWithId.id) {
      // Если ID нет - создаем новый элемент
      console.log('🆕 Создание нового элемента без ID');
      const element = this.createMapElementFromDto(newElDto, mapId);
      await this.courseMapRepository.createElement(element);
    } else if (existingElementsMap.has(elementWithId.id)) {
      // Если ID есть и элемент существует - обновляем
      console.log(`🔄 Обновление существующего элемента: ${elementWithId.id}`);
      await this.courseMapRepository.updateElement(elementWithId.id, newElDto);
      existingElementsMap.delete(elementWithId.id); // Убираем из списка существующих
    } else {
      // Если ID есть, но элемент не существует - создаем с этим ID
      console.log(`➕ Создание нового элемента с заданным ID: ${elementWithId.id}`);
      const element = this.createMapElementFromDto(newElDto, mapId);
      await this.courseMapRepository.createElement(element);
    }
  }

  // Удаляем элементы, которые остались в existingElementsMap (не были обновлены)
  for (const [elementId, element] of existingElementsMap) {
    console.log(`🗑️ Удаление элемента: ${elementId}`);
    await this.courseMapRepository.deleteElement(elementId);
  }

  console.log('✅ Синхронизация элементов завершена');
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

 /*  // Элементы карты
  async addMapElement(mapId: string, elementDto: CreateMapElementDto): Promise<MapElementDto> {
    const courseMap = await this.courseMapRepository.findById(mapId);
    if (!courseMap) {
      throw new NotFoundException('Course map not found');
    }

    const element = this.createMapElementFromDto(elementDto, mapId);
    const createdElement = await this.courseMapRepository.createElement(element);


    console.log("CREATED", createdElement)
    return this.toElementDto(createdElement);
  } */




    async addMapElement(mapId: string, elementDto: CreateMapElementDto): Promise<MapElementDto> {
  const courseMap = await this.courseMapRepository.findById(mapId);
  if (!courseMap) {
    throw new NotFoundException('Course map not found');
  }

  const element = this.createMapElementFromDto(elementDto, mapId);
  const createdElement = await this.courseMapRepository.createElement(element);

  // Автоматически создаем связанные сущности
  await this.createRelatedEntityForMapElement(createdElement, elementDto);

  console.log("CREATED", createdElement)
  return this.toElementDto(createdElement);
}
/* 
// Новый метод для создания связанных сущностей
private async createRelatedEntityForMapElement(
  mapElement: MapElement, 
  elementDto: CreateMapElementDto
): Promise<void> {
  if (mapElement.type === MapElementType.LESSON) {
    // Создаем урок
    const lessonDto = elementDto as any; // Cast чтобы получить дополнительные поля
    
    // Определяем orderIndex (можно брать из DTO или вычислять)
    const orderIndex = lessonDto.orderIndex || 0;
    
    const lesson = new Lesson(
      mapElement.id, // mapElementId - связь один к одному
      mapElement.title || 'Новый урок',
      mapElement.text || 'Описание урока',
      orderIndex,
      lessonDto.content, // дополнительный контент
      lessonDto.duration, // длительность
      lessonDto.isPublished || false,
      undefined // id - сгенерируется автоматически
    );
    
    await this.lessonRepository.create(lesson);
    console.log(`✅ Создан урок для элемента карты: ${mapElement.id}`);
    
  } else if (mapElement.type === MapElementType.CHECKPOINT) {
    // Создаем контрольную точку
    const checkpointDto = elementDto as any;
    
    // Определяем тип checkpoint из DTO или используем значение по умолчанию
    const checkpointType = checkpointDto.checkpointType  
    
    const checkpoint = new Checkpoint(
      mapElement.id, // mapElementId
      mapElement.title || 'Новая контрольная точка',
      mapElement.text || 'Описание контрольной точки',
      checkpointType,
      checkpointDto.passingScore, // проходной балл
      checkpointDto.maxAttempts, // максимальное количество попыток
      checkpointDto.timeLimit, // лимит времени
      checkpointDto.instructions, // инструкции
      checkpointDto.isPublished || false,
      undefined // id
    );
    
    await this.checkpointRepository.create(checkpoint);
    console.log(`✅ Создана контрольная точка для элемента карты: ${mapElement.id}`);
  }
} */


  // Новый метод для создания связанных сущностей
private async createRelatedEntityForMapElement(
  mapElement: MapElement, 
  elementDto: CreateMapElementDto
): Promise<void> {
  try {
    if (mapElement.type === MapElementType.LESSON) {
      // Создаем урок
      const lessonDto = elementDto as any;
      
      // Определяем orderIndex (можно брать из DTO или вычислять)
      const orderIndex = lessonDto.orderIndex || 0;
      
      const lesson = new Lesson(
        mapElement.id, // mapElementId - связь один к одному
        mapElement.title || 'Новый урок',
        mapElement.text || 'Описание урока',
        orderIndex,
        lessonDto.content, // дополнительный контент
        lessonDto.duration, // длительность
        lessonDto.published || lessonDto.isPublished || false, // используем published или isPublished
        undefined // id - сгенерируется автоматически
      );
      
      await this.lessonRepository.create(lesson);
      console.log(`✅ Создан урок для элемента карты: ${mapElement.id}`);
      
    } else if (mapElement.type === MapElementType.CHECKPOINT) {
      // Создаем контрольную точку
      const checkpointDto = elementDto as any;
      
      // Определяем тип checkpoint из DTO или используем значение по умолчанию
      const checkpointType = checkpointDto.checkpointType || 'quiz'; // значение по умолчанию
      
      const checkpoint = new Checkpoint(
        mapElement.id, // mapElementId
        mapElement.title || 'Новая контрольная точка',
        mapElement.text || 'Описание контрольной точки',
        checkpointType,
        checkpointDto.passingScore, // проходной балл
        checkpointDto.maxAttempts, // максимальное количество попыток
        checkpointDto.timeLimit, // лимит времени
        checkpointDto.instructions, // инструкции
        checkpointDto.published || checkpointDto.isPublished || false, // используем published или isPublished
        undefined // id
      );
      
      await this.checkpointRepository.create(checkpoint);
      console.log(`✅ Создана контрольная точка для элемента карты: ${mapElement.id}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при создании связанной сущности:', error);
    // Можно выбросить ошибку или просто залогировать
    throw new BadRequestException(`Failed to create related entity for map element: ${error.message}`);
  }
}

/* 
// Также нужно обновить метод synchronizeMapElements для создания связанных сущностей при обновлении
private async synchronizeMapElements(mapId: string, newElements: CreateMapElementDto[]): Promise<void> {
  // Получаем текущие элементы
  const existingElements = await this.courseMapRepository.findElementsByMapId(mapId);
  
  console.log(`📊 До: ${existingElements.length} элементов, После: ${newElements.length} элементов`);

  // Создаем мапы для быстрого поиска
  const existingElementsMap = new Map<string, MapElement>();
  existingElements.forEach(el => existingElementsMap.set(el.id, el));
  
  // Для новых элементов проверяем, есть ли ID в DTO
  for (const newElDto of newElements) {
    const elementWithId = newElDto as any;
    
    if (!elementWithId.id) {
      // Если ID нет - создаем новый элемент
      console.log('🆕 Создание нового элемента без ID');
      const element = this.createMapElementFromDto(newElDto, mapId);
      const createdElement = await this.courseMapRepository.createElement(element);
      
      // Создаем связанные сущности
      await this.createRelatedEntityForMapElement(createdElement, newElDto);
      
    } else if (existingElementsMap.has(elementWithId.id)) {
      // Если ID есть и элемент существует - обновляем
      console.log(`🔄 Обновление существующего элемента: ${elementWithId.id}`);
      await this.courseMapRepository.updateElement(elementWithId.id, newElDto);
      existingElementsMap.delete(elementWithId.id); // Убираем из списка существующих
    } else {
      // Если ID есть, но элемент не существует - создаем с этим ID
      console.log(`➕ Создание нового элемента с заданным ID: ${elementWithId.id}`);
      const element = this.createMapElementFromDto(newElDto, mapId);
      const createdElement = await this.courseMapRepository.createElement(element);
      
      // Создаем связанные сущности
      await this.createRelatedEntityForMapElement(createdElement, newElDto);
    }
  }

  // Удаляем элементы, которые остались в existingElementsMap (не были обновлены)
  for (const [elementId, element] of existingElementsMap) {
    console.log(`🗑️ Удаление элемента: ${elementId}`);
    await this.deleteMapElement(elementId); // Используем существующий метод, который удаляет связанные сущности
  }

  console.log('✅ Синхронизация элементов завершена');
}
 */
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
/* 
   async deleteMapElement(elementId: string): Promise<{ success: boolean }> {
    console.log("Удаление элемента:", elementId);
    
    const element = await this.courseMapRepository.findElementById(elementId);
    if (!element) {
      // Если элемент не найден, все равно возвращаем успех
      console.warn(`Элемент ${elementId} не найден при удалении`);
      return { success: true };
    }

    const deleted = await this.courseMapRepository.deleteElement(elementId);
    return { success: deleted };
  }
 */


  async deleteMapElement(elementId: string): Promise<{ success: boolean }> {
  console.log("Удаление элемента:", elementId);
  
  const element = await this.courseMapRepository.findElementById(elementId);
  if (!element) {
    console.warn(`Элемент ${elementId} не найден при удалении`);
    return { success: true };
  }

  // Удаляем связанные сущности
  if (element.type === MapElementType.LESSON) {
    await this.lessonRepository.deleteByMapElementId(elementId);
  } else if (element.type === MapElementType.CHECKPOINT) {
    await this.checkpointRepository.deleteByMapElementId(elementId);
  }

  const deleted = await this.courseMapRepository.deleteElement(elementId);
  return { success: deleted };
}
private createMapElementFromDto(dto: CreateMapElementDto, courseMapId: string): MapElement {
  // Пробуем получить ID из DTO (если он есть)
  const elementWithId = dto as any;
  const id = elementWithId.id;
  
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
    dto.breakpoints,
    id  
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
    id: element.id, // Теперь element.id гарантированно существует
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
