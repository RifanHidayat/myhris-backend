import { Module } from '@nestjs/common';
import { OfficialDutiesController } from './official-duties.controller';
import { OfficialDutiesStoreService, OfficialDutiesUpdateService, OfficialDutiesDeleteService } from './services';

@Module({
  controllers: [OfficialDutiesController],
  providers: [OfficialDutiesStoreService, OfficialDutiesUpdateService, OfficialDutiesDeleteService],
})
export class OfficialDutiesModule {} 