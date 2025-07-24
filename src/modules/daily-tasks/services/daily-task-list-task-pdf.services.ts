import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface DailyTaskListTaskPdfDto {
  database: string;
  em_id: string;
  tahun: string;
  bulan: string;
  id?: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class DailyTaskListTaskPdfService {
  async getDailyTaskPDF(dto: DailyTaskListTaskPdfDto): Promise<any> {
    const model = require('../../../common/model');
    const database = dto.database;
    const em_id = dto.em_id;
    const id = dto.id;
    const tahun = dto.tahun;
    const bulan = dto.bulan;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    let namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const startPeriode = dto.start_periode || '2024-02-03';
    const endPeriode = dto.end_periode || '2024-02-03';
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      const endPeriodeDynamic = `${database}_hrm${endPeriode.substring(2, 4)}${endPeriode.split('-')[1]}`;
      namaDatabaseDynamic = endPeriodeDynamic;
    }
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const query = `SELECT dt.tgl_buat, dt.em_id, dtd.judul, dtd.rincian, dtd.status, dtd.tgl_finish, dtd.level, e.full_name, e.job_title AS posisi, d.name AS jabatan, dep.name AS divisi FROM ${namaDatabaseDynamic}.daily_task dt INNER JOIN ${namaDatabaseDynamic}.daily_task_detail dtd ON dt.id = dtd.daily_task_id INNER JOIN employee e ON dt.em_id = e.em_id INNER JOIN department dep ON e.dep_id = dep.id INNER JOIN designation d ON e.des_id = d.id WHERE dt.em_id = ? AND dt.status_pengajuan = 'post' ORDER BY dt.tgl_buat ASC`;
      const [result] = await conn.query(query, [em_id]);
      await conn.commit();
      return {
        success: true,
        message: 'Successfully get data',
        data: result,
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw new InternalServerErrorException(
        'Gagal mendapatkan data AllDailyTask: ' + error.message,
      );
    } finally {
      if (conn) conn.release();
    }
  }
}
