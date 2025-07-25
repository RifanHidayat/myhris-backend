import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface UpdateDraftDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: any[];
  status: string;
  id: string | number;
  tenant?: string;
  start_periode?: string;
  end_periode?: string;
}

@Injectable()
export class DailyTaskDraftUpdateService {
  constructor(private readonly dbService: DbService) {}

  async updateDraft(dto: UpdateDraftDto): Promise<any> {
    const { database, em_id, atten_date, list_task, status, id, tenant, start_periode, end_periode } = dto;
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
        `SELECT * FROM ${namaDatabaseDynamic}.daily_task WHERE em_id = ? AND tgl_buat = ? AND id != ?`,
        [em_id, atten_date, id],
      );
      if (cekDaily.length > 0) {
        throw new BadRequestException(`Tugas di tanggal ${atten_date} ini sudah tersedia`);
      } else {
        const taskId = id.toString();
        const queryTask = `UPDATE ${namaDatabaseDynamic}.daily_task SET em_id = ?, tgl_buat = ?, status_pengajuan = ? WHERE id = ?`;
        const queryDetail = `INSERT INTO ${namaDatabaseDynamic}.daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
        await trx.raw(queryTask, [em_id, atten_date, status, taskId]);
        const deleteQuery = `DELETE FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_id = ?`;
        await trx.raw(deleteQuery, [taskId]);
        for (const item of list_task) {
          const { task, judul, status, level, tgl_finish } = item;
          const tanggal = tgl_finish;
          await trx.raw(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
        }
      }
      await trx.commit();
      return {
        status: true,
        message: 'Data Berhasil Ditambahkan',
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal menambahkan data: ' + error.message);
    }
  }
}
