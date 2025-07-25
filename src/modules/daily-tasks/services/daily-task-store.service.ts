import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface DailyTasksStoreDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: Array<{
    task: string;
    judul: string;
    status: string;
    level: number;
    tgl_finish: string;
  }>;
  status: string;
  id?: string;
  tenant?: string;
  emId?: string;
  start_periode?: string;
  end_periode?: string;
}

function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

@Injectable()
export class DailyTasksStoreService {
  constructor(private readonly dbService: DbService) {}

  async insertDailyTask(dto: DailyTasksStoreDto): Promise<any> {
    const { database, em_id, atten_date, list_task, status, id, tenant, emId, start_periode, end_periode } = dto;
    const array = atten_date.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = array[1].padStart(2, '0');
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      const [cekDaily] = await trx.raw(
        `SELECT id FROM ${namaDatabaseDynamic}.daily_task WHERE tgl_buat = ? AND em_id = ?`,
        [atten_date, em_id],
      );
      if (cekDaily.length > 0) {
        throw new InternalServerErrorException(`Tugas di tanggal ${atten_date} ini sudah tersedia`);
      } else {
        const queryTask = `INSERT INTO ${namaDatabaseDynamic}.daily_task (em_id, tgl_buat, status_pengajuan) VALUES (?, ?, ?)`;
        const [task] = await trx.raw(queryTask, [em_id, atten_date, status]);
        const taskId = task.insertId || (task[0] && task[0].insertId);
        const queryDetail = `INSERT INTO ${namaDatabaseDynamic}.daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
        for (const item of list_task) {
          const { task, judul, status, level, tgl_finish } = item;
          const tanggal = formatDate(tgl_finish);
          await trx.raw(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
        }
      }
      await trx.commit();
      return {
        success: true,
        message: 'Data Berhasil Ditambahkan',
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal menambahkan data: ' + error.message);
    }
  }
}
