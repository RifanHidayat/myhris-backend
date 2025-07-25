import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface NotificationItem {
  tanggal: string;
  notifikasi: any[];
}

interface ImboxLoadNotifikasiResult {
  status: boolean;
  message: string;
  data: NotificationItem[];
}

@Injectable()
export class ImboxLoadNotifikasiService {
  constructor(private readonly dbService: DbService) {}

  async load_notifikasi(dto: {
    database: string;
    em_id: string;
    tahun: string;
    bulan: string;
    start_periode?: string;
    end_periode?: string;
  }): Promise<ImboxLoadNotifikasiResult> {
    console.log("-----load aktifitas notifikasi----------");
    
    const database = dto.database;
    const em_id = dto.em_id;
    const getTahun = dto.tahun;
    const getBulan = dto.bulan;

    const tahun = `${getTahun}`;
    const convertYear = tahun.substring(2, 4);
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${getBulan}`;

    const startPeriode = dto.start_periode || "2024-02-03";
    const endPeriode = dto.end_periode || "2024-02-03";
    const array1 = startPeriode.split("-");
    const array2 = endPeriode.split("-");

    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;

    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    let query1 = `SELECT atten_date FROM notifikasi WHERE em_id='${em_id}' AND idx IS NULL ORDER BY id DESC`;
    let query2 = `SELECT * FROM notifikasi WHERE em_id='${em_id}' AND idx IS NULL`;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query1 = `SELECT atten_date,notifikasi.id as idd FROM ${startPeriodeDynamic}.notifikasi WHERE em_id='${em_id}' AND atten_date>='${startPeriode}' 
      UNION ALL
      SELECT atten_date ,notifikasi.id as idd FROM ${endPeriodeDynamic}.notifikasi WHERE em_id='${em_id}' AND atten_date<='${endPeriode}'
      ORDER BY idd DESC
      `;

      query2 = `SELECT * FROM ${startPeriodeDynamic}.notifikasi WHERE em_id='${em_id}'  AND atten_date>='${startPeriode}'
      UNION ALL
      SELECT * FROM ${endPeriodeDynamic}.notifikasi WHERE em_id='${em_id}' AND atten_date<='${endPeriode}'
      `;
    }

    console.log(query1);
    console.log();
    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [dataTanggal] = await trx.raw(query1);
      const listTanggal = dataTanggal;
      let filter1: string[] = [];
      listTanggal.forEach((element: any) => {
        filter1.push(element["atten_date"]);
      });
      filter1 = filter1.filter(
        (value, index, arr) => arr.indexOf(value) == index
      );
      
      const [dataAll] = await trx.raw(query2);
      const allData = dataAll;
      console.log("");
      const hasilFinal: NotificationItem[] = [];
      
      filter1.forEach((element) => {
        const turunan: any[] = [];

        allData.forEach((element2: any) => {
          if (element2["atten_date"] == element) {
            turunan.push(element2);
          }
        });

        const data: NotificationItem = {
          tanggal: element,
          notifikasi: turunan,
        };
        hasilFinal.push(data);
        hasilFinal.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
      });
   
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil!",
        data: hasilFinal,
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}