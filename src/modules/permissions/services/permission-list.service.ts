import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface PermissionListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class PermissionListService {
  async empLeaveLoadIzin(dto: PermissionListDto): Promise<any> {
    try {
      const database = dto.database;
      const em_id = dto.em_id;
      const bulan = dto.bulan;
      const tahun = dto.tahun;
      const convertYear = tahun.substring(2, 4);
      let convertBulan;
      if (bulan.length == 1) {
        convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
      } else {
        convertBulan = bulan;
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
      let query = `SELECT a.*, b.name, b.category, b.leave_day, b.status, b.cut_leave,b.input_time,b.backdate as back_date FROM ${namaDatabaseDynamic}.emp_leave a JOIN ${database}_hrm.leave_types b ON a.typeid=b.id WHERE a.em_id='${em_id}' AND a.ajuan IN ('2','3','4') AND a.status_transaksi='1' \
    AND a.atten_date>='${startPeriode}' AND a.atten_date<='${endPeriode}'\n    ORDER BY id DESC;`;
      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        query = `SELECT  a.id as idd,
      a.*, b.name, b.category, b.leave_day, b.status, b.cut_leave,b.input_time,b.backdate as back_date FROM ${startPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.leave_types b ON a.typeid=b.id WHERE a.em_id='${em_id}' AND a.ajuan IN ('2','3','4') AND a.status_transaksi='1' 
      AND a.atten_date>='${startPeriode}' 
      UNION ALL
      SELECT c.id as idd,
      c.*, d.name, d.category, d.leave_day, d.status, d.cut_leave,d.input_time,d.backdate as back_date FROM ${endPeriodeDynamic}.emp_leave c JOIN ${database}_hrm.leave_types d ON c.typeid=d.id WHERE c.em_id='${em_id}' AND c.ajuan IN ('2','3','4') AND c.status_transaksi='1'
      AND  c.atten_date<='${endPeriode}'
      ORDER BY idd DESC`;
      }
      const ipServer = process.env.DB_HOST || 'localhost';
      const configDynamic = {
        multipleStatements: true,
        host: ipServer,
        user: 'pro',
        password: 'Siscom3519',
        database: `${namaDatabaseDynamic}`,
        connectionLimit: 1000,
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        timeout: 60 * 60 * 1000,
      };
      const mysql = require('mysql');
      const poolDynamic = mysql.createPool(configDynamic);
      return new Promise((resolve, reject) => {
        poolDynamic.getConnection(function (err, connection) {
          if (err) {
            reject({
              status: false,
              message: 'Database tidak di temukan',
              data: [],
            });
          } else {
            connection.query(query, function (error, results) {
              connection.release();
              if (error != null) {
                reject({
                  status: false,
                  message: 'Gagal ambil data',
                  data: [],
                });
              } else {
                resolve({
                  status: true,
                  message: 'Berhasil ambil data!',
                  jumlah_data: results.length,
                  data: results,
                });
              }
            });
          }
        });
      });
    } catch (e) {
      throw new InternalServerErrorException('Gagal ambil data izin');
    }
  }
}
