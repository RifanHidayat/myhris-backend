import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface DailyTaskListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  atasanStatus?: string;
  tenant?: string;
  emId?: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class DailyTaskListService {
  constructor(private readonly dbService: DbService) {}

  async getAllDailyTask(dto: DailyTaskListDto): Promise<any> {
    const { database, em_id, bulan, tahun, atasanStatus, tenant, emId, start_periode, end_periode } = dto;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    let namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const lastDay = new Date(Number(tahun), Number(convertBulan), 0).getDate();
    const startPeriode = `${tahun}-${bulan}-01`;
    const endPeriode = `${tahun}-${bulan}-${lastDay}`;
    const array1 = startPeriode.split('-');
    const array2 = endPeriode.split('-');
    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      namaDatabaseDynamic = startPeriodeDynamic;
    }
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      const queryCek = `SELECT tgl_buat FROM ${namaDatabaseDynamic}.daily_task WHERE em_id = ? ORDER BY tgl_buat DESC LIMIT 1`;
      const [cekdata] = await trx.raw(queryCek, [em_id]);
      // ... (queryTaskPersetujuan1 dan queryTaskPersetujuan2, logic sama, return object)
      await trx.commit();
      return {
        success: true,
        data: cekdata, // TODO: isi dengan hasil query
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal dapatkan data AllDailyTask: ' + error.message);
    }
  }
}
