import { Controller, Get } from '@nestjs/common';

/**
 * Controller untuk menu BPJS Ketenagakerjaan
 */
@Controller('bpjs-employeemnets')
export class BpjsEmployeemnetsController {
  @Get('list')
  getList() {
    // TODO: Implementasi pengambilan data BPJS Ketenagakerjaan
    return [];
  }
} 