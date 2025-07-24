import { Controller, Get, Param, UseGuards, Body, Put, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestShiftsUpdateService } from './services/request-shifts-update.service';
import { RequestShiftsStoreService } from './services/request-shifts-store.service';
import { RequestShiftListService } from './services/request-shift-list.service';
import { RequestShiftsDeleteService } from './services/request-shifts-delete.service';

/**
 * Controller untuk menu Permintaan Shift
 */
@Controller('request-shifts')
export class RequestShiftsController {
  constructor(
    private readonly requestShiftsUpdateService: RequestShiftsUpdateService,
    private readonly requestShiftsStoreService: RequestShiftsStoreService,
    private readonly requestShiftListService: RequestShiftListService,
    private readonly requestShiftsDeleteService: RequestShiftsDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(@Req() req: any, @Query() query: any): Promise<any> {
    // TODO: Implementasi pengambilan data permintaan shift
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(@Req() req: any, @Query() query: any): Promise<any> {
    // TODO: Implementasi pengambilan semua data permintaan shift
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data permintaan shift by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan detail permintaan shift by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any): Promise<any> {
    return this.requestShiftsUpdateService.edit({ ...req.globalParams, ...dto, id });
  }
}
