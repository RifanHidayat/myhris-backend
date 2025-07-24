import { Put, Param } from '@nestjs/common';
import { RequestAttendanceUpdateService } from '../../request-attendance/services/request-attendance-update.service';
import { RequestAttendanceStoreService } from '../../request-attendance/services/request-attendance-store.service';
import { RequestAttendanceDeleteService } from '../../request-attendance/services/request-attendance-delete.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Body, Headers } from '@nestjs/common';

export class RequestAttendanceController {
  constructor(
    private readonly requestAttendanceStoreService: RequestAttendanceStoreService,
    private readonly requestAttendanceUpdateService: RequestAttendanceUpdateService,
    private readonly requestAttendanceDeleteService: RequestAttendanceDeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Headers('x-tenant-id') tenant: string,
    @Headers('x-em-id') emId: string,
  ): Promise<any> {
    return this.requestAttendanceUpdateService.update({ ...dto, id, tenant, emId });
  }
} 