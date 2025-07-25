import { Controller, Get, Post, Put, Delete, Param, Headers, UseGuards, Body, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OfficialDutiesListService } from './services/official-duties-list';
import { OfficialDutiesStoreService } from './services/official-duties-store.service';
import { OfficialDutiesUpdateService } from './services/official-duties-update.service';
import { OfficialDutiesDeleteService } from './services/official-duties-delete.service';

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
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Query() query: any,
  ): Promise<any> {
    return this.officialDutiesListService.empLeaveLoadDinasLuar({ 
      database: tenant, 
      em_id: emId, 
      ...query 
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi pengambilan data dinas resmi by ID
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Body() dto: any,
  ): Promise<any> {
    return this.officialDutiesStoreService.kirimTidakMasukKerja({ 
      database: tenant, 
      em_id: emId, 
      ...dto 
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Body() dto: any,
  ): Promise<any> {
    // TODO: Implementasi update dinas resmi
    return { id, ...dto };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    // TODO: Implementasi delete dinas resmi
    return { id };
  }
}
