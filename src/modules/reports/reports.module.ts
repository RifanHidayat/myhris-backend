import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportLeavesService } from './services/report-leaves.service';
import { ReportPermissionsService } from './services/report-permissions.service';
import { ReportFieldAssigmentService } from './services/report-field-assigment.service';
import { ReportOfficialDutyService } from './services/report-official-duty.service';
import { ReportDayOffService } from './services/report-dayoff.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportLeavesService,
    ReportPermissionsService,
    ReportFieldAssigmentService,
    ReportOfficialDutyService,
    ReportDayOffService,
  ],
})
export class ReportsModule {}
