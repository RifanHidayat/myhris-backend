import { Put, Param, Req, Body, UseGuards, Controller } from '@nestjs/common';
import { RequestAttendanceUpdateService } from '../../request-attendance/services/request-attendance-update.service';
import { RequestAttendanceStoreService } from '../../request-attendance/services/request-attendance-store.service';
import { RequestAttendanceDeleteService } from '../../request-attendance/services/request-attendance-delete.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

@Controller('request-attendance')
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
    @Req() req: any,
    @Body() dto: any,
  ): Promise<any> {
    return this.requestAttendanceUpdateService.update({ ...req.globalParams, ...dto, id });
  }
} 