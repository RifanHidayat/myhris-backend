import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

@Injectable()
export class DailyTasksDeleteService {
  constructor(private readonly dbService: DbService) {}

  async deleteDailyTask(
    database: string,
    em_id: string,
    id: string | number,
    tenant?: string,
    emId?: string,
    start_periode?: string,
    end_periode?: string
  ): Promise<any> {
    const array = (typeof id === 'string' ? id : id.toString()).split('-');
    const tahun = array[0];
    const convertYear = tahun.substring(2, 4);
    const convertBulan = array[1]?.padStart(2, '0') || '01';
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      await trx.raw(`DELETE FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_id = ?`, [id]);
      await trx.raw(`DELETE FROM ${namaDatabaseDynamic}.daily_task WHERE id = ? AND em_id = ?`, [id, em_id]);
      await trx.commit();
      return { success: true, message: 'Data berhasil dihapus' };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal menghapus data: ' + error.message);
    }
  }
}
