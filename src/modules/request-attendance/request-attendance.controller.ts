import { Controller, Get, Post, Put, Delete, Param, Req, Body, UseGuards, Query, Headers, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestAttendanceStoreService } from './services/request-attendance-store.service';
import { RequestAttendanceUpdateService } from './services/request-attendance-update.service';
import { RequestAttendanceDeleteService } from './services/request-attendnce-delete.service';
import { RequestAttendanceListService } from './services/request-attendance-list.service';

interface RequestAttendanceDto {
  database?: string;
  em_id?: string;
  start_periode?: string;
  end_periode?: string;
  [key: string]: any;
}

@Controller('request-attendance')
export class RequestAttendanceController {
  constructor(
    private readonly requestAttendanceStoreService: RequestAttendanceStoreService,
    private readonly requestAttendanceUpdateService: RequestAttendanceUpdateService,
    private readonly requestAttendanceDeleteService: RequestAttendanceDeleteService,
    private readonly requestAttendanceListService: RequestAttendanceListService,
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
    
    return this.requestAttendanceListService.getEmployeeAttendance(params);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    // TODO: Implementasi pengambilan data request attendance by ID
    return { 
      id,
      message: 'Get by ID endpoint - implementation pending',
      globalParams: req.globalParams 
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
    @Body() dto: RequestAttendanceDto
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
    
    return this.requestAttendanceStoreService.store(params);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Req() req: any, 
    @Body() dto: RequestAttendanceDto
  ): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    const params = { 
      ...req.globalParams, 
      ...dto, 
      id 
    };
    
    return this.requestAttendanceUpdateService.update(params);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string, 
    @Req() req: any, 
    @Query() query: any
  ): Promise<any> {
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    
    const params = { 
      ...req.globalParams, 
      ...query, 
      id 
    };
    
    return this.requestAttendanceDeleteService.delete(params);
  }
} 