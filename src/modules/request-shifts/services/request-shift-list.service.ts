import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface RequestShiftListDto {
  database: string;
  em_id: string;
  start_periode?: string;
  end_periode?: string;
}

const model = require('../../../common/model');

@Injectable()
export class RequestShiftListService {
  async show(dto: RequestShiftListDto): Promise<any> {
    const { database, em_id, start_periode, end_periode } = dto;
    const startPeriode = start_periode || '2024-02-03';
    const endPeriode = end_periode || '2024-02-03';
    const array1 = startPeriode.split('-');
    const array2 = endPeriode.split('-');
    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${array1[1]}`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${array2[1]}`;
    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      let url = `SELECT el.id, el.nomor_ajuan, el.tgl_ajuan, el.dari_tgl, el.sampai_tgl, el.status, el.uraian, el.work_id_old, el.work_id_new, el.alasan1,el.alasan2,el.approve_by,el.approve2_by, a.name AS name_old, a.time_in AS time_in_old, a.time_out AS time_out_old, b.name AS name_new, b.time_in AS time_in_new, b.time_out AS time_out_new, e.full_name AS name_delegasi FROM ${startPeriodeDynamic}.emp_labor AS el LEFT JOIN work_schedule AS a ON el.work_id_old = a.id LEFT JOIN work_schedule AS b ON el.work_id_new = b.id LEFT JOIN employee e ON el.em_delegation=e.em_id WHERE el.em_id='${em_id}' AND el.status_transaksi=1 AND (el.tgl_ajuan>='${startPeriode}' AND el.tgl_ajuan<='${endPeriode}') AND el.ajuan = '4'   ORDER BY id DESC`;
      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        url = `SELECT el.id, el.nomor_ajuan, el.tgl_ajuan, el.dari_tgl, el.sampai_tgl, el.status, el.uraian, el.work_id_old, el.work_id_new, el.alasan1,el.alasan2,el.approve_by,el.approve2_by, a.name AS name_old, a.time_in AS time_in_old, a.time_out AS time_out_old, b.name AS name_new, b.time_in AS time_in_new, b.time_out AS time_out_new, e.full_name AS name_delegasi FROM ${startPeriodeDynamic}.emp_labor AS el LEFT JOIN work_schedule AS a ON el.work_id_old = a.id LEFT JOIN work_schedule AS b ON el.work_id_new = b.id LEFT JOIN employee e ON el.em_delegation=e.em_id WHERE el.em_id='${em_id}' AND el.status_transaksi=1 AND (el.tgl_ajuan>='${startPeriode}' AND el.tgl_ajuan<='${endPeriode}') AND el.ajuan = '4' UNION ALL SELECT el.id, el.nomor_ajuan, el.tgl_ajuan, el.dari_tgl, el.sampai_tgl, el.status, el.uraian, el.work_id_old, el.work_id_new, el.alasan1,el.alasan2,el.approve_by,el.approve2_by, a.name AS name_old, a.time_in AS time_in_old, a.time_out AS time_out_old, b.name AS name_new, b.time_in AS time_in_new, b.time_out AS time_out_new, e.full_name AS name_delegasi FROM ${endPeriodeDynamic}.emp_labor AS el LEFT JOIN work_schedule AS a ON el.work_id_old = a.id LEFT JOIN work_schedule AS b ON el.work_id_new = b.id LEFT JOIN employee e ON el.em_delegation=e.em_id WHERE el.em_id='${em_id}' AND el.status_transaksi=1 AND (el.tgl_ajuan>='${startPeriode}' AND el.tgl_ajuan<='${endPeriode}') AND el.ajuan = '4'  ORDER BY id DESC`;
      }
      const [results] = await conn.query(url);
      await conn.commit();
      return {
        status: true,
        message: 'Successfuly get data',
        data: results,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Terjadi kesalahan');
    } finally {
      if (conn) await conn.release();
    }
  }
}    