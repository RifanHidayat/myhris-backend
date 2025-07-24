import { Controller, Get, Param, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller untuk menu Tugas Harian
 */
@Controller('daily-tasks')
export class DailyTasksController {
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan data tugas harian
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('x-branch-id') branchId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan semua data tugas harian
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan data tugas harian by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async getByIdDetail(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan detail tugas harian by ID
    return { id };
  }
}
