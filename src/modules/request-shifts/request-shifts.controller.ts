import { Controller, Get, Post, Put, Delete, Param, UseGuards, Body, Req, Query, Headers } from '@nestjs/common';
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
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Query() query: any
  ): Promise<any> {
    return this.requestShiftListService.show({ ...req.globalParams, ...query, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    return { id, tenant, emId, startPeriode, endPeriode };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Body() dto: any
  ): Promise<any> {
    return this.requestShiftsStoreService.store({ ...req.globalParams, ...dto, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Body() dto: any
  ): Promise<any> {
    return this.requestShiftsUpdateService.edit({ ...req.globalParams, ...dto, id, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    return { id, tenant, emId, startPeriode, endPeriode };
  }
}
