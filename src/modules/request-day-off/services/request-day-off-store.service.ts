import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface RequestDayOffStoreDto {
  database: string;
  em_id: string;
  date: string;
  description: string;
}

const model = require('../../../common/model');
const utility = require('../../../common/utility');

@Injectable()
export class RequestDayOffStoreService {
  async dayOffInsert(dto: RequestDayOffStoreDto): Promise<any> {
    const { database, em_id, date, description } = dto;
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RD${tahun}${bulan}`;
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
      const empShiftQuery = `SELECT * FROM ${namaDatabaseDynamic}.emp_shift WHERE em_id='${em_id}' AND atten_date='${date}'`;
      const [empShift] = await conn.query(empShiftQuery);
      if (empShift.length > 0) {
        if (empShift[0].off_date == '0' || empShift[0].off_date == 0) {
          return {
            status: true,
            message: 'Anda mengajukan di hari libur',
            data: empShift,
          };
        }
      } else {
        return {
          status: true,
          message: 'Jadwal kerja belum di setting',
          data: empShift,
        };
      }
      const dayoffQuery = `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE status_transaksi=1 AND ajuan IN (5) ORDER BY id DESC`;
      const [dayoff] = await conn.query(dayoffQuery);
      let nextNumber = 1;
      if (dayoff.length > 0) {
        const lastAjuan = dayoff[0].nomor_ajuan;
        const lastNumber = parseInt(lastAjuan.slice(-4), 10);
        nextNumber = lastNumber + 1;
      }
      const nomorAjuanBaru = `${prefix}${String(nextNumber).padStart(4, '0')}`;
      const queryinsert = `INSERT INTO ${namaDatabaseDynamic}.emp_leave (nomor_ajuan,em_id,leave_type,start_date,end_date,date_selected,apply_status,leave_status,reason,atten_date,ajuan,work_schedule_history,typeId) VALUES ('${nomorAjuanBaru}','${em_id}','FULLDAY','${date}','${date}','${date}','Pending','Pending','${description}',CURDATE(),5,'${dayoff[0]['work_id']}',0)`;
      await conn.query(queryinsert);
      await conn.commit();
      return {
        status: true,
        message: 'Berhasil insert data',
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Gagal insert data');
    } finally {
      if (conn) await conn.release();
    }
  }
}
