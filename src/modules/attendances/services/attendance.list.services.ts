import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName } from 'src/common/utils';

interface SysData {
  name: string;
}

@Injectable()
export class AttendanceListService {
  constructor(private readonly dbService: DbService) {}

  async index(dto: {
    tenant: string;
    emId: string;
    branchId: string;
    startPeriode: string;
    endPeriode: string;
  }): Promise<any> {
    console.log('Masuk function employee/detail');
    const tenant = dto.tenant;
    const emId = dto.emId;
    const startPeriode = dto.startPeriode;
    const endPeriode = dto.endPeriode;
    const dbstart = formatDbName(startPeriode, tenant);
    const dbEnd = formatDbName(endPeriode, tenant);

    // Ubah string ke objek Date
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);

    // Ambil bulan dan tahun
    const monthStart = date1.getMonth(); // bulan mulai, 0-11
    const monthEnd = date2.getMonth(); // bulan akhir, 0-11

    const yearStart = date1.getFullYear();
    const yearEnd = date2.getFullYear();

    // Misal sudah ada dua array result dan result2
    //const result: any[] = [...];  // data dari query/perhitungan
    //const result2: any[] = [...]; // data dari query/perhitungan

    const knex = this.dbService.getConnection(tenant);
    let trx;
    try {
      //employee
      trx = await knex.transaction();
      // place coordinate
      const sysDataRow = await trx('sysdata')
        .select('name')
        .where('kode', '013')
        .first() as SysData | undefined;

      const statusApprove =
        String(sysDataRow?.name) === '1' ? 'Approve' : 'Approve2';

      // ambil tugas luar dari emp_labor dan emp_leave
      const query1 = `
 WITH RECURSIVE DateRange AS (
          SELECT DATE_FORMAT('${startPeriode}' ,'%Y-%m-01') AS DATE
          UNION ALL
          SELECT DATE + INTERVAL 1 DAY
          FROM DateRange
          WHERE DATE + INTERVAL 1 DAY <= LAST_DAY(DATE_FORMAT('${startPeriode}' ,'%Y-%m-01'))
      )
      SELECT
       DateRange.date,
      (SELECT nomor_ajuan FROM ${dbstart}.emp_labor LEFT JOIN overtime ON overtime.id=emp_labor.typeId WHERE em_id='${emId}' AND atten_date=DateRange.date AND ajuan='1' 
      AND status='${statusApprove}' LIMIT 1) AS lembur ,
      (SELECT nomor_ajuan FROM ${dbstart}.emp_labor WHERE em_id='${emId}' AND atten_date=DateRange.date AND ajuan='2' AND status='${statusApprove}' LIMIT 1) AS tugas_luar ,
      (SELECT b.name FROM ${dbstart}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id WHERE em_id='${emId}' AND date_selected  LIKE CONCAT('%',DateRange.date,'%')  AND ajuan='1' AND leave_status='${statusApprove}' LIMIT 1) AS cuti ,
      (SELECT b.name FROM ${dbstart}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id  WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='2' AND leave_status='${statusApprove}'  LIMIT 1) AS sakit ,
      (SELECT b.name FROM ${dbstart}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id  WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='3' AND leave_status='${statusApprove}'  LIMIT 1) AS izin ,
      (SELECT nomor_ajuan FROM ${dbstart}.emp_leave WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='4' AND leave_status='${statusApprove}' LIMIT 1) AS dinas_luar ,
      (SELECT  IFNULL(off_date ,0) FROM ${dbstart}.emp_shift WHERE em_id='${emId}' AND atten_date LIKE DateRange.date) AS off_date,
      
      IFNULL((SELECT  IFNULL(work_schedule.time_in ,attendance.signin_time) FROM ${dbstart}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${endPeriode}' AND emp_shift.atten_date LIKE DateRange.date) ,'08:31:00')AS jam_kerja,
      IFNULL((SELECT  IFNULL(work_schedule.time_out ,attendance.signout_time) FROM ${dbstart}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${endPeriode}' AND emp_shift.atten_date LIKE DateRange.date) ,'17:01:00')AS jam_pulang,
      holiday.name  AS hari_libur,attendance.*
      FROM DateRange 
      LEFT JOIN ${dbstart}.attendance ON attendance.atten_date=DateRange.date AND em_id='${emId}'
      LEFT JOIN holiday_date ON holiday_date.holiday_date=DateRange.date LEFT JOIN holiday ON holiday.id=holiday_date.holiday_id
      WHERE DateRange.date <=CURDATE()  AND DateRange.date>='${startPeriode}'
      ORDER BY DateRange.date DESC;
 `;

      const query2 = `
 WITH RECURSIVE DateRange AS (
          SELECT DATE_FORMAT('${endPeriode}' ,'%Y-%m-01') AS DATE
          UNION ALL
          SELECT DATE + INTERVAL 1 DAY
          FROM DateRange
          WHERE DATE + INTERVAL 1 DAY <= LAST_DAY(DATE_FORMAT('${endPeriode}' ,'%Y-%m-01'))
      )
      SELECT
       DateRange.date,
      (SELECT nomor_ajuan FROM ${dbEnd}.emp_labor LEFT JOIN overtime ON overtime.id=emp_labor.typeId WHERE em_id='${emId}' AND atten_date=DateRange.date AND ajuan='1' 
      AND status='${statusApprove}' LIMIT 1) AS lembur ,
      (SELECT nomor_ajuan FROM ${dbEnd}.emp_labor WHERE em_id='${emId}' AND atten_date=DateRange.date AND ajuan='2' AND status='${statusApprove}' LIMIT 1) AS tugas_luar ,
      (SELECT b.name FROM ${dbEnd}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id WHERE em_id='${emId}' AND date_selected  LIKE CONCAT('%',DateRange.date,'%')  AND ajuan='1' AND leave_status='${statusApprove}' LIMIT 1) AS cuti ,
      (SELECT b.name FROM ${dbEnd}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id  WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='2' AND leave_status='${statusApprove}'  LIMIT 1) AS sakit ,
      (SELECT b.name FROM ${dbEnd}.emp_leave JOIN leave_types b ON emp_leave.typeid=b.id  WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='3' AND leave_status='${statusApprove}'  LIMIT 1) AS izin ,
      (SELECT nomor_ajuan FROM ${dbEnd}.emp_leave WHERE em_id='${emId}' AND date_selected LIKE CONCAT('%',DateRange.date,'%') AND ajuan='4' AND leave_status='${statusApprove}' LIMIT 1) AS dinas_luar ,
      (SELECT  IFNULL(off_date ,0) FROM ${dbEnd}.emp_shift WHERE em_id='${emId}' AND atten_date LIKE DateRange.date) AS off_date,
      
      IFNULL((SELECT  IFNULL(work_schedule.time_in ,attendance.signin_time) FROM ${dbEnd}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${endPeriode}' AND emp_shift.atten_date LIKE DateRange.date) ,'08:31:00')AS jam_kerja,
      IFNULL((SELECT  IFNULL(work_schedule.time_out ,attendance.signout_time) FROM ${dbEnd}.emp_shift LEFT JOIN work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${endPeriode}' AND emp_shift.atten_date LIKE DateRange.date) ,'17:01:00')AS jam_pulang,
      holiday.name  AS hari_libur,attendance.*
      FROM DateRange 
      LEFT JOIN ${dbEnd}.attendance ON attendance.atten_date=DateRange.date AND em_id='${emId}'
      LEFT JOIN holiday_date ON holiday_date.holiday_date=DateRange.date LEFT JOIN holiday ON holiday.id=holiday_date.holiday_id
      WHERE DateRange.date <=CURDATE()  AND DateRange.date<='${endPeriode}'
      ORDER BY DateRange.date DESC;
 `;

      const rawResultAttendance1 = (await trx.raw(query1)) as
        | { rows?: { em_id: string }[] }
        | { em_id: string }[][];

      // Ambil rows-nya tergantung database client
      const attendanceResult1: { em_id: string }[] = Array.isArray(
        rawResultAttendance1,
      )
        ? rawResultAttendance1[0]
        : (rawResultAttendance1.rows ?? []);

      const rawResultAttendance2 = (await trx.raw(query2)) as
        | { rows?: { em_id: string }[] }
        | { em_id: string }[][];

      // Ambil rows-nya tergantung database client
      const attendanceResult2: { em_id: string }[] = Array.isArray(
        rawResultAttendance2,
      )
        ? rawResultAttendance2[0]
        : (rawResultAttendance2.rows ?? []);

      if (monthStart < monthEnd || yearStart < yearEnd) {
        for (let i = 0; i < attendanceResult1.length; i++) {
          attendanceResult2.push(attendanceResult1[i]);
        }
      }
      console.log("attendanceResult2", query2);

      // ----------------------------------------------------------------------------------
      await trx.commit();
      return {
        status: true,
        message: 'Success get attendance',
        data: attendanceResult2
      };
    } catch (error) {
      // trx bisa undefined jika error sebelum assignment
      if (trx) await trx.rollback();
      console.error('Error in attendance list service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
