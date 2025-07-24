import { Module } from '@nestjs/common';
import { BpjsHealthsController } from './bpjs-healths.controller';

@Module({
  controllers: [BpjsHealthsController],
})
export class BpjsHealthsModule {} 