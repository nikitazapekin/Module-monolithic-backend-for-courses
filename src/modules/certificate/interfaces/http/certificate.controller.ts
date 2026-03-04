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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CertificateService } from '../../application/services/certificate.service';
import { CreateCertificateDto } from '../../application/dtos/create-certificate.dto';
import { UpdateCertificateDto } from '../../application/dtos/update-certificate.dto';
import { CertificateResponseDto } from '../../application/dtos/certificate-response.dto';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание нового сертификата' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Сертификат успешно создан',
    type: CertificateResponseDto,
  })
  @ApiBearerAuth()
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.create(createCertificateDto);
    return this.mapToResponse(certificate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение сертификата по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сертификат найден',
    type: CertificateResponseDto,
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.findById(id);
    return this.mapToResponse(certificate);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получение всех сертификатов клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сертификаты найдены',
    type: [CertificateResponseDto],
  })
  @ApiBearerAuth()
  async findByClientId(@Param('clientId') clientId: string): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findByClientId(clientId);
    return certificates.map(cert => this.mapToResponse(cert));
  }

  @Get('auditory/:auditoryId')
  @ApiOperation({ summary: 'Получение всех сертификатов по auditoryId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сертификаты найдены',
    type: [CertificateResponseDto],
  })
  @ApiBearerAuth()
  async findByAuditoryId(@Param('auditoryId') auditoryId: string): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findByAuditoryId(auditoryId);
    return certificates.map(cert => this.mapToResponse(cert));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление сертификата по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сертификат успешно обновлен',
    type: CertificateResponseDto,
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.update(id, updateCertificateDto);
    return this.mapToResponse(certificate);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление сертификата по ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Сертификат успешно удален',
  })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this.certificateService.delete(id);
  }

  @Delete('client/:clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление всех сертификатов клиента по clientId' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Сертификаты успешно удалены',
  })
  @ApiBearerAuth()
  async deleteByClientId(@Param('clientId') clientId: string): Promise<void> {
    await this.certificateService.deleteByClientId(clientId);
  }

  private mapToResponse(certificate: any): CertificateResponseDto {
    const response = new CertificateResponseDto();
    response.id = certificate.id;
    response.clientId = certificate.clientId;
    response.date = certificate.date;
    response.url = certificate.getBase64Data();
    response.digital = certificate.digital;
    response.viewUrl = `http://localhost:3002/certificates/view/${certificate.id}`;
    response.createdAt = certificate.createdAt;
    response.updatedAt = certificate.updatedAt;
    return response;
  }
}