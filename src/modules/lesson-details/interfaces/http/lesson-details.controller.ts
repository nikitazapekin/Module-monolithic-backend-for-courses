import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LessonDetailsFacade } from '../../application/facades/lesson-details.facade';
import { CreateLessonDetailsDto } from '../../application/dtos/create-lesson-details.dto';
import { UpdateLessonDetailsDto } from '../../application/dtos/update-lesson-details.dto';
import { LessonDetailsResponseDto } from '../../application/dtos/lesson-details-response.dto';

@ApiTags('lesson-details')
@Controller('lesson-details')
@UseInterceptors(ClassSerializerInterceptor)
export class LessonDetailsController {
  constructor(private readonly facade: LessonDetailsFacade) {}

  @Post()
  @ApiOperation({
    summary: 'Создать lesson_details для урока (со слайдами и тестами)',
  })
  @ApiResponse({ status: 201, type: LessonDetailsResponseDto })
  async create(
    @Body() dto: CreateLessonDetailsDto,
  ): Promise<LessonDetailsResponseDto> {
    return this.facade.createLessonDetails(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить lesson_details по ID' })
  @ApiResponse({ status: 200, type: LessonDetailsResponseDto })
  @ApiParam({ name: 'id', type: String })
  async getById(@Param('id') id: string): Promise<LessonDetailsResponseDto> {
    return this.facade.getLessonDetailsById(id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Получить lesson_details по ID урока' })
  @ApiResponse({ status: 200, type: LessonDetailsResponseDto })
  @ApiParam({ name: 'lessonId', type: String })
  async getByLessonId(
    @Param('lessonId') lessonId: string,
  ): Promise<LessonDetailsResponseDto> {
    return this.facade.getLessonDetailsByLessonId(lessonId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Обновить lesson_details (слайды и тесты заменяются полностью)',
  })
  @ApiResponse({ status: 200, type: LessonDetailsResponseDto })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDetailsDto,
  ): Promise<LessonDetailsResponseDto> {
    return this.facade.updateLessonDetails(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить lesson_details по ID' })
  @ApiResponse({
    status: 200,
    schema: { properties: { success: { type: 'boolean' } } },
  })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.facade.deleteLessonDetails(id);
  }

  @Delete('lesson/:lessonId')
  @ApiOperation({ summary: 'Удалить lesson_details по ID урока' })
  @ApiResponse({
    status: 200,
    schema: { properties: { success: { type: 'boolean' } } },
  })
  @ApiParam({ name: 'lessonId', type: String })
  async deleteByLessonId(
    @Param('lessonId') lessonId: string,
  ): Promise<{ success: boolean }> {
    return this.facade.deleteLessonDetailsByLessonId(lessonId);
  }
}
