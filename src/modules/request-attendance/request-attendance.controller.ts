import { Controller, Get, Post, Put, Delete, Param, Req, Body, UseGuards, Query, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequestAttendanceStoreService } from './services/request-attendance-store.service';
import { RequestAttendanceUpdateService } from './services/request-attendance-update.service';
import { RequestAttendanceDeleteService } from './services/request-attendnce-delete.service';
import { RequestAttendanceListService } from './services/request-attendance-list.service';

@Controller('request-attendance')
export class RequestAttendanceController {
  constructor(
    private readonly requestAttendanceStoreService: RequestAttendanceStoreService,
    private readonly requestAttendanceUpdateService: RequestAttendanceUpdateService,
    private readonly requestAttendanceDeleteService: RequestAttendanceDeleteService,
    private readonly requestAttendanceListService: RequestAttendanceListService,
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
    return this.requestAttendanceListService.show({ ...req.globalParams, ...query, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data request attendance by ID
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
    return this.requestAttendanceStoreService.store({ ...req.globalParams, ...dto, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any): Promise<any> {
    return this.requestAttendanceUpdateService.update({ ...req.globalParams, ...dto, id });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any, @Query() query: any): Promise<any> {
    return this.requestAttendanceDeleteService.delete({ ...req.globalParams, ...query, id });
  }
} 