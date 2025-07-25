import { Controller, Get, Post, Put, Delete, Param, Body, Headers, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestDayOffUpdateService } from './services/request-day-off.update-service';
import { RequestDayOffListService } from './services/request-day-off-list.service';
import { RequestDayOffStoreService } from './services/request-day-off-store.service';
import { RequestDayOffDeleteService } from './services/request-day-off-delete.service';

@Controller('request-day-off')
export class RequestDayOffController {
  constructor(
    private readonly requestDayOffUpdateService: RequestDayOffUpdateService,
    private readonly requestDayOffListService: RequestDayOffListService,
    private readonly requestDayOffStoreService: RequestDayOffStoreService,
    private readonly requestDayOffDeleteService: RequestDayOffDeleteService,
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
    return this.requestDayOffListService.show({ ...req.globalParams, ...query, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Headers('x-tenant-id') tenant: string): Promise<any> {
    // TODO: Implementasi pengambilan data day off by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Body() dto: any
  ): Promise<any> {
    return this.requestDayOffStoreService.store({ ...req.globalParams, ...dto, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Headers('x-tenant-id') tenant: string, @Headers('x-em-id') emId: string): Promise<any> {
    return this.requestDayOffUpdateService.dayOffUpdate({ ...dto, id, database: tenant });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenant: string): Promise<any> {
    return this.requestDayOffDeleteService.deleteDayOff({ database: tenant, id });
  }
}
