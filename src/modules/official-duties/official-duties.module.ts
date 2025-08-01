import { Module } from '@nestjs/common';
import { OfficialDutiesController } from './official-duties.controller';
import {
  OfficialDutiesStoreService,
  OfficialDutiesUpdateService,
  OfficialDutiesDeleteService,
} from './services';
import { OfficialDutiesListService } from './services/official-duties-list';
import { DbService } from '../../config/database.service';

@Module({
  controllers: [OfficialDutiesController],
  providers: [
    OfficialDutiesStoreService,
    OfficialDutiesUpdateService,
    OfficialDutiesDeleteService,
    OfficialDutiesListService,
    DbService,
  ],
})
export class OfficialDutiesModule {}
