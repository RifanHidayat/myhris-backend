import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

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
    private readonly imboxLoadDataPermissionService: any,
    private readonly imboxLoadDataCutiService: any,
    private readonly imboxLoadDataFieldAssignmentsService: any,
    private readonly imboxLoadDataOfficialDutyService: any,
    private readonly imboxLoadDataClaimService: any,
    private readonly imboxLoadDataAttendanceService: any,
    private readonly imboxLoadDataWfhService: any,
    private readonly imboxLoadDataLoanService: any,
    private readonly imboxLoadDataWarningLetterService: any,
    private readonly imboxLoadDataVerbalWarmingsService: any,
    private readonly imboxLoadDataDayOffService: any,
    private readonly imboxLoadDataRequestShiftService: any,
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
      } else if (url_data == 'request_shift') {
        result = await this.imboxLoadDataRequestShiftService.loadDataRequestShift({
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