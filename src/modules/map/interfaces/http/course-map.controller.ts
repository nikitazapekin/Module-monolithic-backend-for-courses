import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CourseMapFacade } from '../../application/facades/course-map.facade';
import { CreateCourseMapDto } from '../../application/dtos/create-course-map.dto';
import { UpdateCourseMapDto } from '../../application/dtos/update-course-map.dto';
import { CreateMapElementDto } from '../../application/dtos/create-map-element.dto';
import { CourseMapResponseDto } from '../../application/dtos/course-map-response.dto';
import { MapElementDto } from '../../application/dtos/map-element.dto';
import { MapElementType } from '../../domain/entities/map-element-types.enum';

@ApiTags('course-maps')
@Controller('course-maps')
export class CourseMapController {
  constructor(private readonly courseMapFacade: CourseMapFacade) {}

  @Post()
  @ApiOperation({ summary: 'Создать карту курса' })
  @ApiResponse({
    status: 201,
    description: 'Карта курса создана',
    type: CourseMapResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Карта для этого курса уже существует',
  })
  async createCourseMap(
    @Body() createDto: CreateCourseMapDto,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapFacade.createCourseMap(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить карту курса по ID' })
  @ApiParam({ name: 'id', description: 'ID карты курса' })
  @ApiResponse({
    status: 200,
    description: 'Карта курса',
    type: CourseMapResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Карта курса не найдена' })
  async getCourseMap(@Param('id') id: string): Promise<CourseMapResponseDto> {
    return this.courseMapFacade.getCourseMap(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Получить карту курса по ID курса' })
  @ApiParam({ name: 'courseId', description: 'ID курса' })
  @ApiResponse({
    status: 200,
    description: 'Карта курса',
    type: CourseMapResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Карта курса не найдена' })
  async getCourseMapByCourseId(
    @Param('courseId') courseId: string,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapFacade.getCourseMapByCourseId(courseId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить карту курса' })
  @ApiParam({ name: 'id', description: 'ID карты курса' })
  @ApiResponse({
    status: 200,
    description: 'Карта курса обновлена',
    type: CourseMapResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Карта курса не найдена' })
  async updateCourseMap(
    @Param('id') id: string,
    @Body() updateDto: UpdateCourseMapDto,
  ): Promise<CourseMapResponseDto> {
    return this.courseMapFacade.updateCourseMap(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить карту курса' })
  @ApiParam({ name: 'id', description: 'ID карты курса' })
  @ApiResponse({ status: 204, description: 'Карта курса удалена' })
  @ApiResponse({ status: 404, description: 'Карта курса не найдена' })
  async deleteCourseMap(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.courseMapFacade.deleteCourseMap(id);
  }
 
  @Post(':mapId/elements')
  @ApiOperation({ summary: 'Добавить элемент на карту курса' })
  @ApiParam({ name: 'mapId', description: 'ID карты курса' })
  @ApiResponse({
    status: 201,
    description: 'Элемент добавлен',
    type: MapElementDto,
  })
  @ApiResponse({ status: 404, description: 'Карта курса не найдена' })
  async addMapElement(
    @Param('mapId') mapId: string,
    @Body() createDto: CreateMapElementDto,
  ): Promise<MapElementDto> {
  
    return this.courseMapFacade.addMapElement(mapId, createDto);
  }

  @Get('elements/:elementId')
  @ApiOperation({ summary: 'Получить элемент карты по ID' })
  @ApiParam({ name: 'elementId', description: 'ID элемента карты' })
  @ApiResponse({
    status: 200,
    description: 'Элемент карты',
    type: MapElementDto,
  })
  @ApiResponse({ status: 404, description: 'Элемент карты не найден' })
  async getMapElement(
    @Param('elementId') elementId: string,
  ): Promise<MapElementDto> {
    return this.courseMapFacade.getMapElement(elementId);
  }

  @Get(':mapId/elements')
  @ApiOperation({ summary: 'Получить все элементы карты курса' })
  @ApiParam({ name: 'mapId', description: 'ID карты курса' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: MapElementType,
    description: 'Фильтр по типу элемента',
  })
  @ApiResponse({
    status: 200,
    description: 'Список элементов карты',
    type: [MapElementDto],
  })
  async getMapElements(
    @Param('mapId') mapId: string,
    @Query('type') type?: MapElementType,
  ): Promise<MapElementDto[]> {
    if (type) {
      return this.courseMapFacade.getMapElementsByType(mapId, type);
    }
    return this.courseMapFacade.getMapElements(mapId);
  }

  @Put('elements/:elementId')
  @ApiOperation({ summary: 'Обновить элемент карты' })
  @ApiParam({ name: 'elementId', description: 'ID элемента карты' })
  @ApiResponse({
    status: 200,
    description: 'Элемент обновлен',
    type: MapElementDto,
  })
  @ApiResponse({ status: 404, description: 'Элемент карты не найден' })
  async updateMapElement(
    @Param('elementId') elementId: string,
    @Body() updateDto: Partial<CreateMapElementDto>,
  ): Promise<MapElementDto> {
    console.log('eleeement', elementId);
    return this.courseMapFacade.updateMapElement(elementId, updateDto);
  }
 
  @Delete('elements/:elementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить элемент карты' })
  @ApiParam({ name: 'elementId', description: 'ID элемента карты' })
  @ApiResponse({ status: 204, description: 'Элемент удален' })
  @ApiResponse({ status: 404, description: 'Элемент карты не найден' })
  async deleteMapElement(
    @Param('elementId') elementId: string,
  ): Promise<{ success: boolean }> {
   
    const cleanElementId = elementId.replace(/^elements\//, '');
    console.log('Удаление элемента:', cleanElementId);
    return this.courseMapFacade.deleteMapElement(cleanElementId);
  }

}
