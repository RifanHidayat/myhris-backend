import { Controller, Get, Post, Put, Delete, Param, UseGuards, Body, Req, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionListService } from './services/permission-list.service';
import { PermissionsStoreService } from './services/permissions-store.service';
import { PermissionsUpdateService } from './services/permissions-update.service';
import { PermissionsDeleteService } from './services/permissions-delete.service';

/**
 * Controller untuk menu Permissions
 */
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionListService: PermissionListService,
    private readonly permissionsStoreService: PermissionsStoreService,
    private readonly permissionsUpdateService: PermissionsUpdateService,
    private readonly permissionsDeleteService: PermissionsDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any, @Query() query: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    return this.permissionListService.empLeaveLoadIzin({ 
      database: tenant, 
      em_id: emId, 
      bulan: query.bulan || '01',
      tahun: query.tahun || '2024',
      start_periode: startPeriode, 
      end_periode: endPeriode 
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data izin by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any, @Body() dto: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    return this.permissionsStoreService.store({ ...req.globalParams, ...dto, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any, @Body() dto: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    // TODO: Implementasi update permissions
    return { id, tenant, emId, startPeriode, endPeriode, ...dto };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Query('em_id') emId: string,
    @Query('start_periode') startPeriode: string,
    @Query('end_periode') endPeriode: string,
    @Req() req: any
  ): Promise<any> {
    if (!tenant || !emId) {
      throw new BadRequestException('tenant dan em_id harus disediakan');
    }
    // TODO: Implementasi delete permissions
    return { id, tenant, emId, startPeriode, endPeriode };
  }
}
