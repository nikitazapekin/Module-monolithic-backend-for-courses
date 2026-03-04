import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICertificateRepository } from '../../domain/interfaces/certificate.repository.interface';
import { Certificate } from '../../domain/entities/certificate.entity';
import { CreateCertificateDto } from '../dtos/create-certificate.dto';
import { UpdateCertificateDto } from '../dtos/update-certificate.dto';
import { ClientOrmEntity } from '../../../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../../../auth/infra/typeorm/auditory.orm-entity';

@Injectable()
export class CertificateService {
  constructor(
    @Inject('ICertificateRepository')
    private readonly certificateRepository: ICertificateRepository,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
  ) {}

  /**
   * Get clientId from auditoryId
   */
  private async getClientIdFromAuditoryId(auditoryId: string): Promise<string> {
    const client = await this.clientRepository.findOne({
      where: { auditoryId },
    });

    if (!client) {
      throw new NotFoundException(`Client with auditory ID ${auditoryId} not found`);
    }

    return client.id;
  }

  /**
   * Generate certificate image using Puppeteer
   */
  private async generateCertificateImage(
    studentName: string,
    courseName: string,
    date: string,
    certificateUrl: string,
  ): Promise<string> {
    try {
      const puppeteer = await import('puppeteer');

      const html = this.createCertificateHTML(studentName, courseName, date, certificateUrl);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2,
      });

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Wait for images to load
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            }))
        );
      }).catch(() => console.log('⚠️ Some images failed to load, continuing...'));

      const screenshot = await page.screenshot({
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
        },
      });

      await browser.close();

      // Convert buffer to base64 (without prefix)
      return Buffer.from(screenshot).toString('base64');
    } catch (error) {
      console.error('Error generating certificate image:', error);
      throw new BadRequestException('Failed to generate certificate image');
    }
  }

  /**
   * Create HTML template for certificate
   */
  private createCertificateHTML(
    name: string,
    course: string,
    date: string,
    certificateUrl: string,
  ): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 1200px;
            height: 800px;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f0f0;
        }

        .card {
            max-width: 1200px;
            width: 100%;
            background-color: #fff;
            min-height: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            border: 2px solid black;
            position: relative;
            overflow: hidden;
        }

        .triangle-left {
            position: absolute;
            left: 0;
            top: 0;
            width: 0;
            height: 0;
            border-top: 300px solid black;
            border-right: 200px solid transparent;
            z-index: 1;
        }

        .triangle-right {
            position: absolute;
            right: 0;
            top: 0;
            width: 0;
            height: 0;
            border-top: 300px solid black;
            border-left: 200px solid transparent;
            z-index: 1;
        }

        .content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 100%;
            width: 100%;
        }

        .footer {
            padding: 20px;
            margin-top: auto;
            background-color: #303027;
            color: #fff;
            font-size: 20px;
            z-index: 2;
            position: relative;
            word-break: break-all;
        }

        .preview {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 100%;
            gap: 20px;
            align-items: center;
            justify-content: center;
            flex: 1;
            position: relative;
            z-index: 2;
            padding: 20px;
        }

        .images {
            width: 100%;
            display: flex;
            justify-content: space-between;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
            pointer-events: none;
        }

        .img1 {
            margin-left: 30px;
            transform: rotate(-15deg);
        }
        
        .img {
            width: 200px;
            height: 200px;
            object-fit: contain;
        }
        
        .img2 {
            margin-right: 30px;
            transform: rotate(15deg);
        }

        .title {
            font-size: 40px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .cert {
            font-size: 32px;
            font-weight: normal;
            margin-bottom: 20px;
        }

        .this {
            font-size: 24px;
            font-weight: normal;
            margin-top: 20px;
        }

        .name {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            margin: 15px 0;
            text-align: center;
        }

        .competed {
            font-size: 24px;
            font-weight: normal;
            margin-top: 20px;
        }

        .course {
            font-size: 32px;
            font-weight: bold;
            color: #3498db;
            margin: 15px 0;
            text-align: center;
        }
    

        .date {
            font-size: 28px;
            font-weight: bold;
            color: #e67e22;
            margin: 10px 0;
        }
        
        .footer a {
            color: #fff;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .footer a:visited {
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="triangle-left"></div>
        <div class="triangle-right"></div>
        
        <div class="content">
            <div class="preview">
                <h1 class="title">AlgoLAB</h1>
                <h2 class="cert">Certificate of completion</h2>

                <p class="this">THIS IS TO CERTIFY THAT:</p>

                <p class="name">${name}</p>

                <p class="competed">HAS SUCCESSFULLY COMPLETED</p>

                <p class="course">${course}</p>
                
                <h3 class="date">${date}</h3>

                <div class="images">
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="star" class="img1 img" />
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="logo" class="img2 img" />
                </div>
            </div>
            <div class="footer">
                <p>
                    Digital version: <br />
                    <a href="${certificateUrl}" target="_blank">${certificateUrl}</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate certificate URL (для отображения PNG)
   */
  private generateCertificateUrl(certificateId: string): string {
    // Используем переменную окружения или localhost по умолчанию
    const baseUrl = process.env.API_URL || 'http://localhost:3002';
    return `${baseUrl}/certificates/${certificateId}`;
  }

  async create(createCertificateDto: CreateCertificateDto): Promise<Certificate> {
    try {
      // Получаем clientId из auditoryId
      const clientId = await this.getClientIdFromAuditoryId(createCertificateDto.auditoryId);

      const date = new Date(createCertificateDto.date);
      
      // Генерируем временный URL для вставки в HTML
      const tempId = `temp_${Date.now()}`;
      const tempCertificateUrl = this.generateCertificateUrl(tempId);

      // Генерируем изображение сертификата
      const base64Image = await this.generateCertificateImage(
        createCertificateDto.studentName,
        createCertificateDto.courseName,
        createCertificateDto.date,
        tempCertificateUrl,
      );

      // Создаем сущность сертификата (без digital URL)
      const certificate = new Certificate(
        clientId,
        date,
        base64Image,
        '', // временно пусто
      );

      // Сохраняем сертификат
      const saved = await this.certificateRepository.save(certificate);

      // Генерируем реальный URL с ID сохраненного сертификата
      const actualCertificateUrl = this.generateCertificateUrl(saved.id);
      
      // Обновляем digital URL с реальным ID
      await this.certificateRepository.update(saved.id, { 
        digital: actualCertificateUrl 
      });

      console.log(`Certificate created successfully with ID: ${saved.id}`);
      
      return this.findById(saved.id);
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw new BadRequestException(`Failed to create certificate: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async findByClientId(clientId: string): Promise<Certificate[]> {
    return this.certificateRepository.findByClientId(clientId);
  }

  async findByAuditoryId(auditoryId: string): Promise<Certificate[]> {
    return this.certificateRepository.findByAuditoryId(auditoryId);
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    const updates: Partial<Certificate> = {};

    if (updateCertificateDto.date) {
      updates.date = new Date(updateCertificateDto.date);
    }

    if (updateCertificateDto.url) {
      updates.url = updateCertificateDto.url;
    }

    if (updateCertificateDto.digital) {
      updates.digital = updateCertificateDto.digital;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await this.certificateRepository.update(id, updates);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const certificate = await this.certificateRepository.findById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return this.certificateRepository.delete(id);
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    return this.certificateRepository.deleteByClientId(clientId);
  }

  /**
   * Проверка валидности base64 изображения
   */
  validateBase64Image(base64String: string): boolean {
    try {
      const buffer = Buffer.from(base64String, 'base64');
      return buffer.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Получение размера изображения в байтах
   */
  getImageSize(id: string): Promise<number> {
    return this.findById(id).then(cert => 
      Buffer.from(cert.url, 'base64').length
    );
  }
}