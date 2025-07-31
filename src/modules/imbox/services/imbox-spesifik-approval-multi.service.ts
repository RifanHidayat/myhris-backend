import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { ImboxLoadDataPermissionService } from './imbox-load-data-permission.service';
import { ImboxLoadDataCutiService } from './imbox-load-data-cuti.service';
import { ImboxLoadDataFieldAssignmentsService } from './imbox-load-data-field-assignments.service';
import { ImboxLoadDataOfficialDutyService } from './imbox-load-data-official-duty.service';
import { ImboxLoadDataClaimService } from './imbox-load-data-claim-service';
import { ImboxLoadDataAttendanceService } from './imbox-load-data-attendance.service';
import { ImboxLoadDataWfhService } from './imbox-load-data-wfh.service';
import { ImboxLoadDataLoanService } from './imbox-load-data-loan.service';
import { ImboxLoadDataWarningLetterService } from './imbox-load-data-warning-letter.service';
import { ImboxLoadDataVerbalWarmingsService } from './imbox-load-data-verbal-warmings.service';
import { ImboxLoadDataDayOffService } from './imbox-load-data-day-off.service';

export interface SpesifikApprovalMultiDto {
  database: string;
  em_id: string;
  branch_id: string;
  name_data: string;
  bulan: string;
  tahun: string;
  status?: string;
  start_periode?: string;
  end_periode?: string;
}

export interface SpesifikApprovalMultiResult {
  status: boolean;
  message: string;
  jenis: string;
  data: any[];
}

@Injectable()
export class ImboxSpesifikApprovalMultiService {
  constructor(
    private readonly dbService: DbService,
    private readonly imboxLoadDataPermissionService: ImboxLoadDataPermissionService,
    private readonly imboxLoadDataCutiService: ImboxLoadDataCutiService,
    private readonly imboxLoadDataFieldAssignmentsService: ImboxLoadDataFieldAssignmentsService,
    private readonly imboxLoadDataOfficialDutyService: ImboxLoadDataOfficialDutyService,
    private readonly imboxLoadDataClaimService: ImboxLoadDataClaimService,
    private readonly imboxLoadDataAttendanceService: ImboxLoadDataAttendanceService,
    private readonly imboxLoadDataWfhService: ImboxLoadDataWfhService,
    private readonly imboxLoadDataLoanService: ImboxLoadDataLoanService,
    private readonly imboxLoadDataWarningLetterService: ImboxLoadDataWarningLetterService,
    private readonly imboxLoadDataVerbalWarmingsService: ImboxLoadDataVerbalWarmingsService,
    private readonly imboxLoadDataDayOffService: ImboxLoadDataDayOffService,
  ) {}

  async spesifikApprovalMulti(dto: SpesifikApprovalMultiDto): Promise<SpesifikApprovalMultiResult> {
    console.log("-----spesifik approval multi approvedd----------");
    
    const {
      database,
      em_id,
      branch_id,
      name_data,
      bulan,
      tahun,
      status = "Pending",
      start_periode = "2024-02-03",
      end_periode = "2024-02-03"
    } = dto;

    const url_data = name_data;
    const getbulan = bulan;
    const gettahun = tahun;
    const stauts = status == undefined ? "Pending" : status == "pending" ? "Pending" : status;

    console.log(dto);

    try {
      let result;

      if (url_data == "cuti") {
        result = await this.imboxLoadDataCutiService.loadDataCuti({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "tidak_hadir") {
        result = await this.imboxLoadDataPermissionService.loadDataPermission({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "lembur") {
        result = await this.imboxLoadDataFieldAssignmentsService.loadDataFieldAssignments({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "tugas_luar") {
        result = await this.imboxLoadDataOfficialDutyService.loadDataOfficialDuty({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "dinas_luar") {
        result = await this.imboxLoadDataClaimService.loadDataClaim({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "klaim") {
        result = await this.imboxLoadDataClaimService.loadDataClaim({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "absensi") {
        result = await this.imboxLoadDataAttendanceService.loadDataAttendance({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "wfh") {
        result = await this.imboxLoadDataWfhService.loadDataWfh({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "kasbon") {
        result = await this.imboxLoadDataLoanService.loadDataLoan({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "surat_peringatan") {
        result = await this.imboxLoadDataWarningLetterService.loadDataWarningLetter({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == "teguran_lisan") {
        result = await this.imboxLoadDataVerbalWarmingsService.loadDataVerbalWarmings({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else if (url_data == 'dayoff') {
        result = await this.imboxLoadDataDayOffService.loadDataDayOff({
          database,
          em_id,
          branch_id,
          bulan: getbulan,
          tahun: gettahun,
          status: stauts,
          start_periode,
          end_periode
        });
      } else {
        throw new InternalServerErrorException(`Unknown url_data: ${url_data}`);
      }

      return {
        status: true,
        message: `Berhasil ambil data approve ${url_data}!`,
        jenis: url_data,
        data: result
      };

    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException("Gagal ambil data");
    }
  }
} 