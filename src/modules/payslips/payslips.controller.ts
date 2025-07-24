import { Controller, Get } from '@nestjs/common';

/**
 * Controller untuk menu Slip Gaji
 */
@Controller('payslips')
export class PayslipsController {
  @Get('list')
  getList() {
    // TODO: Implementasi pengambilan data slip gaji
    return [];
  }
}
