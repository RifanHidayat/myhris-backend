import { Controller, Get, Param, Headers, UseGuards, Body, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestShiftsUpdateService } from './services/request-shifts-update.service';

/**
 * Controller untuk menu Permintaan Shift
 */
@Controller('request-shifts')
export class RequestShiftsController {
  constructor(private readonly requestShiftsUpdateService: RequestShiftsUpdateService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan data permintaan shift
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan semua data permintaan shift
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan data permintaan shift by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan detail permintaan shift by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    return this.requestShiftsUpdateService.edit({ ...dto, id, database: tenant });
  }
}
