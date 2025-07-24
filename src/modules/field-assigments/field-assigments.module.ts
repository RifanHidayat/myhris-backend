import { Module } from '@nestjs/common';
import { FieldAssigmentsController } from './field-assigments.controller';
import { FieldAssigmentsListService } from './services/field-assigments-list';
import { FieldAssigmentsStoreService } from './services/field-assigments-store.service';

@Module({
  controllers: [FieldAssigmentsController],
  providers: [FieldAssigmentsListService, FieldAssigmentsStoreService],
})
export class FieldAssigmentsModule {} 