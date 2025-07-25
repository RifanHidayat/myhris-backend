import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { ImboxLoadInfoService } from './services/imbox-load-info.service';
import { ImboxLoadNotifikasiService } from './services/imbox-load-notifikasi.service';
import { ImboxLoadNotifikasiApprovalService } from './services/imbox-load-notifikasi-approval-service';
import { ImboxSpesifikApprovalMultiService, SpesifikApprovalMultiDto } from './services/imbox-spesifik-approval-multi.service';
import { ImboxLoadDataCutiService as ImboxLoadDataWfhService } from './services/imbox-load-data-wfh.service';
import { ImboxLoadDataCutiService as ImboxLoadDataCutiService_ } from './services/imbox-load-data-cuti.service';
import { ImboxLoadDataCutiService as ImboxLoadDataLoanService } from './services/imbox-load-data-loan.service';
import { ImboxLoadDataCutiService as ImboxLoadDataClaimService } from './services/imbox-load-data-claim-service';
import { ImboxLoadDataCutiService as ImboxLoadDataDayOffService } from './services/imbox-load-data-day-off.service';
import { ImboxLoadDataCutiService as ImboxLoadDataPayslipService } from './services/imbox-load-data-payslip.service';
import { ImboxLoadDataCutiService as ImboxLoadDataOvertimeService } from './services/imbox-load-data-overtime.service';
import { ImboxLoadDataCutiService as ImboxLoadDataAttendanceService } from './services/imbox-load-data-attendance.service';
import { ImboxLoadDataCutiService as ImboxLoadDataPermissionService } from './services/imbox-load-data-permission.service';
import { ImboxLoadDataCutiService as ImboxLoadDataOfficialDutyService } from './services/imbox-load-data-official-duty.service';
import { ImboxLoadDataCutiService as ImboxLoadDataVerbalWarmingsService } from './services/imbox-load-data-verbal-warmings.service';
import { ImboxLoadDataCutiService as ImboxLoadDataWarningLetterService } from './services/imbox-load-data-warning-letter.service';
import { ImboxLoadDataCutiService as ImboxLoadDataFieldAssignmentsService } from './services/imbox-load-data-field-assignments.service';

// Local interfaces to resolve linter errors
interface ImboxLoadInfoResultLocal {
  status: boolean;
  message: string;
  data: any[];
}

interface NotificationItemLocal {
  tanggal: string;
  notifikasi: any[];
}

interface ImboxLoadNotifikasiResultLocal {
  status: boolean;
  message: string;
  data: NotificationItemLocal[];
}

interface ImboxLoadNotifikasiApprovalResultLocal {
  status: boolean;
  message: string;
  data: NotificationItemLocal[];
}

interface SpesifikApprovalMultiResultLocal {
  status: boolean;
  message: string;
  jenis: string;
  data: any[];
}

@Controller('imbox')
export class ImboxController {
  constructor(
    private readonly imboxLoadInfoService: ImboxLoadInfoService,
    private readonly imboxLoadNotifikasiService: ImboxLoadNotifikasiService,
    private readonly imboxLoadNotifikasiApprovalService: ImboxLoadNotifikasiApprovalService,
    private readonly imboxSpesifikApprovalMultiService: ImboxSpesifikApprovalMultiService,
    private readonly imboxLoadDataOfficialDutyService: ImboxLoadDataOfficialDutyService,
    private readonly imboxLoadDataWfhService: ImboxLoadDataWfhService,
    private readonly imboxLoadDataCutiService: ImboxLoadDataCutiService_,
    private readonly imboxLoadDataLoanService: ImboxLoadDataLoanService,
    private readonly imboxLoadDataClaimService: ImboxLoadDataClaimService,
    private readonly imboxLoadDataDayOffService: ImboxLoadDataDayOffService,
    private readonly imboxLoadDataPayslipService: ImboxLoadDataPayslipService,
    private readonly imboxLoadDataOvertimeService: ImboxLoadDataOvertimeService,
    private readonly imboxLoadDataAttendanceService: ImboxLoadDataAttendanceService,
    private readonly imboxLoadDataPermissionService: ImboxLoadDataPermissionService,
    private readonly imboxLoadDataVerbalWarmingsService: ImboxLoadDataVerbalWarmingsService,
    private readonly imboxLoadDataWarningLetterService: ImboxLoadDataWarningLetterService,
    private readonly imboxLoadDataFieldAssignmentsService: ImboxLoadDataFieldAssignmentsService,
  ) {}

  @Post('load-approve-info-multi')
  async loadApproveInfoMulti(
    @Headers() headers: any,
    @Body() body: any,
    @Req() req: any,
  ): Promise<SpesifikApprovalMultiResultLocal> {
    const dto: SpesifikApprovalMultiDto = {
      database: req.query.database,
      em_id: body.em_id,
      branch_id: headers.branch_id,
      name_data: body.name_data,
      bulan: body.bulan,
      tahun: body.tahun,
      status: body.status,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };

    return await this.imboxSpesifikApprovalMultiService.spesifikApprovalMulti(dto);
  }

  @Post('load-notifikasi')
  async loadNotifikasi(
    @Headers() headers: any,
    @Body() body: any,
    @Req() req: any,
  ): Promise<ImboxLoadNotifikasiResultLocal> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      tahun: body.tahun,
      bulan: body.bulan,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };

    return await this.imboxLoadNotifikasiService.load_notifikasi(dto);
  }

  @Post('load-notifikasi-approval')
  async loadNotifikasiApproval(
    @Headers() headers: any,
    @Body() body: any,
    @Req() req: any,
  ): Promise<ImboxLoadNotifikasiApprovalResultLocal> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      tahun: body.tahun,
      bulan: body.bulan,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };

    return await this.imboxLoadNotifikasiApprovalService.load_notifikasiApproval(dto);
  }

  @Post('load-wfh')
  async loadWfh(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataWfhService.loadDataWfh(dto);
  }

  @Post('load-cuti')
  async loadCuti(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataCutiService.loadDataCuti(dto);
  }

  @Post('load-loan')
  async loadLoan(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataLoanService.loadDataLoan(dto);
  }

  @Post('load-claim')
  async loadClaim(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataClaimService.loadDataClaim(dto);
  }

  @Post('load-day-off')
  async loadDayOff(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataDayOffService.loadDataDayOff(dto);
  }

  @Post('load-payslip')
  async loadPayslip(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataPayslipService.loadDataPayslip(dto);
  }

  @Post('load-overtime')
  async loadOvertime(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataOvertimeService.loadDataAttendance(dto);
  }

  @Post('load-attendance')
  async loadAttendance(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataAttendanceService.loadDataAttendance(dto);
  }

  @Post('load-permission')
  async loadPermission(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataPermissionService.loadDataPermission(dto);
  }

  @Post('load-official-duty')
  async loadOfficialDuty(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataOfficialDutyService.loadDataOfficialDuty(dto);
  }

  @Post('load-verbal-warmings')
  async loadVerbalWarmings(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataVerbalWarmingsService.loadDataVerbalWarmings(dto);
  }

  @Post('load-warning-letter')
  async loadWarningLetter(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataWarningLetterService.loadDataWarningLetter(dto);
  }

  @Post('load-field-assignments')
  async loadFieldAssignments(@Headers() headers: any, @Body() body: any, @Req() req: any): Promise<any> {
    const dto = {
      database: req.query.database,
      em_id: body.em_id,
      start_periode: req.query.start_periode,
      end_periode: req.query.end_periode,
    };
    return await this.imboxLoadDataFieldAssignmentsService.loadDataFieldAssignments(dto);
  }
}
