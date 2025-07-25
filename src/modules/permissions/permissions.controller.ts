import { Controller, Get, Post, Put, Delete, Param, UseGuards, Req, Query, Body, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionListService } from './services/permission-list.service';
import { PermissionsStoreService } from './services/permissions-store.service';
import { PermissionsUpdateService } from './services/permissions-update.service';
import { PermissionsDeleteService } from './services/permissions-delete.service';

/**
 * Controller untuk menu Izin
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
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, @Query() query: any
  ): Promise<any> {
    return this.permissionListService.empLeaveLoadIzin({ ...req.globalParams, ...query, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data izin by ID
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
    return this.permissionsStoreService.store({ ...req.globalParams, ...dto, tenant, emId, startPeriode, endPeriode });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any): Promise<any> {
    // TODO: Implementasi update izin
    return { id, ...dto };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi delete izin
    return { id };
  }
}
