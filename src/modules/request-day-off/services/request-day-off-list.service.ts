import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface RequestDayOffListDto {
  database: string;
  em_id: string;
  date?: string;
  description?: string;
}

const model = require('../../../common/model');
const utility = require('../../../common/utility');

@Injectable()
export class RequestDayOffListService {
  async dayoffIndex(dto: RequestDayOffListDto): Promise<any> {
    const { database, em_id } = dto;
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, '0');
    const array = utility.dateNow2().split('-');
    const tahun1 = `${array[0]}`;
    const convertYear = tahun1.substring(2, 4);
    const convertBulan = array[1];
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const connection = await model.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const query = `SELECT work_schedule.time_in,work_schedule.time_out,emp_leave.* FROM ${namaDatabaseDynamic}.emp_leave LEFT JOIN ${database}_hrm.work_schedule ON emp_leave.work_schedule_history=work_schedule.id  WHERE em_id='${em_id}' AND ajuan IN (5) AND status_transaksi=1`;
      const [results] = await conn.query(query);
      await conn.commit();
      return {
        status: true,
        message: 'Berhasil ambil!',
        data: results,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Gagal ambil data');
    } finally {
      if (conn) await conn.release();
    }
  }
}