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

  async loadDataLoan(dto: {
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

    let query2 = `SELECT emp_loan.approve_by, emp_loan.id, employee.full_name, emp_loan.status as  approve_status,emp_loan.approve_id,emp_loan.approve_date,emp_loan.tgl_ajuan as tanggal_ajuan ,
      emp_loan.periode_mulai_cicil as periode,
      emp_loan.nomor_ajuan,emp_loan.description,emp_loan.total_loan as total_pinjaman ,emp_loan.jml_cicil  as durasi_cicil
      FROM  ${database}_hrm.emp_loan LEFT JOIN ${database}_hrm.sysdata  ON sysdata.kode='019' JOIN ${database}_hrm.employee ON employee.em_id=emp_loan.em_id WHERE sysdata.name LIKE '%${em_id}%' AND emp_loan.status  LIKE '%${status}%'   AND emp_loan.em_id!='${em_id}'`;

    

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
