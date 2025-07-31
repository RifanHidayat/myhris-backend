import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName } from 'src/common/utils';

interface DailyTaskListDto {
  database: string;
  em_id: string;
  bulan: string;
  tahun: string;
  atasanStatus?: string;
  tenant?: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class DailyTaskListService {
  constructor(private readonly dbService: DbService) {}

  async getAllDailyTask(dto: DailyTaskListDto): Promise<any> {
    const { database, em_id, bulan, tahun, atasanStatus, tenant, start_periode, end_periode } = dto;
    
    console.log("-----getAllDailyTask service----------");
    console.log("data request ", dto);
 
    // Validate required parameters
    if (!start_periode || !end_periode || !tenant) {
      throw new InternalServerErrorException('start_periode, end_periode, dan tenant harus disediakan');
    }
 
    const startPeriodeDynamic = formatDbName(start_periode, tenant);
    const endPeriodeDynamic = formatDbName(end_periode, tenant);
    
    let date1 = new Date(start_periode); 
    let date2 = new Date(end_periode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    
    // Determine which database to use
    let namaDatabaseDynamic = endPeriodeDynamic;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      namaDatabaseDynamic = startPeriodeDynamic;
    }
    
    console.log("month end", monthEnd);
    console.log("month start", montStart);

    const databaseMaster = `${database}_hrm`;
    const knex = this.dbService.getConnection(database);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // Get latest task date
      const queryCek = `SELECT tgl_buat FROM ${namaDatabaseDynamic}.daily_task WHERE em_id = ? ORDER BY tgl_buat DESC LIMIT 1`;
      const [cekdata] = await trx.raw(queryCek, [em_id]);
      
      let tglFinal;
      if (cekdata.length > 0 && cekdata[0].tgl_buat) {
        const tglBuat = cekdata[0].tgl_buat.toISOString().split("T")[0];
        const today = new Date();
        const tglBuatDate = new Date(tglBuat);
        if (tglBuatDate > today) {
          tglFinal = tglBuat;
        } else {
          tglFinal = new Date().toISOString().split("T")[0];
        }
      } else {
        tglFinal = new Date().toISOString().split("T")[0];
      }
      
      // Get sysdata for approval status
      const querySysData = `SELECT * FROM ${databaseMaster}.sysdata WHERE KODE='013'`;
      const [sysdata] = await trx.raw(querySysData);
      
      const approvalStatus = sysdata[0].name == "1" || sysdata[0].name == 1 ? "Approve" : "Approve2";
      
      // Query for first period
      const queryTaskPersetujuan1 = `WITH RECURSIVE DateRange AS (
        SELECT DATE_FORMAT('${start_periode}' ,'%Y-%m-01') AS DATE
        UNION ALL
        SELECT DATE + INTERVAL 1 DAY
        FROM DateRange
        WHERE DATE + INTERVAL 1 DAY <= LAST_DAY(DATE_FORMAT('${start_periode}' ,'%Y-%m-01'))
      )
      SELECT
        DateRange.date,
        (SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND atten_date=DateRange.date AND ajuan='1' AND status='${approvalStatus}' LIMIT 1) AS lembur,
        (SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${em_id}' AND atten_date=DateRange.date AND ajuan='2' AND status='${approvalStatus}' LIMIT 1) AS tugas_luar,
        (SELECT b.name FROM ${namaDatabaseDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='1' AND leave_status='${approvalStatus}' LIMIT 1) AS cuti,
        (SELECT b.name FROM ${namaDatabaseDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='2' AND leave_status='${approvalStatus}' LIMIT 1) AS sakit,
        (SELECT b.name FROM ${namaDatabaseDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='3' AND leave_status='${approvalStatus}' LIMIT 1) AS izin,
        (SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_leave WHERE em_id='${em_id}' AND date_selected LIKE '%DateRange.date%' AND ajuan='4' AND leave_status='${approvalStatus}' LIMIT 1) AS dinas_luar,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id AND daily_task_detail.status = '0') AS total_status_0,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id AND daily_task_detail.status = '1') AS total_status_1,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id) AS jumlah_task,
        (SELECT IFNULL(off_date,0) FROM ${namaDatabaseDynamic}.emp_shift WHERE em_id='${em_id}' AND atten_date LIKE DateRange.date) AS off_date,
        holiday.name AS hari_libur,
        daily_task.*
      FROM DateRange 
      LEFT JOIN ${namaDatabaseDynamic}.daily_task ON daily_task.tgl_buat=DateRange.date AND em_id='${em_id}' AND daily_task.status_pengajuan != '${atasanStatus}'
      LEFT JOIN ${database}_hrm.holiday_date ON holiday_date.holiday_date=DateRange.date 
      LEFT JOIN ${database}_hrm.holiday ON holiday.id=holiday_date.holiday_id
      WHERE DateRange.date <= '${tglFinal}' AND DateRange.date >= '${start_periode}'
      ORDER BY DateRange.date DESC`;

      // Query for second period
      const queryTaskPersetujuan2 = `WITH RECURSIVE DateRange AS (
        SELECT DATE_FORMAT('${end_periode}' ,'%Y-%m-01') AS DATE
        UNION ALL
        SELECT DATE + INTERVAL 1 DAY
        FROM DateRange
        WHERE DATE + INTERVAL 1 DAY <= LAST_DAY(DATE_FORMAT('${end_periode}' ,'%Y-%m-01'))
      )
      SELECT
        DateRange.date,
        (SELECT nomor_ajuan FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND atten_date=DateRange.date AND ajuan='1' AND status='${approvalStatus}' LIMIT 1) AS lembur,
        (SELECT nomor_ajuan FROM ${endPeriodeDynamic}.emp_labor WHERE em_id='${em_id}' AND atten_date=DateRange.date AND ajuan='2' AND status='${approvalStatus}' LIMIT 1) AS tugas_luar,
        (SELECT b.name FROM ${endPeriodeDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='1' AND leave_status='${approvalStatus}' LIMIT 1) AS cuti,
        (SELECT b.name FROM ${endPeriodeDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='2' AND leave_status='${approvalStatus}' LIMIT 1) AS sakit,
        (SELECT b.name FROM ${endPeriodeDynamic}.emp_leave JOIN ${database}_hrm.leave_types b ON emp_leave.typeid=b.id WHERE em_id='${em_id}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='3' AND leave_status='${approvalStatus}' LIMIT 1) AS izin,
        (SELECT nomor_ajuan FROM ${endPeriodeDynamic}.emp_leave WHERE em_id='${em_id}' AND date_selected LIKE '%DateRange.date%' AND ajuan='4' AND leave_status='${approvalStatus}' LIMIT 1) AS dinas_luar,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id AND daily_task_detail.status = '0') AS total_status_0,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id AND daily_task_detail.status = '1') AS total_status_1,
        (SELECT COUNT(*) FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_detail.daily_task_id = daily_task.id) AS jumlah_task,
        (SELECT IFNULL(off_date,0) FROM ${endPeriodeDynamic}.emp_shift WHERE em_id='${em_id}' AND atten_date LIKE DateRange.date) AS off_date,
        holiday.name AS hari_libur,
        daily_task.*
      FROM DateRange 
      LEFT JOIN ${endPeriodeDynamic}.daily_task ON daily_task.tgl_buat=DateRange.date AND em_id='${em_id}' AND daily_task.status_pengajuan != '${atasanStatus}'
      LEFT JOIN ${database}_hrm.holiday_date ON holiday_date.holiday_date=DateRange.date 
      LEFT JOIN ${database}_hrm.holiday ON holiday.id=holiday_date.holiday_id
      WHERE DateRange.date <= '${tglFinal}' AND DateRange.date <= '${end_periode}'
      ORDER BY DateRange.date DESC`;

      console.log("Query 1:", queryTaskPersetujuan1);
      
      const rawResultTask1 = (await trx.raw(queryTaskPersetujuan1)) as
        | { rows?: { em_id: string }[] }
        | { em_id: string }[][];

      // Ambil rows-nya tergantung database client
      const taskResult1: { em_id: string }[] = Array.isArray(
        rawResultTask1,
      )
        ? rawResultTask1[0]
        : (rawResultTask1.rows ?? []);

      const rawResultTask2 = (await trx.raw(queryTaskPersetujuan2)) as
        | { rows?: { em_id: string }[] }
        | { em_id: string }[][];

      // Ambil rows-nya tergantung database client
      const taskResult2: { em_id: string }[] = Array.isArray(
        rawResultTask2,
      )
        ? rawResultTask2[0]
        : (rawResultTask2.rows ?? []);

      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        for (let i = 0; i < taskResult1.length; i++) {
          taskResult2.push(taskResult1[i]);
        }
      }
      console.log("taskResult2", queryTaskPersetujuan2);

      // ----------------------------------------------------------------------------------
      await trx.commit();
      return {
        status: true,
        message: 'Success get daily tasks',
        data: taskResult2,
      };
      
    } catch (error) {
      if (trx) await trx.rollback();
      console.error("--------gagal dapatkan data AllDailyTask", error);
      throw new InternalServerErrorException('Gagal dapatkan data AllDailyTask: ' + error.message);
    }
  }
}