import { Controller, Get, Post, Body, Query, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InfoService } from './services/info.service';
import { LogActivitySearchService } from './services/log-activity-search.service';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly infoService: InfoService,
    private readonly logActivitySearchService: LogActivitySearchService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('info-activity')
  async getInfoActivity(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Body() body: any,
    @Query() query: any,
  ): Promise<any> {
    return this.infoService.info_aktifitas_employee({
      database: tenant,
      em_id: emId,
      bulan: body.bulan,
      tahun: body.tahun,
      start_date: query.start_date,
      end_date: query.end_date,
      start_periode: startPeriode,
      end_periode: endPeriode,
    });
  }



  @UseGuards(JwtAuthGuard)
  @Post('log-activity-search')
  async searchLogActivity(
    @Headers('x-tenant-id') tenant: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Body() body: any,
  ): Promise<any> {
    return this.logActivitySearchService.pencarian_aktifitas({
      database: tenant,
      em_id: body.em_id,
      cari: body.cari,
      start_periode: startPeriode,
      end_periode: endPeriode,
    });
  }
} 