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

  async loadDataPayslip(dto: {
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
       a.id as idd,
     CASE
     WHEN ( a.apply_status  IS NULL OR a.apply_status='Pending')  AND (a.apply_by IS NULL OR a.apply_by='') THEN "Pending"
     WHEN  (a.apply_status  IS NULL OR a.apply_status='Rejected')  AND (a.apply_by!='') AND a.leave_status='Rejected'THEN "Rejected"

     ELSE "Approve"
     END AS apply_status,
     CASE
     WHEN (a.apply2_status IS NULL OR a.apply2_status='Pending') AND (a.apply_by!='') THEN "Pending"
     WHEN (a.apply2_status IS NULL OR a.apply2_status='Rejected') AND (a.apply_by!='') AND a.leave_status='Rejected'THEN "Rejected"
     

     ELSE "Approve"
     END AS apply2_status,
     a.leave_duration,
     a.em_delegation,
     a.apply_by,
     a.apply2_by,
     a.atten_date,
     a.reason,
     a.em_id,
     a.leave_files,
     a.start_date,
     a.end_date,
     a.leave_status,
     a.nomor_ajuan,
 a.date_selected,
	
a.id,
a.apply_date,
a.leave_type,
a.ajuan,
a.apply_id,
a.typeid,
c.cut_leave,
c.input_time,
      d.name AS nama_divisi, a.nomor_ajuan, c.name as nama_penagjuan,  b.em_report_to as em_report_to,  
     b.em_report2_to as em_report2_to,   b.full_name, c.name as nama_tipe, c.category FROM ${startDb}.emp_leave a 
     INNER JOIN leave_types c ON a.typeid=c.id JOIN employee b  JOIN designation  d ON d.id=b.des_id 
     WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')
 ${conditionStatus}   AND a.ajuan='1'  AND a.status_transaksi=1 ${orderby1}`;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query2 = query2 + `
     UNION ALL
     SELECT
       a.id as idd,
     CASE
     WHEN ( a.apply_status  IS NULL OR a.apply_status='Pending')  AND (a.apply_by IS NULL OR a.apply_by='') THEN "Pending"
     WHEN  (a.apply_status  IS NULL OR a.apply_status='Rejected')  AND (a.apply_by!='') AND a.leave_status='Rejected'THEN "Rejected"

     ELSE "Approve"
     END AS apply_status,
     CASE
     WHEN (a.apply2_status IS NULL OR a.apply2_status='Pending') AND (a.apply_by!='') THEN "Pending"
     WHEN (a.apply2_status IS NULL OR a.apply2_status='Rejected') AND (a.apply_by!='') AND a.leave_status='Rejected'THEN "Rejected"
     

     ELSE "Approve"
     END AS apply2_status,
     a.leave_duration,
     a.em_delegation,
     a.apply_by,
     a.apply2_by,
     a.atten_date,
     a.reason,
     a.em_id,
     a.leave_files,
     a.start_date,
     a.end_date,
     a.leave_status,
     a.nomor_ajuan,
 a.date_selected,
	
a.id,
a.apply_date,
a.leave_type,
a.ajuan,
a.apply_id,
a.typeid,
c.cut_leave,
c.input_time,
      d.name AS nama_divisi, a.nomor_ajuan, c.name as nama_penagjuan,  b.em_report_to as em_report_to,  
     b.em_report2_to as em_report2_to,   b.full_name, c.name as nama_tipe, c.category FROM ${endPeriode}.emp_leave a 
     INNER JOIN leave_types c ON a.typeid=c.id JOIN employee b  JOIN designation  d ON d.id=b.des_id 
     WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%') 
 ${conditionStatus}   AND a.ajuan='1'  AND a.status_transaksi=1 ${orderby1}
     `;
    }

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
