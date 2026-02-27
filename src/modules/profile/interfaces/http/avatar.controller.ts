import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { AvatarService } from '../../application/services/avatar.service';
import { CreateAvatarDto } from '../../application/dtos/create-avatar.dto';
import { UpdateAvatarDto } from '../../application/dtos/update-avatar.dto';
import { AvatarResponseDto } from '../../application/dtos/avatar-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('profile/avatar')
@Controller('profile/avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание аватара пользователя' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Аватар успешно создан',
    type: AvatarResponseDto,
  })
  @ApiBearerAuth()
  async create(@Body() createAvatarDto: CreateAvatarDto): Promise<AvatarResponseDto> {
    const avatar = await this.avatarService.create(createAvatarDto);
    return this.mapToResponse(avatar);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Загрузка аватара через multipart/form-data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Аватар успешно загружен',
    type: AvatarResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        auditoryId: { type: 'string', example: 'auth_1234567890_abc123' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (PNG, JPEG, GIF, WebP)',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(image\/jpeg|image\/jpg|image\/png|image\/gif|image\/webp)/,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: any,
    @Body('auditoryId') auditoryId: string,
  ): Promise<AvatarResponseDto> {
    if (!auditoryId) {
      throw new BadRequestException('auditoryId is required');
    }

    const imageData = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    const avatar = await this.avatarService.create({
      auditoryId,
      imageData,
      mimeType,
    });

    return this.mapToResponse(avatar);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение аватара по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Аватар найден',
    type: AvatarResponseDto,
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<AvatarResponseDto> {
    const avatar = await this.avatarService.findById(id);
    return this.mapToResponse(avatar);
  }

  @Get('user/:auditoryId')
  @ApiOperation({ summary: 'Получение аватара по ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Аватар найден',
    type: AvatarResponseDto,
  })
  @ApiBearerAuth()
  async findByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<AvatarResponseDto> {
    const avatar = await this.avatarService.findByAuditoryId(auditoryId);
    return this.mapToResponse(avatar);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление аватара по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Аватар успешно обновлен',
    type: AvatarResponseDto,
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ): Promise<AvatarResponseDto> {
    const avatar = await this.avatarService.update(id, updateAvatarDto);
    return this.mapToResponse(avatar);
  }

  @Put('user/:auditoryId')
  @ApiOperation({ summary: 'Обновление аватара по ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Аватар успешно обновлен',
    type: AvatarResponseDto,
  })
  @ApiBearerAuth()
  async updateByAuditoryId(
    @Param('auditoryId') auditoryId: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ): Promise<AvatarResponseDto> {
    const avatar = await this.avatarService.updateByAuditoryId(auditoryId, updateAvatarDto);
    return this.mapToResponse(avatar);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление аватара по ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Аватар успешно удален',
  })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this.avatarService.delete(id);
  }

  @Delete('user/:auditoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление аватара по ID пользователя' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Аватар успешно удален',
  })
  @ApiBearerAuth()
  async deleteByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<void> {
    await this.avatarService.deleteByAuditoryId(auditoryId);
  }

  private mapToResponse(avatar: any): AvatarResponseDto {
    const response = new AvatarResponseDto();
    response.id = avatar.id;
    response.auditoryId = avatar.auditoryId;
    response.mimeType = avatar.mimeType;
    response.fileSize = avatar.fileSize;
    response.imageUrl = avatar.getBase64Data();
    response.createdAt = avatar.createdAt;
    response.updatedAt = avatar.updatedAt;
    return response;
  }
}
