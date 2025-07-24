import { Controller, Get } from '@nestjs/common';

/**
 * Controller untuk menu Teguran Lisan
 */
@Controller('verbal-warnings')
export class VerbalWarningsController {
  @Get('list')
  getList() {
    // TODO: Implementasi pengambilan data Teguran Lisan
    return [];
  }
} 