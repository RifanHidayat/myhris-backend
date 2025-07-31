import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface DailyTaskDetailDto {
  em_id: string;
  id: string;
  tenant: string;
  start_periode?: string;
  end_periode?: string;
}

interface DailyTask {
  id: number;
  em_id: string;
  tgl_buat: string;
  status_pengajuan: string;
}

interface DailyTaskDetail {
  id: number;
  judul: string;
  rincian: string;
  tgl_finish: string | null;
  status: string;
  level: number;
  daily_task_id: number;
}

@Injectable()
export class DailyTaskDetailService {
  constructor(private readonly dbService: DbService) {}

  async getDailyTaskById(dto: DailyTaskDetailDto): Promise<any> {
    const { em_id, id, tenant, start_periode, end_periode } = dto;
    
    // Validate required parameters
    if (!id || !em_id || !tenant) {
      throw new InternalServerErrorException('id, em_id, dan tenant harus disediakan');
    }
    
    const database = tenant;
    const knex = this.dbService.getConnection(database);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // First, find the correct database by checking available tables
      const [tablesResult] = await trx.raw(`
        SELECT table_schema 
        FROM information_schema.tables 
        WHERE table_schema LIKE '%hrm%' AND table_name = 'daily_task'
        ORDER BY table_schema DESC
      `);
      
      let foundTask: DailyTask | null = null;
      let correctDatabase = '';
      
      // Search for task in each database
      for (const table of tablesResult) {
        const dbName = table.table_schema;
        try {
          const [taskResult] = await trx.raw(
            `SELECT * FROM ${dbName}.daily_task WHERE id = ? AND em_id = ?`,
            [id, em_id]
          );
          
          if (taskResult.length > 0) {
            foundTask = taskResult[0] as DailyTask;
            correctDatabase = dbName;
            break;
          }
        } catch (error) {
          // Continue to next database
          continue;
        }
      }
      
      if (!foundTask) {
        throw new InternalServerErrorException(`Task dengan ID ${id} tidak ditemukan`);
      }
      
      // Get task details from the correct database
      const [taskDetails] = await trx.raw(
        `SELECT * FROM ${correctDatabase}.daily_task_detail WHERE daily_task_id = ? ORDER BY level ASC`,
        [id]
      );
      
      await trx.commit();
      
      // Format response
      const response =   {
        id: foundTask.id,
        em_id: foundTask.em_id,
        tgl_buat: foundTask.tgl_buat,
        status_pengajuan: foundTask.status_pengajuan,
        details: taskDetails.map((detail: any) => ({
          id: detail.id,
          judul: detail.judul,
          rincian: detail.rincian,
          tgl_finish: detail.tgl_finish,
          status: detail.status,
          level: detail.level,
          daily_task_id: detail.daily_task_id
        })) as DailyTaskDetail[]
      };
      
      return {
        status: true,
        message: 'Success get daily task detail',
        data: response
      };
      
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal mendapatkan detail task: ' + error.message);
    }
  }
} 