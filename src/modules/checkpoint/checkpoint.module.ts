import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckpointController } from './interfaces/http/checkpoint.controller';
import { CheckpointService } from './application/services/checkpoint.service';
import { CheckpointFacade } from './application/facades/checkpoint.facade';
import { CheckpointRepository } from './infra/repositories/checkpoint.repository.impl';
import { CheckpointOrmEntity } from './infra/typeorm/checkpoint.orm-entity';
import { MapElementOrmEntity } from '../map/infra/typeorm/map-element.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckpointOrmEntity, MapElementOrmEntity]),
  ],
  controllers: [CheckpointController],
  providers: [
    CheckpointService,
    CheckpointFacade,
    {
      provide: 'ICheckpointRepository',
      useClass: CheckpointRepository,
    },
  ],
  exports: [CheckpointService, CheckpointFacade],
})
export class CheckpointModule {}
