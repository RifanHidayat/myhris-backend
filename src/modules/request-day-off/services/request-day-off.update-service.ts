import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface RequestDayOffUpdateDto {
  database: string;
  id: string;
  description: string;
  date: string;
}

const model = require('../../../common/model');
const utility = require('../../../common/utility');

@Injectable()
export class RequestDayOffUpdateService {
  async dayOffUpdate(dto: RequestDayOffUpdateDto): Promise<any> {
    const { database, id, description, date } = dto;
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
      const query = `UPDATE ${namaDatabaseDynamic}.emp_leave SET reason='${description}',date_selected='${date}' WHERE id='${id}'`;
      await conn.query(query);
      await conn.commit();
      return {
        status: true,
        message: 'Berhasil update data',
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Gagal update data');
    } finally {
      if (conn) await conn.release();
    }
  }
}