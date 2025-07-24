import { Module } from '@nestjs/common';
import { OvertimesController } from './overtimes.controller';
import { OvertimesStoreService, OvertimesUpdateService, OvertimesDeleteService } from './services';

@Module({
  controllers: [OvertimesController],
  providers: [OvertimesStoreService, OvertimesUpdateService, OvertimesDeleteService],
})
export class OvertimesModule {} 