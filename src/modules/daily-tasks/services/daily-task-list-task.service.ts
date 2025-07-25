import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface DailyTaskListTaskDto {
  database: string;
  em_id: string;
  tahun: string;
  bulan: string;
  id?: string;
  start_periode?: string;
  end_periode?: string;
  tenant?: string;
  emId?: string;
}

@Injectable()
export class DailyTaskListTaskService {
  async getDailyTask(dto: DailyTaskListTaskDto): Promise<any> {
    const { database, em_id, tahun, bulan, id, start_periode, end_periode, tenant, emId } = dto;
    const model = require('../../../common/model');
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    let namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const startPeriode = start_periode || '2024-02-03';
    const endPeriode = end_periode || '2024-02-03';
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      const endPeriodeDynamic = `${database}_hrm${endPeriode.substring(2, 4)}${endPeriode.split('-')[1]}`;
      namaDatabaseDynamic = endPeriodeDynamic;
    }
    const connection = await model.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const query = `SELECT * FROM daily_task a JOIN daily_task_detail b ON a.id = b.daily_task_id WHERE a.id = ?`;
      const [result] = await conn.query(query, [id]);
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
