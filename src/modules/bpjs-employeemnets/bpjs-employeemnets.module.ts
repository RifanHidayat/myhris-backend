import { Module } from '@nestjs/common';
import { BpjsEmployeemnetsController } from './bpjs-employeemnets.controller';

@Module({
  controllers: [BpjsEmployeemnetsController],
})
export class BpjsEmployeemnetsModule {} 