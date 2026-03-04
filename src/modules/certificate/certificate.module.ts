import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateController } from './interfaces/http/certificate.controller';
import { CertificateDigitalController } from './interfaces/http/certificate-digital.controller';
import { CertificateService } from './application/services/certificate.service';
import { CertificateRepository } from './infra/repositories/certificate.repository.impl';
import { CertificateOrmEntity } from './infra/typeorm/certificate.orm-entity';
import { ClientOrmEntity } from '../auth/infra/typeorm/client.orm-entity';
import { AuditoryOrmEntity } from '../auth/infra/typeorm/auditory.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CertificateOrmEntity,
      ClientOrmEntity,
      AuditoryOrmEntity,
    ]),
  ],
  controllers: [CertificateController, CertificateDigitalController],
  providers: [
    CertificateService,
    {
      provide: 'ICertificateRepository',
      useClass: CertificateRepository,
    },
  ],
  exports: [
    CertificateService,
    TypeOrmModule,
  ],
})
export class CertificateModule {}