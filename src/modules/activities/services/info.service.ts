import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, getDateNow } from 'src/common/utils';

interface InfoActivityResult {
  data_izin: any[];
  data_sakit: any[];
  data_cuti: any[];
  data_lembur: any[];
  data_masukwfh: any[];
  data_absentepatwaktu: any[];
  data_employee: string;
  data_masuk_kerja: any[];
}

@Injectable()
export class InfoService {
  constructor(private readonly dbService: DbService) {}

  async info_aktifitas_employee(dto: {
    database: string;
    em_id: string;
    bulan: string;
    tahun: string;
    start_date?: string;
    end_date?: string;
    start_periode: string;
    end_periode: string;
  }): Promise<InfoActivityResult> {
    console.log("-----info aktifitas employee---------- ", dto);
    
    const database = dto.database;
    const em_id = dto.em_id;
    const getbulan = dto.bulan;
    const gettahun = dto.tahun;

    const tahun = `${gettahun}`;
    const convertYear = tahun.substring(2, 4);
    let startDb= formatDbName(database, dto.start_periode);
    let endDb= formatDbName(database, dto.end_periode);
    
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);
    
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        startDb= endDb;

    }

    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    let query_masuk_kerja = `SELECT atten_date FROM ${startDb}.attendance WHERE em_id='${em_id}' AND atttype='1'`;
    let query_izin = `SELECT COUNT(*) as jumlah_izin FROM ${startDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='3'`;
    let query_sakit = `SELECT COUNT(*) as jumlah_sakit FROM ${startDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='2'`;
    let query_cuti = `SELECT COUNT(*) as jumlah_cuti FROM ${startDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='1'`;
    let query_lembur = `SELECT COUNT(*) as jumlah_lembur FROM ${startDb}.emp_labor WHERE em_id='${em_id}' AND ajuan='1'`;
    let query_masuk_wfh = `SELECT COUNT(*) as jumlah_masuk_wfh FROM ${startDb}.attendance WHERE em_id='${em_id}' AND place_in='WFH'`;
    let query_absen_tepat_waktu = `SELECT signin_time FROM ${startDb}.attendance WHERE em_id='CLD SISCOM' AND atttype='1'`;

    let query_jumlah_kerja = `SELECT IFNULL( workday,'22') as workday FROM ${database}_hrm.employee WHERE em_id='${em_id}'`;



    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query_masuk_kerja = `SELECT atten_date FROM ${startDb}.attendance WHERE em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')  
      UNION 
      SELECT atten_date FROM ${endDb}.attendance WHERE em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')  
      `;

      query_izin = `SELECT COUNT(*) as jumlah_izin FROM ${startDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='3' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      UNION

      SELECT COUNT(*) as jumlah_izin FROM ${endDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='3' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      
      `;

      query_sakit = `SELECT COUNT(*) as jumlah_sakit FROM ${startDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='2'  AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      UNION 
      SELECT COUNT(*) as jumlah_sakit FROM ${endDb}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='2'  AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      `;

      query_cuti = `SELECT COUNT(*) as jumlah_cuti FROM ${namaDatabaseDynamic}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='1'   AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      UNION 
      SELECT COUNT(*) as jumlah_cuti FROM ${namaDatabaseDynamic}.emp_leave WHERE em_id='${em_id}' AND status_transaksi='1' AND ajuan='1'   AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
      
      `;

      query_lembur = `SELECT COUNT(*) as jumlah_lembur FROM ${startDb}.emp_labor WHERE em_id='${em_id}' AND ajuan='1'   AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
     UNION
     SELECT COUNT(*) as jumlah_lembur FROM ${endDb}.emp_labor WHERE em_id='${em_id}' AND ajuan='1' AND 
      (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')
     `;

      query_absen_tepat_waktu = `SELECT signin_time FROM ${startDb}.attendance WHERE  em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')  
     UNION

     SELECT signin_time FROM ${endDb}.attendance WHERE  em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}') 
     `;
    }

    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `${query_masuk_kerja};${query_izin};${query_sakit};${query_cuti};${query_lembur};${query_masuk_wfh};${query_absen_tepat_waktu};${query_jumlah_kerja}`
      );

      await trx.commit();
      
      return {
        data_izin: results[1] || [],
        data_sakit: results[2] || [],
        data_cuti: results[3] || [],
        data_lembur: results[4] || [],
        data_masukwfh: results[5] || [],
        data_absentepatwaktu: results[6] || [],
        data_employee: "22",
        data_masuk_kerja: results[0] || [],
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}