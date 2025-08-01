import { Module } from '@nestjs/common';
import { FieldAssigmentsController } from './field-assigments.controller';
import { FieldAssigmentsListService } from './services/field-assigments-list';
import { FieldAssigmentsStoreService } from './services/field-assigments-store.service';
import { FieldAssigmentsUpdateService } from './services/field-assigments-update.service';
import { FieldAssigmentsDeleteService } from './services/field-assigments-delete.service';
import { DbService } from '../../config/database.service';

@Module({
  controllers: [FieldAssigmentsController],
  providers: [
    FieldAssigmentsListService, 
    FieldAssigmentsStoreService,
    FieldAssigmentsUpdateService,
    FieldAssigmentsDeleteService,
    DbService
  ],
})
export class FieldAssigmentsModule {}
