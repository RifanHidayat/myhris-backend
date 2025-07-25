import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface FieldAssigmentsListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  branch_id?: string;
  start_periode?: string;
  end_periode?: string;
  tenant?: string;
  emId?: string;
  [key: string]: any;
}

@Injectable()
export class FieldAssigmentsListService {
  constructor(private readonly dbService: DbService) {}

  async list(dto: FieldAssigmentsListDto): Promise<any> {
    const {
      database,
      em_id,
      bulan,
      tahun,
      branch_id,
      start_periode,
      end_periode,
      tenant,
      emId,
    } = dto;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length === 1) {
      convertBulan = parseInt(bulan, 10) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const startPeriode = start_periode || '2024-02-03';
    const endPeriode = end_periode || '2024-02-03';
    const array1 = startPeriode.split('-');
    const array2 = endPeriode.split('-');
    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      let url;
      if (true) {
        // Sederhanakan, logika bisa dioptimasi
        url = `SELECT emp_labor.status as leave_status, emp_labor.*,overtime.name as type,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') ORDER BY id DESC`;
        if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
          url = `SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${startPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')  AND branch_id='${branch_id}'  UNION ALL SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${endPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND ( tgl_ajuan<='${endPeriode}')  AND branch_id='${branch_id}' ORDER BY idd`;
        }
      }
      const [results] = await trx.raw(url);
      await trx.commit();
      return {
        status: true,
        message: 'Berhasil ambil data tugas luar',
        data: results,
      };
    } catch (e) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException(e);
    }
  }
}
