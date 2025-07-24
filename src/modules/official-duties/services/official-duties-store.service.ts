import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OfficialDutiesStoreDto {
  database: string;
  em_id: string;
  typeid: string;
  nomor_ajuan?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  leave_duration: number;
  date_selected: string;
  time_plan: string;
  time_plan_to: string;
  apply_date: string;
  reason: string;
  leave_status: string;
  atten_date: string;
  em_delegation?: string;
  leave_files?: string;
  ajuan: string;
}

@Injectable()
export class OfficialDutiesStoreService {
  async kirimTidakMasukKerja(dto: OfficialDutiesStoreDto): Promise<any> {
    const model = require('../../../common/model');
    const utility = require('../../../common/utility');
    const database = dto.database;
    const insertData = { ...dto };
    const array = dto.start_date.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const databaseMaster = `${database}_hrm`;
    const script = `INSERT INTO ${namaDatabaseDynamic}.emp_leave SET ?`;
    const connection = await model.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [results] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE ajuan='4'`,
      );
      let nomor;
      if (results.length > 0) {
        const text = results[0]['nomor_ajuan'];
        nomor = parseInt(text.substring(8, 13)) + 1;
      } else {
        nomor = 1;
      }
      const nomorStr = String(nomor).padStart(4, '0');
      insertData.nomor_ajuan = `DL20${convertYear}${convertBulan}` + nomorStr;
      await conn.query(script, [insertData]);
      const [transaksi] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE nomor_ajuan='${insertData.nomor_ajuan}'`,
      );
      const [employee] = await conn.query(
        `SELECT * FROM ${databaseMaster}.employee WHERE em_id='${insertData.em_id}'`,
      );
      utility.insertNotifikasi(
        employee[0].em_report_to,
        'Approval Dinas Luar',
        'DinasLuar',
        employee[0].em_id,
        transaksi[0].id,
        transaksi[0].nomor_ajuan,
        employee[0].full_name,
        namaDatabaseDynamic,
        databaseMaster,
      );
      await conn.commit();
      return {
        status: true,
        message: 'Successfully get data',
        data: transaksi,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException(
        'Gagal ambil data dinas resmi: ' + e.message,
      );
    } finally {
      if (conn) await conn.release();
    }
  }
}
