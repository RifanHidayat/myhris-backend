import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { ImboxController } from './imbox.controller';
import { ImboxLoadInfoService } from './services/imbox-load-info.service';
import { ImboxLoadNotifikasiService } from './services/imbox-load-notifikasi.service';
import { ImboxLoadNotifikasiApprovalService } from './services/imbox-load-notifikasi-approval-service';
import { ImboxSpesifikApprovalMultiService } from './services/imbox-spesifik-approval-multi.service';
import { ImboxLoadDataPermissionService } from './services/imbox-load-data-permission.service';
import { ImboxLoadDataCutiService } from './services/imbox-load-data-cuti.service';
import { ImboxLoadDataFieldAssignmentsService } from './services/imbox-load-data-field-assignments.service';
import { ImboxLoadDataOfficialDutyService } from './services/imbox-load-data-official-duty.service';
import { ImboxLoadDataClaimService } from './services/imbox-load-data-claim-service';
import { ImboxLoadDataAttendanceService } from './services/imbox-load-data-attendance.service';
import { ImboxLoadDataWfhService } from './services/imbox-load-data-wfh.service';
import { ImboxLoadDataLoanService } from './services/imbox-load-data-loan.service';
import { ImboxLoadDataWarningLetterService } from './services/imbox-load-data-warning-letter.service';
import { ImboxLoadDataVerbalWarmingsService } from './services/imbox-load-data-verbal-warmings.service';
import { ImboxLoadDataDayOffService } from './services/imbox-load-data-day-off.service';
import { ImboxLoadDataPayslipService } from './services/imbox-load-data-payslip.service';
import { ImboxLoadDataOvertimeService } from './services/imbox-load-data-overtime.service';
import { DbService } from '../../config/database.service';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [ImboxController],
  providers: [
    ImboxLoadInfoService,
    ImboxLoadNotifikasiService,
    ImboxLoadNotifikasiApprovalService,
    ImboxSpesifikApprovalMultiService,
    ImboxLoadDataPermissionService,
    ImboxLoadDataCutiService,
    ImboxLoadDataFieldAssignmentsService,
    ImboxLoadDataOfficialDutyService,
    ImboxLoadDataClaimService,
    ImboxLoadDataAttendanceService,
    ImboxLoadDataWfhService,
    ImboxLoadDataLoanService,
    ImboxLoadDataWarningLetterService,
    ImboxLoadDataVerbalWarmingsService,
    ImboxLoadDataDayOffService,
    ImboxLoadDataPayslipService,
    ImboxLoadDataOvertimeService,
    DbService,
  ],
})
export class ImboxModule {} 