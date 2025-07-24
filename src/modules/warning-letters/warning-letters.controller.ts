import { Controller, Get } from '@nestjs/common';

/**
 * Controller untuk menu Surat Peringatan
 */
@Controller('warning-letters')
export class WarningLettersController {
  @Get('list')
  getList() {
    // TODO: Implementasi pengambilan data Surat Peringatan
    return [];
  }
}
