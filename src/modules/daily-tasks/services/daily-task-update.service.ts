import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface DailyTasksUpdateDto {
  em_id: string;
  date: string;
  list_tasks: Array<{
    task: string;
    title: string;
    status: string;
    level: number;
    finish_date: string;
  }>;
  status: string;
  id?: string;
  tenant: string;
  start_periode?: string;
  end_periode?: string;
}

function formatDate(date: string): string | null {
  if (!date || date === null || date === undefined || date === '') return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null; // Invalid date
  return d.toISOString().split('T')[0];
}

function getDatabaseName(tenant: string, date: string, start_periode?: string, end_periode?: string): string {
  const currentDate = new Date(date);
  
  // If start_periode or end_periode are not provided, use current date logic
  if (!start_periode || !end_periode) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const shortYear = currentYear.toString().slice(-2);
    const formattedMonth = currentMonth.toString().padStart(2, '0');
    return `${tenant}_hrm${shortYear}${formattedMonth}`;
  }
  
  const startDate = new Date(start_periode);
  const endDate = new Date(end_periode);
  
  // Extract year and month from dates
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  
  // Condition 1: If current date is greater than start_periode and in the same month
  if (currentDate > startDate && currentYear === startYear && currentMonth === startMonth) {
    // Use start_periode database
    const shortYear = startYear.toString().slice(-2);
    const formattedMonth = startMonth.toString().padStart(2, '0');
    return `${tenant}_hrm${shortYear}${formattedMonth}`;
  }
  
  // Condition 2: If current date is greater than start_periode and month is greater
  if (currentDate > startDate && (currentYear > startYear || (currentYear === startYear && currentMonth > startMonth))) {
    // Use end_periode database
    const shortYear = endYear.toString().slice(-2);
    const formattedMonth = endMonth.toString().padStart(2, '0');
    return `${tenant}_hrm${shortYear}${formattedMonth}`;
  }
  
  // Default: Use end_periode database
  const shortYear = endYear.toString().slice(-2);
  const formattedMonth = endMonth.toString().padStart(2, '0');
  return `${tenant}_hrm${shortYear}${formattedMonth}`;
}

@Injectable()
export class DailyTasksUpdateService {
  constructor(private readonly dbService: DbService) {}

  async updateDailyTask(dto: DailyTasksUpdateDto): Promise<any> {
    const { em_id, date, list_tasks, id, status, tenant, start_periode, end_periode } = dto;
    
    // Validate required parameters
    if (!id) {
      throw new InternalServerErrorException('ID harus disediakan untuk update');
    }
    
    const statusPengajuan = status || "post"; // Use provided status or default to 'post'
    
    // Use the same database name logic as store service
    const namaDatabaseDynamic = getDatabaseName(tenant, date, start_periode, end_periode);
    console.log('Database name:', namaDatabaseDynamic);
    
    const knex = this.dbService.getConnection(tenant);
    let trx;
    try {
      trx = await knex.transaction();
      
      // Check if task exists
      const selectClause = 'SELECT *';
      const fromClause = `FROM ${namaDatabaseDynamic}.daily_task`;
      const whereClause = 'WHERE em_id = ? AND id = ?';
      const checkTaskQuery = `${selectClause} ${fromClause} ${whereClause}`;
      
      const [cekDaily] = await trx.raw(checkTaskQuery, [em_id, id]);
      
      if (cekDaily.length === 0) {
        throw new InternalServerErrorException(`Task dengan ID ${id} tidak ditemukan`);
      }
      
      const taskId = cekDaily[0].id;
      
      // Update main task record
      const updateClause = 'UPDATE';
      const updateTableClause = `${namaDatabaseDynamic}.daily_task`;
      const updateSetClause = 'SET em_id = ?, tgl_buat = ?, status_pengajuan = ?';
      const updateWhereClause = 'WHERE id = ?';
      const updateTaskQuery = `${updateClause} ${updateTableClause} ${updateSetClause} ${updateWhereClause}`;
      
      await trx.raw(updateTaskQuery, [em_id, date, statusPengajuan, taskId]);
      
      // Delete existing details
      const deleteClause = 'DELETE';
      const deleteFromClause = `FROM ${namaDatabaseDynamic}.daily_task_detail`;
      const deleteWhereClause = 'WHERE daily_task_id = ?';
      const deleteQuery = `${deleteClause} ${deleteFromClause} ${deleteWhereClause}`;
      
      await trx.raw(deleteQuery, [taskId]);
      
      // Bulk insert new details
      if (list_tasks && list_tasks.length > 0) {
        const detailValues = list_tasks.map(item => {
          const { task, title, status, level, finish_date } = item;
          // Validasi: jika finish_date kosong, undefined, atau null, simpan null
          // Jika tidak, format tanggal
          const tanggal = (finish_date && finish_date.trim() !== '' && finish_date !== null && finish_date !== undefined) 
            ? formatDate(finish_date) 
            : null;
          return [title, task, tanggal, taskId, status.toString(), level];
        });
        
        const insertClause = 'INSERT INTO';
        const insertTableClause = `${namaDatabaseDynamic}.daily_task_detail`;
        const insertColumnsClause = '(judul, rincian, tgl_finish, daily_task_id, status, level)';
        const insertValuesClause = 'VALUES ?';
        const queryDetail = `${insertClause} ${insertTableClause} ${insertColumnsClause} ${insertValuesClause}`;
        
        await trx.raw(queryDetail, [detailValues]);
      }
      
      await trx.commit();
      return {
        status: true,
        message: 'Data berhasil diupdate',
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal mengupdate data: ' + error.message);
    }
  }
}
