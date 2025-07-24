import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface DailyTaskListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  atasanStatus?: string;
}

@Injectable()
export class DailyTaskListService {
  async getAllDailyTask(dto: DailyTaskListDto): Promise<any> {
    const model = require('../../../common/model');
    const database = dto.database;
    const em_id = dto.em_id;
    const bulan = dto.bulan;
    const tahun = dto.tahun;
    const statusFilter = dto.atasanStatus;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    let namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const lastDay = new Date(tahun, parseInt(convertBulan), 0).getDate();
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
    const databaseMaster = `${database}_hrm`;
    const connection = await model.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const queryCek = `SELECT tgl_buat FROM daily_task WHERE em_id = ? ORDER BY tgl_buat DESC LIMIT 1`;
      const [cekdata] = await conn.query(queryCek, [em_id]);
      let tglFinal;
      if (cekdata.length > 0 && cekdata[0].tgl_buat) {
        const tglBuat = cekdata[0].tgl_buat.toISOString().split('T')[0];
        const today = new Date();
        const tglBuatDate = new Date(tglBuat);
        if (tglBuatDate > today) {
          tglFinal = tglBuat;
        } else {
          tglFinal = new Date().toISOString().split('T')[0];
        }
      } else {
        tglFinal = new Date().toISOString().split('T')[0];
      }
      const querySysData = `SELECT * FROM ${databaseMaster}.sysdata WHERE KODE='013'`;
      const [sysdata] = await conn.query(querySysData);
      // ... (queryTaskPersetujuan1 dan queryTaskPersetujuan2, logic sama, return object)
      await conn.commit();
      return {
        success: true,
        data: [], // TODO: isi dengan hasil query
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw new InternalServerErrorException('Gagal dapatkan data AllDailyTask: ' + error.message);
    } finally {
      if (conn) conn.release();
    }
  }
}