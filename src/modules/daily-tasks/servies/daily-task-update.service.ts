import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface DailyTasksUpdateDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: Array<{ task: string; judul: string; status: string; level: number; tgl_finish: string; id?: number }>;
  id: string;
  status: string;
}

function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

@Injectable()
export class DailyTasksUpdateService {
  async updateDailyTask(dto: DailyTasksUpdateDto): Promise<any> {
    const model = require('../../../common/model');
    const database = dto.database;
    const em_id = dto.em_id;
    const array = dto.atten_date.split('-');
    const listTask = dto.list_task;
    const attenDate = dto.atten_date;
    const id = dto.id;
    const status = dto.status;
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = array[1].padStart(2, '0');
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const connection = await model.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [cekDaily] = await conn.query(
        `SELECT * FROM daily_task WHERE em_id = ? AND id = ?`,
        [em_id, id]
      );
      if (cekDaily.length > 0) {
        const taskId = cekDaily[0].id;
        const queryTask = `UPDATE daily_task SET em_id = ?, tgl_buat = ?, status_pengajuan = ? WHERE id = ?`;
        const queryDetail = `INSERT INTO daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
        await conn.query(queryTask, [em_id, attenDate, status, taskId]);
        const deleteQuery = `DELETE FROM daily_task_detail WHERE daily_task_id = ?`;
        await conn.query(deleteQuery, [taskId]);
        for (const item of listTask) {
          const { task, judul, status, level, tgl_finish } = item;
          const tanggal = formatDate(tgl_finish);
          await conn.query(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
        }
      } else {
        const queryTask = `INSERT INTO daily_task (em_id, tgl_buat, status_pengajuan) VALUES (?, ?, ?)`;
        const queryDetail = `INSERT INTO daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
        const [task] = await conn.query(queryTask, [em_id, attenDate, status]);
        const taskId = task.insertId;
        for (const item of listTask) {
          const { task, judul, status, level, tgl_finish } = item;
          const tanggal = formatDate(tgl_finish);
          await conn.query(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
        }
      }
      await conn.commit();
      return {
        success: true,
        message: 'Data Berhasil Ditambahkan',
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw new InternalServerErrorException('Gagal menambahkan data: ' + error.message);
    } finally {
      if (conn) conn.release();
    }
  }
} 