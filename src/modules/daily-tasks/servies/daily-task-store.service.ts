import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface DailyTasksStoreDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: Array<{ task: string; judul: string; status: string; level: number; tgl_finish: string }>;
  status: string;
  id?: string;
}

function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

@Injectable()
export class DailyTasksStoreService {
  async insertDailyTask(dto: DailyTasksStoreDto): Promise<any> {
    const model = require('../../../common/model');
    const database = dto.database;
    const em_id = dto.em_id;
    const array = dto.atten_date.split('-');
    const listTask = dto.list_task;
    const attenDate = dto.atten_date;
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
        `SELECT id FROM daily_task WHERE tgl_buat = ? AND em_id = ?`,
        [attenDate, em_id]
      );
      if (cekDaily.length > 0) {
        throw new InternalServerErrorException(`Tugas di tanggal ${attenDate} ini sudah tersedia`);
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