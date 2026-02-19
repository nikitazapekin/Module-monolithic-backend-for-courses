import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LessonFacade } from '../../application/facades/lesson.facade';
import { CreateLessonDto } from '../../application/dtos/create-lesson.dto';
import { UpdateLessonDto } from '../../application/dtos/update-lesson.dto';
import { LessonResponseDto } from '../../application/dtos/lesson-response.dto';

@ApiTags('lessons')
@Controller('lessons')
@UseInterceptors(ClassSerializerInterceptor)
export class LessonController {
  constructor(private readonly lessonFacade: LessonFacade) {}

  @Post()
  @ApiOperation({ summary: 'Создать урок' })
  @ApiResponse({ status: 201, type: LessonResponseDto })
  async create(@Body() dto: CreateLessonDto): Promise<LessonResponseDto> {


    console.log("CREAAAAAAAATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEEEEEEEEEEEE CPNTROLLLLLLLLLLLER")
    return this.lessonFacade.createLesson(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить урок по ID' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  @ApiParam({ name: 'id', type: String })
  async getById(@Param('id') id: string): Promise<LessonResponseDto> {
    return this.lessonFacade.getLesson(id);
  }

  @Get('map-element/:mapElementId')
  @ApiOperation({ summary: 'Получить урок по ID элемента карты' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  @ApiParam({ name: 'mapElementId', type: String })
  async getByMapElementId(@Param('mapElementId') mapElementId: string): Promise<LessonResponseDto> {
    return this.lessonFacade.getLessonByMapElementId(mapElementId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить уроки по ID карты курса' })
  @ApiResponse({ status: 200, type: [LessonResponseDto] })
  @ApiQuery({ name: 'courseMapId', type: String, required: true })
  async getByCourseMapId(@Query('courseMapId') courseMapId: string): Promise<LessonResponseDto[]> {
    return this.lessonFacade.getLessonsByCourseMapId(courseMapId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить урок' })
  @ApiResponse({ status: 200, type: LessonResponseDto })
  @ApiParam({ name: 'id', type: String })
  async update(@Param('id') id: string, @Body() dto: UpdateLessonDto): Promise<LessonResponseDto> {
    return this.lessonFacade.updateLesson(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить урок' })
  @ApiResponse({ status: 200, schema: { properties: { success: { type: 'boolean' } } } })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.lessonFacade.deleteLesson(id);
  }

  @Delete('map-element/:mapElementId')
  @ApiOperation({ summary: 'Удалить урок по ID элемента карты' })
  @ApiResponse({ status: 200, schema: { properties: { success: { type: 'boolean' } } } })
  @ApiParam({ name: 'mapElementId', type: String })
  async deleteByMapElementId(@Param('mapElementId') mapElementId: string): Promise<{ success: boolean }> {
    return this.lessonFacade.deleteLessonByMapElementId(mapElementId);
  }
}
