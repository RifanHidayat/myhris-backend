import { Controller, Get, Post, Put, Delete, Param, UseGuards, Body, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OvertimesUpdateService } from './services/overtimes-update.service';
import { OvertimesStoreService } from './services/overtimes-store.service';
import { OvertimesDeleteService } from './services/overtimes-delete.service';

/**
 * Controller untuk menu Lembur
 */
@Controller('overtimes')
export class OvertimesController {
  constructor(
    private readonly overtimesUpdateService: OvertimesUpdateService,
    private readonly overtimesStoreService: OvertimesStoreService,
    private readonly overtimesDeleteService: OvertimesDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(@Req() req: any, @Query() query: any): Promise<any> {
    // TODO: Implementasi pengambilan semua data lembur
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi pengambilan data lembur by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(@Req() req: any, @Body() dto: any): Promise<any> {
    // TODO: Implementasi store lembur
    return { ...req.globalParams, ...dto };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any): Promise<any> {
    return this.overtimesUpdateService.updateLembur({ ...req.globalParams, ...dto, id });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any): Promise<any> {
    // TODO: Implementasi delete lembur
    return { id };
  }
}
