import { Controller, Get, Req, Query } from '@nestjs/common';
import { PayslipListService } from './services/payslip-list.service';

/**
 * Controller untuk menu Slip Gaji
 */
@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payslipListService: PayslipListService) {}

  @Get('list')
  async getList(@Req() req, @Query() query): Promise<any> {
    return this.payslipListService.slipGaji({ ...req.globalParams, ...query });
  }
}
