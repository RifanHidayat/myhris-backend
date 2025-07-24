import { Controller, Body, Post, Req } from '@nestjs/common';
import { ReportPermissionsService } from './services/report-permissions.service';
import { ReportLeavesService } from './services/report-leaves.service';
import { ReportFieldAssigmentService } from './services/report-field-assigment.service';
import { ReportOfficialDutyService } from './services/report-official-duty.service';
import { ReportDayOffService } from './services/report-dayoff.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportPermissionsService: ReportPermissionsService,
    private readonly reportLeavesService: ReportLeavesService,
    private readonly reportFieldAssigmentService: ReportFieldAssigmentService,
    private readonly reportOfficialDutyService: ReportOfficialDutyService,
    private readonly reportDayOffService: ReportDayOffService,
  ) {}

  @Post('tidak-hadir')
  async laporanTidakHadir(@Req() req: any, @Body() body: any) {
    return this.reportPermissionsService.loadLaporanPengajuanTidakHadir({ ...req.globalParams, ...body });
  }

  @Post('cuti')
  async laporanCuti(@Req() req: any, @Body() body: any) {
    return this.reportLeavesService.loadLaporanPengajuanCuti({ ...req.globalParams, ...body });
  }

  @Post('tugas-luar')
  async laporanTugasLuar(@Req() req: any, @Body() body: any) {
    return this.reportFieldAssigmentService.loadLaporanPengajuanTugasLuar({ ...req.globalParams, ...body });
  }

  @Post('dinas-luar')
  async laporanDinasLuar(@Req() req: any, @Body() body: any) {
    return this.reportOfficialDutyService.loadLaporanPengajuanDinasLuar({ ...req.globalParams, ...body });
  }

  @Post('dayoff')
  async laporanDayOff(@Req() req: any, @Body() body: any) {
    return this.reportDayOffService.loadLaporanPengajuanDayOff({ ...req.globalParams, ...body });
  }
}
