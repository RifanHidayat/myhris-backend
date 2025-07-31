import { Controller, Get, Post, Body, Query, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InfoService } from './services/info.service';
import { LogActivitySearchService } from './services/log-activity-search.service';
import { GlobalQueryParamsDto } from '../../common/dto/global-params.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly infoService: InfoService,
    private readonly logActivitySearchService: LogActivitySearchService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('info-activity')
  async getInfoActivity(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }

    return this.infoService.info_aktifitas_employee({
      tenant: tenant,
      em_id: emId,
      start_periode: startPeriode,
      end_periode: endPeriode,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('log-activity-search')
  async searchLogActivity(
    @Query('tenant') tenant: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Query('em_id') emId: string,
    @Query('search') search: string,
 
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('tenant harus disediakan');
    }

    return this.logActivitySearchService.pencarian_aktifitas({
      database: tenant,
      em_id: emId,
      search: search,
      start_periode: startPeriode,
      end_periode: endPeriode,
    });
  }

  // Contoh penggunaan GlobalQueryParamsDto untuk parameter optional
  @UseGuards(JwtAuthGuard)
  @Get('example-global-params')
  async exampleGlobalParams(
    @Query() queryParams: GlobalQueryParamsDto,
  ): Promise<any> {
    // Parameter optional, perlu validasi manual
    if (!queryParams.tenant) {
      throw new BadRequestException('tenant harus disediakan');
    }

    return {
      message: 'Contoh penggunaan GlobalQueryParamsDto',
      tenant: queryParams.tenant,
      em_id: queryParams.em_id,
      start_periode: queryParams.start_periode,
      end_periode: queryParams.end_periode,
    };
  }
} 