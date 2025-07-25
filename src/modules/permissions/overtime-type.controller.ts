import { Controller, Get, Param, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OvertimeTypeService } from './services/overtime-type.service';

interface OvertimeTypeResult {
  status: boolean;
  message: string;
  data: any[];
}

@Controller('overtime-types')
export class OvertimeTypeController {
  constructor(
    private readonly overtimeTypeService: OvertimeTypeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOvertimeTypes(
    @Headers('x-tenant-id') tenant: string,
  ): Promise<OvertimeTypeResult> {
    return this.overtimeTypeService.getOvertimeTypes({
      database: tenant,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOvertimeTypeById(
    @Headers('x-tenant-id') tenant: string,
    @Param('id') id: string,
  ): Promise<OvertimeTypeResult> {
    return this.overtimeTypeService.getOvertimeTypeById({
      database: tenant,
      id: parseInt(id),
    });
  }
} 