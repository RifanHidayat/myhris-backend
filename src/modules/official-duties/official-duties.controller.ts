import { Controller, Get, Post, Put, Delete, Param, Headers, UseGuards, Body, Query, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OfficialDutiesListService } from './services/official-duties-list';
import { OfficialDutiesStoreService } from './services/official-duties-store.service';
import { OfficialDutiesUpdateService } from './services/official-duties-update.service';
import { OfficialDutiesDeleteService } from './services/official-duties-delete.service';
import { OfficialDutiesStoreDto, OfficialDutiesUpdateDto } from './dto';
import { GlobalParamsDto } from '../../common/dto/global-params.dto';

/**
 * Controller untuk menu Dinas Resmi
 */
@Controller('official-duties')
export class OfficialDutiesController {
  constructor(
    private readonly officialDutiesListService: OfficialDutiesListService,
    private readonly officialDutiesStoreService: OfficialDutiesStoreService,
    private readonly officialDutiesUpdateService: OfficialDutiesUpdateService,
    private readonly officialDutiesDeleteService: OfficialDutiesDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(@Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    // Extract bulan and tahun from start_periode
    const startDate = new Date(start_periode);
    const bulan = String(startDate.getMonth() + 1);
    const tahun = String(startDate.getFullYear());
    
    const params = {
      database: tenant,
      em_id,
      bulan,
      tahun,
      startPeriode: start_periode,
      endPeriode: end_periode
    };
    
    return this.officialDutiesListService.empLeaveLoadDinasLuar(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    // TODO: Implementasi pengambilan data dinas resmi by ID
    return { id, tenant, em_id, start_periode, end_periode };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(
    @Body() body: Omit<OfficialDutiesStoreDto, 'tenant' | 'em_id'>,
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, start_periode, end_periode, branch_id, em_id } = globalParams;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const storeDto: OfficialDutiesStoreDto = {
      tenant,
      em_id,
      start_periode,
      end_periode,
      ...body
    };
    
    return this.officialDutiesStoreService.storeOfficialDuties(storeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':nomor_ajuan')
  async update(
    @Param('nomor_ajuan') nomor_ajuan: string,
    @Body() body: Omit<OfficialDutiesUpdateDto, 'tenant' | 'nomor_ajuan'>,
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, start_periode, end_periode, branch_id, em_id } = globalParams;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const updateDto: OfficialDutiesUpdateDto = {
      tenant,
      nomor_ajuan,
      start_periode,
      end_periode,
      ...body
    };
    
    return this.officialDutiesUpdateService.updateOfficialDuties(updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':nomor_ajuan')
  async delete(
    @Param('nomor_ajuan') nomor_ajuan: string,
    @Query() globalParams: GlobalParamsDto,
    @Req() req: any,
  ): Promise<any> {
    const { tenant, start_periode, end_periode, branch_id, em_id } = globalParams;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    return this.officialDutiesDeleteService.deleteOfficialDuties(
      nomor_ajuan,
      tenant,
      start_periode,
      end_periode
    );
  }
}
