import { Controller, Get, Post, Put, Delete, Param, Body, Headers, UseGuards, Query, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestDayOffUpdateService } from './services/request-day-off.update-service';
import { RequestDayOffListService } from './services/request-day-off-list.service';
import { RequestDayOffStoreService } from './services/request-day-off-store.service';
import { RequestDayOffDeleteService } from './services/request-day-off-delete.service';

interface RequestDayOffDto {
  database?: string;
  em_id?: string;
  start_periode?: string;
  end_periode?: string;
  date?: string;
  description?: string;
  [key: string]: any;
}

@Controller('request-day-off')
export class RequestDayOffController {
  constructor(
    private readonly requestDayOffUpdateService: RequestDayOffUpdateService,
    private readonly requestDayOffListService: RequestDayOffListService,
    private readonly requestDayOffStoreService: RequestDayOffStoreService,
    private readonly requestDayOffDeleteService: RequestDayOffDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getAllData(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, 
    @Query() query: any
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    
    const params = { 
      ...req.globalParams, 
      ...query, 
      tenant, 
      emId, 
      startPeriode, 
      endPeriode 
    };
    
    return this.requestDayOffListService.dayoffIndex(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Headers('x-tenant-id') tenant: string): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    if (!tenant) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    
    // TODO: Implementasi pengambilan data day off by ID
    return { 
      id,
      tenant,
      message: 'Get by ID endpoint - implementation pending'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
    @Headers('start_periode') startPeriode: string,
    @Headers('end_periode') endPeriode: string,
    @Req() req: any, 
    @Body() dto: RequestDayOffDto
  ): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    
    const params = { 
      ...req.globalParams, 
      ...dto, 
      tenant, 
      emId, 
      startPeriode, 
      endPeriode 
    };
    
    return this.requestDayOffStoreService.dayOffInsert(params);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() dto: RequestDayOffDto, 
    @Headers('x-tenant-id') tenant: string, 
    @Headers('x-em-id') emId: string
  ): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    if (!tenant) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    
    if (!dto.description || !dto.date) {
      throw new BadRequestException('description and date are required');
    }
    
    const params = { 
      database: tenant,
      id,
      description: dto.description,
      date: dto.date
    };
    
    return this.requestDayOffUpdateService.dayOffUpdate(params);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenant: string): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    if (!tenant) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    
    const params = { 
      database: tenant, 
      id 
    };
    
    return this.requestDayOffDeleteService.deleteDayOff(params);
  }
}
