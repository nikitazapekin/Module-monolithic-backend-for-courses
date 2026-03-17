import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from '../../application/services/certificate.service';

@ApiTags('certificates-digital')
@Controller('certificates')
export class CertificateDigitalController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get('digital/:id')
  @ApiOperation({ summary: 'Скачивание PSD версии сертификата' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PSD файл сертификата',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Сертификат не найден',
  })
  async downloadPsd(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Убираем .psd если есть
      const cleanId = id.replace('.psd', '');

      const certificate = await this.certificateService.findById(cleanId);
      const imageBuffer = Buffer.from(certificate.url, 'base64');

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificate_${cleanId}.psd"`,
      );
      res.setHeader('Content-Length', imageBuffer.length);

      res.status(HttpStatus.OK).send(imageBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Certificate not found',
          error: 'Not Found',
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
      }
    }
  }

  @Get('view/:id')
  @ApiOperation({ summary: 'Просмотр сертификата как изображения' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Изображение сертификата',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Сертификат не найден',
  })
  async viewCertificate(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const certificate = await this.certificateService.findById(id);
      const imageBuffer = Buffer.from(certificate.url, 'base64');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      res.status(HttpStatus.OK).send(imageBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Certificate not found',
          error: 'Not Found',
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
      }
    }
  }
}
