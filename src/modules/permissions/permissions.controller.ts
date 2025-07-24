import { Controller, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionListService } from './services/permission-list.service';

/**
 * Controller untuk menu Izin
 */
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionListService: PermissionListService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(@Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data izin
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(@Req() req: any, @Query() query: any): Promise<any> {
    return this.permissionListService.empLeaveLoadIzin({ ...req.globalParams, ...query });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data izin by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan detail izin by ID
    return { id };
  }
}
