import { Controller, Get, Post, Put, Patch, Delete, Body, Query, Param, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FieldAssigmentsListService } from './services/field-assigments-list';
import { FieldAssigmentsStoreService } from './services/field-assigments-store.service';
import { FieldAssigmentsUpdateService } from './services/field-assigments-update.service';
import { FieldAssigmentsDeleteService } from './services/field-assigments-delete.service';
import { FieldAssigmentsStoreDto, FieldAssigmentsUpdateDto, FieldAssigmentsPatchDto } from './dto/field-assigments.dto';
import { GlobalParamsDto } from '../../common/dto/global-params.dto';

@Controller('field-assigments')
export class FieldAssigmentsController {
  constructor(
    private readonly listService: FieldAssigmentsListService,
    private readonly storeService: FieldAssigmentsStoreService,
    private readonly updateService: FieldAssigmentsUpdateService,
    private readonly deleteService: FieldAssigmentsDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    const params = {
      ...globalParams,
      tenant,
      start_periode,
      end_periode,
      branch_id,
      em_id
    };
    
    return this.listService.list(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list-by-employee')
  async listByEmployee(@Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
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
    
    return this.listService.listByEmployeeId(em_id, tenant, start_periode, end_periode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list-all')
  async listAll(@Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    return this.listService.listAll(tenant, start_periode, end_periode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  async getDetail(@Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    const { nomor_ajuan } = globalParams;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    return this.listService.listDetailByNomorAjuan(nomor_ajuan, tenant, start_periode, end_periode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(@Body() body: FieldAssigmentsStoreDto, @Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode,branch_id,em_id} = globalParams;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!branch_id) {
      throw new BadRequestException('Branch ID parameter is required');
    }
    
    const storeData = {
      ...body,
      tenant: tenant as string,
      em_id: em_id as string,
      branch_id: branch_id as string,
      start_periode,
      end_periode
    };
    
    return this.storeService.store(storeData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':nomor_ajuan')
  async update(@Param('nomor_ajuan') nomor_ajuan: string, @Body() body: FieldAssigmentsPatchDto, @Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    
    const updateData = {
      ...body,
      nomor_ajuan,
      tenant: tenant as string,
      start_periode,
      end_periode
    };
    
    return this.updateService.updateFieldAssignment(updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':nomor_ajuan')
  async delete(@Param('nomor_ajuan') nomor_ajuan: string, @Query() globalParams: GlobalParamsDto, @Req() req: any): Promise<any> {
    const { tenant, start_periode, end_periode } = globalParams;
    const { branch_id, em_id } = req.headers;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    return this.deleteService.deleteFieldAssignment(nomor_ajuan, tenant, start_periode, end_periode);
  }
}
