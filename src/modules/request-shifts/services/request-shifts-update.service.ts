import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

interface RequestShiftsUpdateDto {
  database: string;
  tgl_ajuan: string;
  id: string;
  status_transaksi: number;
  em_id?: string;
  em_delegation?: string;
  typeid?: string;
  atten_date?: string;
  dari_tgl?: string;
  sampai_tgl?: string;
  status?: string;
  work_id_old?: string | number;
  work_id_new?: string | number;
  uraian?: string;
  approve_status?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

@Injectable()
export class RequestShiftsUpdateService {
  async edit(dto: RequestShiftsUpdateDto): Promise<any> {
    const { database, tgl_ajuan, id, status_transaksi, ...bodyValue } = dto;
    const array = tgl_ajuan.split('-');
    bodyValue.work_id_old =
      bodyValue.work_id_old === '' ? 0 : bodyValue.work_id_old;
    bodyValue.work_id_new =
      bodyValue.work_id_new === '' ? 0 : bodyValue.work_id_new;
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan: string;
    if (array[1].length === 1) {
      convertBulan = parseInt(array[1], 10) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    let conn;
    try {
      conn = await (
        await model.createConnection1(`${database}_hrm`)
      ).getConnection();
      await conn.beginTransaction();
      const query = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id = '${id}'`;
      if (status_transaksi == 0) {
        const body = { status_transaksi: 0 };
        await conn.query(query, [body]);
        await conn.commit();
        return {
          status: true,
          message: 'Succesfully Delete Shift',
        };
      } else {
        const body = { ...bodyValue };
        await conn.query(query, [body]);
        await conn.commit();
        return {
          status: true,
          message: 'Succesfuly Edit shift',
        };
      }
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException(e);
    } finally {
      if (conn) await conn.release();
    }
  }
}
