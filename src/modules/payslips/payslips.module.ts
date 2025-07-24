import { Module } from '@nestjs/common';
import { PayslipsController } from './payslips.controller';

@Module({
  controllers: [PayslipsController],
})
export class PayslipsModule {}
