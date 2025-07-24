import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

@Injectable()
export class OfficialDutiesListService {
  constructor(private readonly dbService: DbService) {}

  async empLeaveLoadDinasLuar(params: {
    database: string;
    em_id: string;
    bulan: string;
    tahun: string;
    startPeriode?: string;
    endPeriode?: string;
  }): Promise<any> {
    const { database, em_id, bulan, tahun, startPeriode, endPeriode } = params;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = bulan.length === 1 ? `0${bulan}` : bulan;
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const _startPeriode = startPeriode || '2024-02-03';
    const _endPeriode = endPeriode || '2024-02-03';
    const array1 = _startPeriode.split('-');
    const array2 = _endPeriode.split('-');
    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
    let date1 = new Date(_startPeriode);
    let date2 = new Date(_endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    let query = `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE em_id=? AND ajuan='4' AND status_transaksi='1' AND atten_date>=? AND atten_date<=? ORDER BY id DESC`;
    let queryParams: any[] = [em_id, _startPeriode, _endPeriode];
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query = `
        SELECT emp_leave.id as idd,emp_leave.* FROM ${startPeriodeDynamic}.emp_leave WHERE em_id=? AND ajuan='4' AND status_transaksi='1' AND atten_date>=? AND atten_date<=? 
        UNION ALL
        SELECT emp_leave.id as idd,emp_leave.* FROM ${endPeriodeDynamic}.emp_leave WHERE em_id=? AND ajuan='4' AND status_transaksi='1' AND atten_date>=? AND atten_date<=?
        ORDER BY idd DESC
      `;
      queryParams = [em_id, _startPeriode, _endPeriode, em_id, _startPeriode, _endPeriode];
    }
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      const results = await trx.raw(query, queryParams);
      await trx.commit();
      let rows: any[] = [];
      if ('rows' in results && Array.isArray(results.rows)) {
        rows = results.rows;
      } else if (Array.isArray(results) && Array.isArray(results[0])) {
        rows = results[0];
      }
      return {
        status: true,
        message: 'Berhasil ambil data!',
        jumlah_data: rows.length,
        data: rows,
      };
    } catch (error) {
      throw new InternalServerErrorException('Database error: ' + error.message);
    }
  }
}