import { Module } from '@nestjs/common';
import { WarningLettersController } from './warning-letters.controller';

@Module({
  controllers: [WarningLettersController],
})
export class WarningLettersModule {}
