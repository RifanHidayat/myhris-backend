import { Module } from '@nestjs/common';
import { OfficialDutiesController } from './official-duties.controller';
import {
  OfficialDutiesStoreService,
  OfficialDutiesUpdateService,
  OfficialDutiesDeleteService,
} from './services';
import { OfficialDutiesListService } from './services/official-duties-list';

@Module({
  controllers: [OfficialDutiesController],
  providers: [
    OfficialDutiesStoreService,
    OfficialDutiesUpdateService,
    OfficialDutiesDeleteService,
    OfficialDutiesListService,
  ],
})
export class OfficialDutiesModule {}
