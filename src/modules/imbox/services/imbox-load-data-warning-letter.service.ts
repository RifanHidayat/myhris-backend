import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { databaseMaster, formatDbName } from 'src/common/utils';

interface ImboxLoadDataCutiResult {
  status: boolean;
  message: string;
  jenis: string;
  data: any[];
}

@Injectable()
export class ImboxLoadDataCutiService {
  constructor(private readonly dbService: DbService) {}

  async loadDataWarningLetter(dto: {
    database: string;
    em_id: string;
    
    start_periode: string;
    end_periode: string;
  }): Promise<ImboxLoadDataCutiResult> {
    console.log("-----load data cuti----------");
    
    const database = dto.database;
    const em_id = dto.em_id;
    const startPeriode = dto.start_periode;
    const endPeriode = dto.end_periode;
    
    let status = "Pending";
    
    let conditionStatus = "";
    if (status == "pending" || status == "PENDING" || status == "Pending") {
      conditionStatus = "AND a.leave_status IN ('Pending','Approve')";
    } else {
      conditionStatus = "AND a.leave_status IN ('Approve2','Rejected')";
    }

    const startDb = formatDbName(database,startPeriode);
    const endDn = formatDbName(database, startPeriode);
    const dbMaster = databaseMaster(database);
    let databsePeriode = startPeriode;

    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      conditionStatus = `${conditionStatus} AND a.atten_date>='${startPeriode}' AND a.atten_date<='${endPeriode}'`;
      databsePeriode= endPeriode;
    }

    let orderby1 = "ORDER BY idd DESC";
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      orderby1 = "";
    }

    let query2 = `SELECT
      letter.name as nama,
      CASE
        WHEN (a.approve_status IS NULL OR a.approve_status = 'Pending') THEN "Pending"
        WHEN (a.approve_status = 'Rejected') THEN "Rejected"
        ELSE "Approve"
      END AS approve_status,
    a.eff_date AS atten_date,
    a.alasan AS uraian,
    a.nomor AS nomor_ajuan,
    e2.full_name AS approve_by,
    a.em_id,
    a.approve_id,
    a.approve_date,
    a.title AS judul,
    a.tgl_surat AS tanggal_ajuan,
    a.id,
    b.em_report_to,
    b.em_report2_to,
    b.full_name,
    a.status AS leave_status
    FROM ${database}_hrm.employee_letter a JOIN ${database}_hrm.employee b 
    LEFT JOIN ${database}_hrm.sysdata ON sysdata.kode='027' 
    LEFT JOIN ${database}_hrm.letter ON a.letter_id=letter.id
    LEFT JOIN 
       ${database}_hrm.employee e2 ON a.approve_id = e2.em_id
       WHERE a.em_id=b.em_id  AND a.status LIKE '%${status}%' AND a.status!='Cancel' AND sysdata.name LIKE '%${em_id}%' ORDER BY a.id DESC`;

   
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      console.log(query2);
      const [results] = await trx.raw(query2);
      
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil data approve cuti!",
        jenis: "cuti",
        data: results,
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}
