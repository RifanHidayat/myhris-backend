import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import {
  convertDaysToYMD,
  formatDbNameNow,
  databaseMaster,
  getDateNow,
} from '../../../common/utils';

interface EmployeeDetailResult {
  em_id: string;
  dep_id: string;
  tipe_absen: string;
  lama_bekerja: string;
  sisa_kontrak: string;
  em_status: string;
  tanggal_berakhir_kontrak: string;
  [key: string]: any;
}
interface EmployeeHistoryResult {
  description: string;
  end_date: string;
  [key: string]: any;
}
interface DepartmentResult {
  tipe_absen: string;
  [key: string]: any;
}

@Injectable()
export class EmployeeDetailService {
  constructor(private readonly dbService: DbService) {}

  async detail(dto: { tenant: string; emId: string }): Promise<any> {
    console.log('Masuk function employee/detail');
    console.log('dto', dto.tenant);
    const databasePeriode = formatDbNameNow(dto.tenant);
    const database = dto.tenant;
    const dateNow = getDateNow();
    const emId = dto.emId;
    const tenant = dto.tenant;
    const currentDate = new Date();
    const query = `
      SELECT
        IFNULL((SELECT  IFNULL(work_schedule.time_in ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS jam_masuk,
        IFNULL((SELECT  IFNULL(work_schedule.time_in ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS time_in,
        IFNULL((SELECT  IFNULL(work_schedule.time_out ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS jam_keluar,
        IFNULL((SELECT  IFNULL(work_schedule.time_out ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS time_out,
        a.tipe_absen,
        IFNULL(employee_history.description ,em_status) as em_status,
        a.dep_id,
        IFNULL(MAX(employee_history.end_date) ,'')AS tanggal_berakhir_kontrak,
        IFNULL(DATEDIFF(MAX(employee_history.end_date), CURDATE()),'0') AS sisa_kontrak,
        IFNULL(DATEDIFF(CURDATE(),a.em_joining_date),'0') AS lama_bekerja,
        em_bpjs_kesehatan AS nomor_bpjs_kesehatan,em_bpjs_tenagakerja AS nomor_bpjs_tenagakerja,
        (SELECT beginday_payroll FROM payment_schedule WHERE is_default='Y' LIMIT 1) AS begin_payroll,
        (SELECT NAME FROM sysdata WHERE id='18') AS time_attendance,
        (SELECT NAME FROM sysdata WHERE kode='012') AS is_view_tracking,
        (SELECT NAME FROM sysdata WHERE id='006') AS interval_tracking,
        (SELECT NAME FROM sysdata WHERE kode='021') AS back_date,
        (SELECT NAME FROM sysdata WHERE kode='001') AS periode_awal,
        (SELECT NAME FROM sysdata WHERE kode='040') AS durasi_absen_masuk,
        (SELECT NAME FROM sysdata WHERE kode='041') AS durasi_absen_keluar,
        (SELECT NAME FROM sysdata WHERE kode= '038') AS tipe_alpha,
        a.em_tracking  AS is_tracking,
        CASE 
        WHEN (SELECT COUNT(*) FROM sysdata WHERE kode='046' AND name LIKE '%${emId}%') > 0 THEN 1
        ELSE 0
        END AS is_audit,
        branch_id,
        a.file_face,
        a.loan_limit,
        (SELECT endday_payroll FROM payment_schedule WHERE is_default='Y' LIMIT 1) AS end_payroll,
        em_control, em_controlaccess AS em_control_access,
        branch.name AS branch_name, a.em_id, full_name, em_email, des_id, dep_id, dep_group_id AS dep_group, em_mobile AS em_phone, em_birthday, em_blood_group, em_gender, em_image, em_joining_date, job_title AS posisi, em_hak_akses, last_login, a.status AS status_aktif, em_controlaccess AS em_control_access, b.name AS emp_jobTitle,c.name AS emp_departmen,em_att_working AS emp_att_working FROM employee a 
        LEFT JOIN employee_history ON a.em_id=employee_history.em_id LEFT JOIN designation b ON a.des_id=b.id 
        LEFT JOIN department c ON a.dep_id=c.id LEFT JOIN branch ON branch.id=a.branch_id WHERE a.em_id='${emId}'
        GROUP BY a.em_id
    `;


    console.log('query employee detail :   ', query);

    const knex = this.dbService.getConnection(database);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      const rawResults = (await trx.raw(query)) as
        | { rows?: EmployeeDetailResult[] }
        | EmployeeDetailResult[][];
      console.log('Raw results:', rawResults[0]);
      
      if (!Array.isArray(rawResults[0]) || rawResults[0].length === 0) {
        await trx.rollback();
        throw new NotFoundException('Employee not found');
      }
      
      const results: EmployeeDetailResult[] = Array.isArray(rawResults)
        ? rawResults[0]
        : (rawResults.rows ?? []);
        
      const queryHistory = `SELECT * FROM employee_history WHERE em_id='${emId}' ORDER BY id DESC`;
      const rawHistory = (await trx.raw(queryHistory)) as
        | { rows?: EmployeeHistoryResult[] }
        | EmployeeHistoryResult[][];
      const history: EmployeeHistoryResult[] = Array.isArray(rawHistory)
        ? rawHistory[0]
        : (rawHistory.rows ?? []);
        
      const rawDepartment = (await trx.raw(
        `SELECT * FROM department WHERE id='${results[0].dep_id}'`,
      )) as { rows?: DepartmentResult[] } | DepartmentResult[][];
      const department: DepartmentResult[] = Array.isArray(rawDepartment)
        ? rawDepartment[0]
        : (rawDepartment.rows ?? []);
        
      const getDaysDifference = (endDate: string) => {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) return 0;
        const diffInMs = end.getTime() - currentDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        return diffInDays + 1;
      };
      
