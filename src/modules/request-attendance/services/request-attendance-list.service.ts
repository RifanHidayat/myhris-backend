import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface GetEmployeeAttendanceDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  date?: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class RequestAttendanceListService {
  async getEmployeeAttendance(dto: GetEmployeeAttendanceDto): Promise<any> {
    try {
      const database = dto.database;
      const em_id = dto.em_id;
      const getbulan = dto.bulan;
      const gettahun = dto.tahun;
      const date = dto.date;
      const tahun = `${gettahun}`;
      const convertYear = tahun.substring(2, 4);
      let convertBulan;
      if (getbulan.length == 1) {
        convertBulan = parseInt(getbulan) <= 9 ? `0${getbulan}` : getbulan;
      } else {
        convertBulan = getbulan;
      }
      const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
      const startPeriode = dto.start_periode || '2024-02-03';
      const endPeriode = dto.end_periode || '2024-02-03';
      const array1 = startPeriode.split('-');
      const array2 = endPeriode.split('-');
      const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
      const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
      let date1 = new Date(startPeriode);
      let date2 = new Date(endPeriode);
      const montStart = date1.getMonth() + 1;
      const monthEnd = date2.getMonth() + 1;
      let query = `SELECT  emp_labor.*,m.place AS lokasi_masuk,k.place AS lokasi_keluar FROM emp_labor LEFT JOIN ${database}_hrm.places_coordinate m ON m.id=emp_labor.place_in LEFT JOIN  ${database}_hrm.places_coordinate k ON k.id=emp_labor.place_out   WHERE ajuan IN ('3', '5') AND em_id='${em_id}' AND status_transaksi=1 ORDER BY id DESC`;
      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        query = `SELECT emp_labor.id as idd,  emp_labor.*,m.place AS lokasi_masuk,k.place AS lokasi_keluar FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.places_coordinate m ON m.id=emp_labor.place_in LEFT JOIN  ${database}_hrm.places_coordinate k ON k.id=emp_labor.place_out   WHERE ajuan='3' AND em_id='${em_id}' AND status_transaksi=1 
         UNION ALL
         SELECT emp_labor.id as idd,  emp_labor.*,m.place AS lokasi_masuk,k.place AS lokasi_keluar FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.places_coordinate m ON m.id=emp_labor.place_in LEFT JOIN  ${database}_hrm.places_coordinate k ON k.id=emp_labor.place_out   WHERE ajuan='3' AND em_id='${em_id}' AND status_transaksi=1
         ORDER BY idd DESC`;
      }
      const model = require('../../../common/model');
      const connection = await model.createConnection1(namaDatabaseDynamic);
      let conn;
      try {
        conn = await connection.getConnection();
        await conn.beginTransaction();
        const [results] = await conn.query(query);
        await conn.commit();
        return {
          status: true,
          message: 'Data berhasil diambil',
          data: results,
        };
      } catch (e) {
        if (conn) {
          await conn.rollback();
        }
        throw new InternalServerErrorException('Gagal ambil data');
      } finally {
        if (conn) conn.release();
      }
    } catch (e) {
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}