import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import * as ReportServices from './services';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportServices.ReportLeavesService,
    ReportServices.ReportPermissionsService,
    ReportServices.ReportFieldAssigmentService,
    ReportServices.ReportOfficialDutyService,
    ReportServices.ReportPayslipService,
    ReportServices.ReportAttendanceService,
    ReportServices.ReportWfhService,
    ReportServices.ReportLoanService,
    ReportServices.ReportVerbalWarningService,
    ReportServices.ReportWarningLetterService,
  ],
})
export class ReportsModule {}
