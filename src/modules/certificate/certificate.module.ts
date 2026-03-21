import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateController } from './interfaces/http/certificate.controller';
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
  controllers: [CertificateController],
  providers: [
    CertificateService,
    {
      provide: 'ICertificateRepository',
      useClass: CertificateRepository,
    },
  ],
  exports: [CertificateService, TypeOrmModule],
})
export class CertificateModule {}
