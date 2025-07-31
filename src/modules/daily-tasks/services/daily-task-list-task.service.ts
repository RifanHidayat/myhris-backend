import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface DailyTaskListTaskDto {
  database: string;
  em_id: string;
  tahun: string;
  bulan: string;
  id?: string;
  start_periode?: string;
  end_periode?: string;
  tenant?: string;
  emId?: string;
}

@Injectable()
export class DailyTaskListTaskService {
  constructor(private readonly dbService: DbService) {}

  async getDailyTask(dto: DailyTaskListTaskDto): Promise<any> {
    const { database, em_id, tahun, bulan, id, start_periode, end_periode, tenant, emId } = dto;
    
    // Validate required parameters
    if (!id || !database) {
      throw new InternalServerErrorException('id dan database harus disediakan');
    }
    
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const knex = this.dbService.getConnection(database);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // First, check if the task exists
      const taskQuery = `SELECT * FROM ${namaDatabaseDynamic}.daily_task WHERE id = ?`;
      const [taskResult] = await trx.raw(taskQuery, [id]);
      
      if (taskResult.length === 0) {
        await trx.commit();
        return {
          success: false,
          message: 'Task tidak ditemukan',
          data: null,
        };
      }
      
      // Get task details
      const detailsQuery = `SELECT * FROM ${namaDatabaseDynamic}.daily_task_detail WHERE daily_task_id = ? ORDER BY level ASC`;
      const [detailsResult] = await trx.raw(detailsQuery, [id]);
      
      await trx.commit();
      
      // Format the response
      const taskData = {
        id: taskResult[0].id,
        em_id: taskResult[0].em_id,
        tgl_buat: taskResult[0].tgl_buat,
        status_pengajuan: taskResult[0].status_pengajuan,
        details: detailsResult.map(detail => ({
          id: detail.id,
          judul: detail.judul,
          rincian: detail.rincian,
          tgl_finish: detail.tgl_finish,
          status: detail.status,
          level: detail.level
        }))
      };
      
      return {
        success: true,
        message: 'Successfully get data',
        data: taskData,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException(
        'Gagal mendapatkan data task: ' + error.message,
      );
    }
  }
}


