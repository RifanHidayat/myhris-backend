import { Module } from '@nestjs/common';
import { VerbalWarningsController } from './verbal-warnings.controller';

@Module({
  controllers: [VerbalWarningsController],
})
export class VerbalWarningsModule {} 