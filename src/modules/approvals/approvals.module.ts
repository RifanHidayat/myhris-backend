import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller';
import * as ApprovalServices from './services';

@Module({
  controllers: [ApprovalsController],
  providers: [
    ApprovalServices.ApprovalLeavesService,
    ApprovalServices.ApprovalPermissionsService,
    ApprovalServices.ApprovalFieldAssigmentService,
    ApprovalServices.ApprovalOfficialDutyService,
    ApprovalServices.ApprovalPayslipService,
    ApprovalServices.ApprovalAttendanceService,
    ApprovalServices.ApprovalWfhService,
    ApprovalServices.ApprovalLoanService,
    ApprovalServices.ApprovalVerbalWarningService,
    ApprovalServices.ApprovalWarningLetterService,
  ],
})
export class ApprovalsModule {} 