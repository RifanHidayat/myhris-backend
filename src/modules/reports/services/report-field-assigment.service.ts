import { Injectable } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

/**
 * Service Report untuk Penugasan Lapangan
 */
@Injectable()
export class ReportFieldAssigmentService {
  constructor(private readonly dbService: DbService) {}

  async loadLaporanPengajuanTugasLuar(params: {
    database: string,
    emId: string,
    branchId: string,
    status: string,
    type: string,
    statusAjuan: string,
    tahun: string,
    bulan: string,
    startPeriode: string,
    endPeriode: string
  }) {
    const { database, emId, branchId, status, type, statusAjuan, tahun, bulan, startPeriode, endPeriode } = params;
    let ajuanStatus;
    if (type == "cuti" || type == "tidak_hadir") {
      if (statusAjuan == "Rejected") {
        ajuanStatus = `a.leave_status = 'Rejected'`;
      } else if (statusAjuan == "Approve 1") {
        ajuanStatus = `a.leave_status = 'Approve1'`;
      } else if (statusAjuan == "Approve 2") {
        ajuanStatus = `a.leave_status = 'Approve2'`;
      } else if (statusAjuan == "Pending") {
        ajuanStatus = `a.leave_status = 'Pending'`;
      } else {
        ajuanStatus = `a.leave_status != 'Cancel'`;
      }
    } else {
      if (statusAjuan == "Rejected") {
        ajuanStatus = `a.status = 'Rejected'`;
      } else if (statusAjuan == "Approve 1") {
        ajuanStatus = `a.status = 'Approve1'`;
      } else if (statusAjuan == "Approve 2") {
        ajuanStatus = `a.status = 'Approve2'`;
      } else if (statusAjuan == "Pending") {
        ajuanStatus = `a.status = 'Pending'`;
      } else {
        ajuanStatus = `a.status != 'Cancel'`;
      }
    }
    const convertYear = tahun.substring(2, 4);
    const convertBulan = bulan;
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const array1 = startPeriode.split("-");
    const array2 = endPeriode.split("-");
    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    let query1_tugas_luar = `SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE ${ajuanStatus} AND month(a.atten_date)='${bulan}' AND year(a.atten_date)='${tahun}' AND a.ajuan='2'   AND b.branch_id=${branchId} GROUP BY b.full_name`;
    let query2_tugas_luar = `SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${namaDatabaseDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE ${ajuanStatus} AND month(a.atten_date)='${bulan}' AND year(a.atten_date)='${tahun}' AND b.dep_id='${status}' AND a.ajuan='2'   AND b.branch_id=${branchId} GROUP BY b.full_name`;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      query1_tugas_luar = `SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE  a.ajuan='2'   AND  a.tgl_ajuan>='${startPeriode}' AND a.tgl_ajuan<='${endPeriode}'  GROUP BY b.full_name
     UNION ALL
     SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE  a.ajuan='2'   AND  a.tgl_ajuan>='${startPeriode}' AND a.tgl_ajuan<='${endPeriode}'  GROUP BY b.full_name
     `;
      query2_tugas_luar = `SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${startPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE  b.dep_id='${status}' AND a.ajuan='2'   AND  a.tgl_ajuan>='${startPeriode}' AND a.tgl_ajuan<='${endPeriode}' GROUP BY b.full_name
     UNION ALL 
     SELECT a.*, b.full_name, b.job_title, count(*) as jumlah , b.em_image as image FROM ${endPeriodeDynamic}.emp_labor a JOIN ${database}_hrm.employee b ON a.em_id=b.em_id WHERE b.dep_id='${status}' AND a.ajuan='2'   AND  a.atten_date>='${startPeriode}' AND a.atten_date<='${endPeriode}'  GROUP BY b.full_name
     `;
    }
    let url;
    if (status == "0") {
      url = query1_tugas_luar;
    } else {
      url = query2_tugas_luar;
    }
    try {
      const knex = this.dbService.getConnection(database);
      const results = await knex.raw(url);
      return {
        status: true,
        message: "Berhasil ambil!",
        data: results[0],
        jumlah: 1,
      };
    } catch (e) {
      return {
        status: false,
        message: "Gagal ambil data",
        error: e.message,
      };
    }
  }
}
