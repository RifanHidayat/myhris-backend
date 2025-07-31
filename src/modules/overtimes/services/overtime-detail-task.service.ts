import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OvertimeDetailTaskDto {
  database: string;
  nomor_ajuan: string;
  start_periode?: string;
  end_periode?: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  originalUrl?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk mengambil detail task overtime
 */
@Injectable()
export class OvertimeDetailTaskService {

  async detailTask(dto: OvertimeDetailTaskDto): Promise<any> {
    console.log("detail task");

    const database = dto.database;
    const name_url = dto.originalUrl || '';
    const convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    const nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + dto.database, "");
    const nomorAjuan = dto.nomor_ajuan;

    const menu_name = dto.menu_name;
    const activity_name = dto.activity_name;
    const createdBy = dto.created_by;

    const bodyValue = { ...dto } as any;
    delete (bodyValue as any).menu_name;
    delete (bodyValue as any).activity_name;
    delete (bodyValue as any).created_by;
    
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const dateNow = `${year}-${month
      .toString()
      .padStart(2, "0")}-${date} ${hours}:${minutes}:${seconds}`;
    
    bodyValue.created_on = dateNow;
    bodyValue.is_mobile = "1";

    const array = this.dateNow2().split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);

    console.log("tahun ", tahun);
    let convertBulan: string;
    
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }

    const startPeriode =
      dto.start_periode == undefined
        ? "2024-02-03"
        : dto.start_periode;
    const endPeriode =
      dto.end_periode == undefined ? "2024-02-03" : dto.end_periode;
    
    const array1 = startPeriode.split("-");
    const array2 = endPeriode.split("-");

    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${
      array1[1]
    }`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${
      array2[1]
    }`;
    const namaDatabaseDynamic = startPeriodeDynamic;
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      
      let query = `SELECT a.* FROM ${startPeriodeDynamic}.emp_labor_task a JOIN ${startPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}'`;
      
      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        query = `SELECT a.* FROM ${startPeriodeDynamic}.emp_labor_task a JOIN ${startPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}'
    AND (a.created_on >= '${startPeriode}' AND a.created_on <= '${endPeriode}')
      UNION ALL SELECT a.* FROM ${endPeriodeDynamic}.emp_labor_task a JOIN ${endPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}' AND (a.created_on >= '${startPeriode}' AND a.created_on <= '${endPeriode}')`;
      }
      
      console.log(query);
      const [results] = await conn.query(query);
      console.log(results);
      await conn.commit();
      
      return {
        status: true,
        message: "Successfully get data",
        data: results,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("error", e);
      throw new InternalServerErrorException('Gagal ambil data');
    } finally {
      if (conn) await conn.release();
    }
  }

  private dateNow2(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}