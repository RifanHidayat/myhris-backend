import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

import { DailyTasksStoreDto } from '../dto/daily-task-store.dto';

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

/**
 * Generate next nomor ajuan for daily tasks
 * Format: DT202507{no_urut} where no_urut is 4 digits
 * @param trx - Database transaction
 * @param databaseName - Database name
 * @returns string - Next nomor ajuan
 */
async function generateNomorAjuan(trx: any, databaseName: string): Promise<string> {
  try {
    // Get current year and month for the format
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Build query parts
    const selectClause = 'SELECT nomor_ajuan';
    const fromClause = `FROM ${databaseName}.daily_task`;
    const whereClause = `WHERE nomor_ajuan IS NOT NULL AND nomor_ajuan != '' AND nomor_ajuan LIKE 'DT${year}${month}%'`;
    const orderClause = 'ORDER BY nomor_ajuan DESC LIMIT 1';
    
    const lastNomorAjuanQuery = `${selectClause} ${fromClause} ${whereClause} ${orderClause}`;
    
    const [lastNomorResult] = await trx.raw(lastNomorAjuanQuery);
    
    let nextNumber = 1; // Default to 1 if no previous records
    
    if (lastNomorResult.length > 0 && lastNomorResult[0].nomor_ajuan) {
      const lastNomorAjuan = lastNomorResult[0].nomor_ajuan;
      
      // Extract the 4-digit number from the end
      // Format: DT202507{no_urut} -> extract {no_urut}
      const match = lastNomorAjuan.match(/DT\d{6}(\d{4})$/);
      
      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format: DT202507{no_urut} where no_urut is 4 digits
    const nomorAjuan = `DT${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    
    console.log(`Generated nomor ajuan: ${nomorAjuan}`);
    return nomorAjuan;
    
  } catch (error) {
    console.error('Error generating nomor ajuan:', error);
    throw new Error('Failed to generate nomor ajuan');
  }
}

@Injectable()
export class DailyTasksStoreService {
  constructor(private readonly dbService: DbService) {}

  async insertDailyTask(dto: DailyTasksStoreDto): Promise<any> {
    const { date, list_tasks, status, tenant, em_id, start_periode, end_periode } = dto;
    console.log('dto', dto); // Log full dto untuk debugging
    const statusPengajuan = status || 'post'; // Use provided status or default to 'post'
    
    // Use the new database name logic
    const namaDatabaseDynamic = getDatabaseName(tenant, date, start_periode, end_periode);
    console.log('Database name:', namaDatabaseDynamic);
    
    const knex = this.dbService.getConnection(tenant);
    let trx;
    try {
      trx = await knex.transaction();
      
      // Generate nomor ajuan for new tasks
      let nomorAjuan = await generateNomorAjuan(trx, namaDatabaseDynamic);
      
      // Check existing task
      const checkTaskQuery = `SELECT id, nomor_ajuan FROM ${namaDatabaseDynamic}.daily_task WHERE tgl_buat = ? AND em_id = ?`;
      const [cekDaily] = await trx.raw(checkTaskQuery, [date, em_id]);
      
      let taskId;
      
      if (cekDaily.length > 0) {
        // Task already exists, update it
        taskId = cekDaily[0].id;
        nomorAjuan = cekDaily[0].nomor_ajuan;
        
        // Update main task record (keep existing nomor_ajuan)
        const updateTaskQuery = `UPDATE ${namaDatabaseDynamic}.daily_task SET status_pengajuan = ? WHERE id = ?`;
        await trx.raw(updateTaskQuery, [statusPengajuan, taskId]);
        
        // Delete existing details
        const deleteDetailsQuery = `DELETE FROM ${namaDatabaseDynamic}.daily_task_detail WHERE nomor_ajuan = ?`;
        await trx.raw(deleteDetailsQuery, [nomorAjuan]);
        
        console.log(`Updating existing task for date ${date} with ID: ${taskId}`);
      } else {
        // Insert new task record with nomor ajuan
        const insertTaskQuery = `INSERT INTO ${namaDatabaseDynamic}.daily_task (em_id, tgl_buat, status_pengajuan, nomor_ajuan) VALUES (?, ?, ?, ?)`;
        const [task] = await trx.raw(insertTaskQuery, [em_id, date, statusPengajuan, nomorAjuan]);
        taskId = task.insertId || (task[0] && task[0].insertId);
        
        console.log(`Creating new task for date ${date} with ID: ${taskId} and nomor ajuan: ${nomorAjuan}`);
      }
      
      // Prepare bulk insert for task details
      if (list_tasks && list_tasks.length > 0) {
        const detailValues = list_tasks.map(item => {
          const { task, title, status, level, finish_date } = item;
          // Validasi: jika finish_date kosong, undefined, atau null, simpan null
          // Jika tidak, format tanggal
          const tanggal = (finish_date && finish_date.trim() !== '' && finish_date !== null && finish_date !== undefined) 
            ? formatDate(finish_date) 
            : null;
          return [title, task, tanggal, taskId, status.toString(), level, nomorAjuan];
        });
        
        const queryDetail = `INSERT INTO ${namaDatabaseDynamic}.daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level, nomor_ajuan) VALUES ?`;
        await trx.raw(queryDetail, [detailValues]);
      }
      
      await trx.commit();
      return {
        success: true,
        message: cekDaily.length > 0 ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan',
        taskId: taskId,
        nomorAjuan: cekDaily.length > 0 ? null : nomorAjuan, // Only return nomor ajuan for new tasks
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException( error.message);
    }
  }
}
