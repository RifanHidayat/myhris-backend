import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { databaseMaster, formatDbName } from 'src/common/utils';

interface ImboxLoadDataOvertimeResult {
  status: boolean;
  message: string;
  jenis: string;
  data: any[];
}

@Injectable()
export class ImboxLoadDataOvertimeService {
  constructor(private readonly dbService: DbService) {}

  async loadDataAttendance(dto: {
    database: string;
    em_id: string;
    branch_id?: string;
    bulan?: string;
    tahun?: string;
    status?: string;
    start_periode: string;
    end_periode: string;
  }): Promise<ImboxLoadDataOvertimeResult> {
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

    let startDb = formatDbName(database,startPeriode);
    const endDb = formatDbName(database, startPeriode);
    const dbMaster = databaseMaster(database);
    let databsePeriode = startPeriode;

    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      conditionStatus = `${conditionStatus} AND a.atten_date>='${startPeriode}' AND a.atten_date<='${endPeriode}'`;
      startDb= endDb;
    }

    let orderby1 = "ORDER BY idd DESC";
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      orderby1 = "";
    }

    let query2 = `SELECT 
     a.id as idd,
     CASE
     WHEN ( a.approve_status  IS NULL OR a.approve_status='Pending')  AND (a.approve_by IS NULL OR a.approve_by='') THEN "Pending"
     WHEN  (a.approve_status IS NULL   OR a.approve_status='Rejected') AND (a.approve_by!='') AND a.status='Rejected'THEN "Rejected"

     ELSE "Approve"
     END AS approve_status,
     CASE
     WHEN (a.approve2_status IS NULL OR a.approve2_status='Pending') AND (a.approve_by!='') THEN "Pending"
     WHEN (a.approve2_status IS NULL OR a.approve2_status='Rejected') AND (a.approve_by!='') AND a.status='Rejected'THEN "Rejected"
     

     ELSE "Approve"
     END AS approve2_status,
     a.dari_jam,
     a.sampai_jam,
     a.approve_by,
     a.approve2_by,
     a.em_delegation,
     a.atten_date,
     a.uraian,
     a.nomor_ajuan,
     a.em_id,
     a.approve_id,
     a.place_in,
     a.place_out,
     a.status,
	a.ajuan,
a.approve_id,
a.approve_date,
a.id,
c.full_name AS nama_delegasi,

CASE
    WHEN o.dinilai = 'N' THEN b.em_report2_to
    ELSE a.em_ids
END AS em_ids,
o.dinilai,
    
   


     o.name as nama_pengajuan, b.em_report_to as em_report_to,  b.em_report2_to as em_report2_to,   b.full_name FROM ${startDb}.emp_labor a 
     JOIN ${database}_hrm.employee b LEFT JOIN ${database}_hrm.overtime o ON o.id=a.typeId  
     JOIN ${database}_hrm.employee c ON c.em_id = a.em_delegation
     WHERE a.em_id=b.em_id 
     AND (a.status_pengajuan IS NULL OR a.status_pengajuan = 'post')

     ${conditionStatus} AND a.status!='Cancel' AND a.ajuan='1'  AND a.status_transaksi=1
     -- Kondisi dinilai = 'Y' untuk mengganti em_delegation dan em_ids
     AND (
         (o.dinilai = 'N' AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%'))
         OR 
         (o.dinilai = 'Y' AND (a.em_delegation LIKE '%${em_id}%' OR a.em_ids LIKE '%${em_id}%'))
     )
    

     ${orderby1}
     `;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query2 = query2 + `SELECT 
     a.id as idd,
     CASE
     WHEN ( a.approve_status  IS NULL OR a.approve_status='Pending')  AND (a.approve_by IS NULL OR a.approve_by=='') THEN "Pending"
     WHEN  (a.approve_status IS NULL   OR a.approve_status='Rejected') AND (a.approve_by!='') AND a.status='Rejected'THEN "Rejected"

     ELSE "Approve"
     END AS approve_status,
     CASE
     WHEN (a.approve2_status IS NULL OR a.approve2_status='Pending') AND (a.approve_by!='') THEN "Pending"
     WHEN (a.approve2_status IS NULL OR a.approve2_status='Rejected') AND (a.approve_by!='') AND a.status='Rejected'THEN "Rejected"
     

     ELSE "Approve"
     END AS approve2_status,
     a.dari_jam,
     a.sampai_jam,
     a.approve_by,
     a.approve2_by,
     a.em_delegation,
     a.atten_date,
     a.uraian,
     a.nomor_ajuan,
     a.em_id,
     a.approve_id,
     a.place_in,
     a.place_out,
     a.status,
	a.ajuan,
a.approve_id,
a.approve_date,
a.id,
c.full_name AS nama_delegasi,

CASE
    WHEN o.dinilai = 'N' THEN b.em_report2_to
    ELSE a.em_ids
END AS em_ids,
o.dinilai,
    
   

     o.name as nama_pengajuan, b.em_report_to as em_report_to,  b.em_report2_to as em_report2_to,   b.full_name FROM ${endDb}.emp_labor a 
     JOIN ${database}_hrm.employee b LEFT JOIN ${database}_hrm.overtime o ON o.id=a.typeId  
     JOIN ${database}_hrm.employee c ON c.em_id = a.em_delegation
     WHERE a.em_id=b.em_id 
     AND (a.status_pengajuan IS NULL OR a.status_pengajuan = 'post')

     ${conditionStatus} AND a.status!='Cancel' AND a.ajuan='1'  AND a.status_transaksi=1
     -- Kondisi dinilai = 'Y' untuk mengganti em_delegation dan em_ids
     AND (
         (o.dinilai = 'N' AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%'))
         OR 
         (o.dinilai = 'Y' AND (a.em_delegation LIKE '%${em_id}%' OR a.em_ids LIKE '%${em_id}%'))
     )
    

     ${orderby1}
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
