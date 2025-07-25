import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface ImboxLoadInfoResult {
  status: boolean;
  message: string;
  jumlah_tidak_hadir: number;
  jumlah_cuti: number;
  jumlah_lembur: number;
  jumlah_tugasluar: number;
  jumlah_dinasluar: number;
  jumlah_klaim: number;
  jumlah_payroll: number;
  jumlah_checkin: number;
  jumlah_wfh: number;
  jumlah_kasbon: number;
  jumlah_surat_peringatan: number;
  jumlah_teguran_lisan: number;
  jumlah_dayoff: number;
  data1: any[];
  data2: any[];
  data3: any[];
  data4: any[];
  data5: any[];
  data6: any[];
  data7: any[];
  data8: any[];
  data9: any[];
  data10: any[];
  data11: any[];
  data12: any[];
  data13: any[];
}

@Injectable()
export class ImboxLoadInfoService {
  constructor(private readonly dbService: DbService) {}

  async load_approve_info_multi(dto: {
    database: string;
    em_id: string;
    bulan: string;
    tahun: string;
    branch_id?: string;
    start_periode?: string;
    end_periode?: string;
  }): Promise<ImboxLoadInfoResult> {
    console.log("-----load approve info multi----------");
    
    const database = dto.database;
    const em_id = dto.em_id;
    const getbulan = dto.bulan;
    const gettahun = dto.tahun;
    const branchId = dto.branch_id;

    const tahun = `${gettahun}`;
    const convertYear = tahun.substring(2, 4);
    const convert1 = parseInt(getbulan);
    const convertBulan = convert1 <= 9 ? `0${convert1}` : convert1;

    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

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

    let query1 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan IN ('2', '3')    AND a.status_transaksi=1`;
    let query2 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_leave a JOIN ${database}_hrm.employee b  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='1'  AND a.status_transaksi=1`;

    let query3 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee  b ON b.em_id=a.em_id  
  JOIN ${database}_hrm.overtime o ON o.id=a.typeid 
  WHERE a.em_id=b.em_id AND a.status_pengajuan != 'draft'
  AND (
    (o.dinilai = 'N' AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%'))
    OR 
    (o.dinilai = 'Y' AND (a.em_delegation LIKE '%${em_id}%' OR a.em_ids LIKE '%${em_id}%'))
)

  AND a.status IN ('Pending', 'Approve') AND a.ajuan='1'  
  AND a.status_transaksi=1    `;

    let query4 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.status IN ('Pending', 'Approve') AND a.ajuan='2'   AND a.status_transaksi=1`;
    let query5 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='4'   AND a.status_transaksi=1`;

    let query6 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_claim a JOIN ${database}_hrm.employee b JOIN  
  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  
  AND a.status IN ('Pending', 'Approve') `;
    
    let query7 = `SELECT designation.payroll_approval, a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_mobile_approval a 
  JOIN ${database}_hrm.employee b JOIN ${database}_hrm.designation ON designation.id=b.des_id WHERE a.em_id=b.em_id 
  AND (a.approved_id IS NULL OR  a.approved_id ='') AND designation.payroll_approval  LIKE '%${em_id}%'  AND a.created_date=CURDATE()`;

    let query8 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
  WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND (a.ajuan='3' OR a.ajuan='5') AND a.status_transaksi=1`;

    let query9 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
  WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND a.ajuan='4' AND a.status_transaksi=1`;

    let query10 = `SELECT * FROM ${database}_hrm.emp_loan LEFT JOIN ${database}_hrm.sysdata ON  sysdata.kode='019' WHERE sysdata.name LIKE '%${em_id}%' AND emp_loan.status='Pending'   AND emp_loan.em_id!='${em_id}' `;

    let query11 = `SELECT a.em_id, b.full_name FROM ${database}_hrm.employee_letter a JOIN ${database}_hrm.employee b  ON a.em_id=b.em_id LEFT JOIN ${database}_hrm.sysdata ON sysdata.kode='027'   WHERE   a.status IN ('Pending')  AND sysdata.name LIKE '%${em_id}%' `;

    let query12 = `SELECT a.em_id, b.full_name FROM ${database}_hrm.teguran_lisan a JOIN ${database}_hrm.employee b  ON a.em_id=b.em_id LEFT JOIN ${database}_hrm.sysdata ON sysdata.kode='027'   WHERE   a.status IN ('Pending')  AND sysdata.name LIKE '%${em_id}%' `;

    let query13 = `SELECT a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_leave a JOIN ${database}_hrm.employee b  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='5'  AND a.status_transaksi=1 AND a.atten_date>='${startPeriode}'`;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query1 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan IN ('2', '3')    AND a.status_transaksi=1 AND a.atten_date>='${startPeriode}' 
    UNION ALL
    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan IN ('2', '3')    AND a.status_transaksi=1 AND  a.atten_date<='${endPeriode}' 
    `;

      query2 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='1'  AND a.status_transaksi=1 AND a.atten_date>='${startPeriode}'
    UNION ALL

    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b  JOIN  ${database}_hrm.branch ON b.branch_id=branch.id WHERE a.em_id=b.em_id 
    AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%') 
    
    AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='1'  AND a.status_transaksi=1 AND a.atten_date<='${endPeriode}'
    `;

      query3 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee  b ON b.em_id=a.em_id  
      JOIN ${database}_hrm.overtime o ON o.id=a.typeid 
      WHERE a.em_id=b.em_id AND a.status_pengajuan != 'draft'
      AND (
        (o.dinilai = 'N' AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%'))
        OR 
        (o.dinilai = 'Y' AND (a.em_delegation LIKE '%${em_id}%' OR a.em_ids LIKE '%${em_id}%'))
    )
    
      AND a.status IN ('Pending', 'Approve') AND a.ajuan='1'  
      AND a.status_transaksi=1  AND a.atten_date>='${startPeriode}'  AND a.atten_date<='${endPeriode}'
    UNION ALL
    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee  b ON b.em_id=a.em_id  
  JOIN ${database}_hrm.overtime o ON o.id=a.typeid 
  WHERE a.em_id=b.em_id AND a.status_pengajuan != 'draft'
  AND (
    (o.dinilai = 'N' AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%'))
    OR 
    (o.dinilai = 'Y' AND (a.em_delegation LIKE '%${em_id}%' OR a.em_ids LIKE '%${em_id}%'))
)

  AND a.status IN ('Pending', 'Approve') AND a.ajuan='1'  
  AND a.status_transaksi=1   AND a.atten_date>='${startPeriode}' AND a.atten_date<='${endPeriode}'  
    `;

      query4 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.status IN ('Pending', 'Approve') AND a.ajuan='2'   AND a.status_transaksi=1 AND a.atten_date>='${startPeriode}'
    UNION ALL
    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.status IN ('Pending', 'Approve') AND a.ajuan='2'   AND a.status_transaksi=1 AND a.atten_date<='${endPeriode}'
    `;

      query5 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='4'   AND a.status_transaksi=1 AND a.atten_date>='${startPeriode}'
    UNION ALL
    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b JOIN  ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='4'   AND a.status_transaksi=1 AND a.atten_date<='${endPeriode}'
    `;

      query6 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_claim a JOIN ${database}_hrm.employee b JOIN  
    ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  
    AND a.status IN ('Pending', 'Approve') AND a.created_on>='${startPeriode}'
    UNION ALL

    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_claim a JOIN ${database}_hrm.employee b JOIN  
    ${database}_hrm.branch ON b.branch_id=branch.id  WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  
    AND a.status IN ('Pending', 'Approve') AND a.created_on<='${endPeriode}'
    `;

      query7 = `SELECT designation.payroll_approval, a.em_id, b.full_name FROM ${namaDatabaseDynamic}.emp_mobile_approval a 
    JOIN ${database}_hrm.employee b JOIN ${database}_hrm.designation ON designation.id=b.des_id WHERE a.em_id=b.em_id 
    AND (a.approved_id IS NULL OR  a.approved_id ='') AND designation.payroll_approval  LIKE '%${em_id}%'  AND a.created_date=CURDATE()`;

      query8 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
    JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
    WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND (a.ajuan='3' OR a.ajuan='5') AND a.status_transaksi=1
    AND a.tgl_ajuan>='${startPeriode}'
    
    UNION ALL
    SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
    JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
    WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND (a.ajuan='3' OR a.ajuan='5') AND a.status_transaksi=1
    AND a.tgl_ajuan<='${endPeriode}'
    `;

      query9 = `SELECT a.em_id, b.full_name FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
    JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
    WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND a.ajuan='4' AND a.status_transaksi=1 AND a.tgl_ajuan>='${startPeriode}'
     UNION ALL
     SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b 
    JOIN  ${database}_hrm.branch ON b.branch_id=branch.id
    WHERE a.em_id=b.em_id AND b.em_report_to LIKE '%${em_id}%' AND a.status IN ('Pending', 'Approve') AND a.ajuan='4' AND a.status_transaksi=1 AND a.tgl_ajuan<='${endPeriode}'
    
    `;
      query10 = `SELECT * FROM ${database}_hrm.emp_loan LEFT JOIN ${database}_hrm.sysdata ON  sysdata.kode='019' WHERE sysdata.name LIKE '%${em_id}%' AND emp_loan.status='Pending'   AND emp_loan.em_id!='${em_id}' `;
   
      query13 = `${query13} UNION ALL SELECT a.em_id, b.full_name FROM ${endPeriodeDynamic}.emp_leave a JOIN ${database}_hrm.employee b  
      JOIN  ${database}_hrm.branch ON b.branch_id=branch.id WHERE a.em_id=b.em_id AND (b.em_report_to LIKE '%${em_id}%' OR b.em_report2_to LIKE '%${em_id}%')  
      AND a.leave_status IN ('Pending', 'Approve') AND a.ajuan='5'  AND a.status_transaksi=1 AND a.atten_date<='${endPeriode}'`;

    }

    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `${query1};${query2};${query3};${query4};${query5};${query6};${query7};${query8};${query9};${query10};${query11};${query12};${query13}`
      );
      
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil data!",
        jumlah_tidak_hadir: results[0]?.length || 0,
        jumlah_cuti: results[1]?.length || 0,
        jumlah_lembur: results[2]?.length || 0,
        jumlah_tugasluar: results[3]?.length || 0,
        jumlah_dinasluar: results[4]?.length || 0,
        jumlah_klaim: results[5]?.length || 0,
        jumlah_payroll: results[6]?.length || 0,
        jumlah_checkin: results[7]?.length || 0,
        jumlah_wfh: results[8]?.length || 0,
        jumlah_kasbon: results[9]?.length || 0,
        jumlah_surat_peringatan: results[10]?.length || 0,
        jumlah_teguran_lisan: results[11]?.length || 0,
        jumlah_dayoff: results[12]?.length || 0,
        data1: results[0] || [],
        data2: results[1] || [],
        data3: results[2] || [],
        data4: results[3] || [],
        data5: results[4] || [],
        data6: results[5] || [],
        data7: results[6] || [],
        data8: results[7] || [],
        data9: results[8] || [],
        data10: results[9] || [],
        data11: results[10] || [],
        data12: results[11] || [],
        data13: results[12] || [],
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}