      if (history.length > 0) {
        results[0].em_status = history[0].description;
        results[0].tanggal_berakhir_kontrak = history[0].end_date;
        const sisaKontrak = getDaysDifference(history[0].end_date);
        if (results[0].em_status == 'PERMANENT') {
          results[0].sisa_kontrak = '0';
          results[0].tanggal_berakhir_kontrak = '';
        } else {
          results[0].sisa_kontrak = sisaKontrak.toString();
        }
      }
      

      
      if (
        results[0].tipe_absen == '' ||
        results[0].tipe_absen == '0' ||
        results[0].tipe_absen == null ||
        results[0].tipe_absen == undefined
      ) {
        results[0].tipe_absen = department[0]?.tipe_absen;
      }
      
      const totalDays = parseInt(results[0].lama_bekerja);
      const result = convertDaysToYMD(totalDays);
      let formatLamaBekerja = '';
      if (result.tahun != 0) {
        formatLamaBekerja = `${result.tahun} Tahun ${result.bulan} Bulan ${result.hari} Hari`;
      } else {
        if (result.bulan != 0) {
          formatLamaBekerja = `${result.bulan} bulan ${result.hari} Hari`;
        } else {
          formatLamaBekerja = `${result.hari} Hari`;
        }
      }
      
      const totalDaysKontrak = parseInt(results[0].sisa_kontrak);
      const result1 = convertDaysToYMD(totalDaysKontrak);
      let formatSisaKontrak = '';
      if (result1.tahun != 0) {
        formatSisaKontrak = `${result1.tahun} Tahun ${result1.bulan} Bulan ${result1.hari} Hari`;
      } else {
        if (result1.bulan != 0) {
          formatSisaKontrak = `${result1.bulan} Bulan ${result1.hari} Hari`;
        } else {
          formatSisaKontrak = `${result1.hari} hr`;
        }
      }
      
      if (totalDaysKontrak == 0) {
        formatSisaKontrak = '';
      }
      
      results[0].sisa_kontrak_format = formatSisaKontrak;
      results[0].lama_bekerja_format = formatLamaBekerja;
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Success get employee detail',
        data: results[0],
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Employee detail service error:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
