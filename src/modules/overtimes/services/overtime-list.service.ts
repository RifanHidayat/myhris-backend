import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OvertimeListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  branch_id?: string;
  start_periode?: string;
  end_periode?: string;
  originalUrl?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk mengambil list data overtime
 */
@Injectable()
export class OvertimeListService {

  async list(dto: OvertimeListDto): Promise<any> {
    console.log("-----history data dengan start periode and periode----------");
    
    return this.getOvertimeData(dto);
  }

  async historyData(dto: OvertimeListDto): Promise<any> {
    console.log("-----history data dengan start periode and periode----------");
    
    return this.getOvertimeData(dto);
  }

  private async getOvertimeData(dto: OvertimeListDto): Promise<any> {
    const database = dto.database;
    const name_url = dto.originalUrl || '';
    const convert1 = name_url
      .substring(name_url.lastIndexOf("/") + 1)
      .replace("?database=" + dto.database, "")
      .replace("&start_periode=" + (dto.start_periode || ""), "")
      .replace("&end_periode=" + (dto.end_periode || ""), "");

    console.log(convert1);
    const convert2 = convert1.substring(convert1.lastIndexOf("-") + 1);

    console.log("convert 2", convert2);

    const em_id = dto.em_id;
    const bulan = dto.bulan;
    const tahun = dto.tahun;
    const branchId = dto.branch_id;

    const convertYear = tahun.substring(2, 4);
    let convertBulan: string;
    
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

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

    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      
      const url = this.buildQueryUrl(
        convert2,
        startPeriodeDynamic,
        endPeriodeDynamic,
        database,
        em_id,
        startPeriode,
        endPeriode,
        branchId,
        montStart,
        monthEnd,
        date1,
        date2
      );
      
      console.log(url);
      const [results] = await conn.query(url);
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
      console.error("error : ", e);
      throw new InternalServerErrorException('Terjadi kesalahan saat mengambil data');
    } finally {
      if (conn) await conn.release();
    }
  }

  private buildQueryUrl(
    convert2: string,
    startPeriodeDynamic: string,
    endPeriodeDynamic: string,
    database: string,
    em_id: string,
    startPeriode: string,
    endPeriode: string,
    branchId: string | undefined,
    montStart: number,
    monthEnd: number,
    date1: Date,
    date2: Date
  ): string {
    if (
      convert2 == "emp_labor" ||
      convert2 == "emp_leave" ||
      convert2 == "emp_claim"
    ) {
      if (convert2 == "emp_labor") {
        let url = ` 
          SELECT emp_labor.status as leave_status, emp_labor.*,overtime.name as type,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') ORDER BY id DESC`;

        if (
          montStart < monthEnd ||
          date1.getFullYear() < date2.getFullYear()
        ) {
          url = `
            SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${startPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'  
            UNION ALL
            SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${endPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND ( tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'
            ORDER BY idd
            `;
        }
        return url;
      } else if (convert2 == "emp_claim") {
        let url = `SELECT emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') `;

        if (
          montStart < monthEnd ||
          date1.getFullYear() < date2.getFullYear()
        ) {
          url = `
            SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')    
            UNION ALL
            SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') 
            ORDER BY idd
            `;
        }
        return url;
      } else {
        return `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
      }
    } else {
      return `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
    }
  }
}