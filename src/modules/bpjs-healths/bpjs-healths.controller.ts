import { Controller, Get } from '@nestjs/common';

/**
 * Controller untuk menu BPJS Kesehatan
 */
@Controller('bpjs-healths')
export class BpjsHealthsController {
  @Get('list')
  getList() {
    // TODO: Implementasi pengambilan data BPJS Kesehatan
    return [];
  }
}
