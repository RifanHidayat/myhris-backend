import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';

@Injectable()
export class DailyTasksDeleteService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Utility function to handle database operations with period logic
   * If different periods: UNION from start_db (>= start_periode) and end_db (<= end_periode)
   * If same period: Use only end_db
   */
  private async executePeriodQuery(
    trx: any,
    tenant: string,
    table: string,
    start_periode: string,
    end_periode: string,
    whereClause: string = '',
    params: any[] = [],
    operation: 'SELECT' | 'DELETE' | 'UPDATE' = 'SELECT'
  ): Promise<any> {
    try {
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      if (isDifferent) {
        // Different periods: UNION from both databases with date conditions
        if (operation === 'SELECT') {
          const selectClause = 'SELECT *';
          const startFromClause = `FROM ${startDb}.${table}`;
          const endFromClause = `FROM ${endDb}.${table}`;
          const startWhereClause = `WHERE ${whereClause} AND tgl_buat >= ?`;
          const endWhereClause = `WHERE ${whereClause} AND tgl_buat <= ?`;
          
          const query = `
            ${selectClause} ${startFromClause} ${startWhereClause}
            UNION ALL
            ${selectClause} ${endFromClause} ${endWhereClause}
          `;
          return await trx.raw(query, [...params, start_periode, ...params, end_periode]);
        } else if (operation === 'DELETE') {
          // For DELETE, execute on both databases
          const startQuery = `DELETE FROM ${startDb}.${table} WHERE ${whereClause} AND tgl_buat >= ?`;
          const endQuery = `DELETE FROM ${endDb}.${table} WHERE ${whereClause} AND tgl_buat <= ?`;
          
          await trx.raw(startQuery, [...params, start_periode]);
          await trx.raw(endQuery, [...params, end_periode]);
          return { affectedRows: 'multiple' };
        }
      } else {
        // Same period: Use only end database
        if (operation === 'SELECT') {
          const selectClause = 'SELECT *';
          const fromClause = `FROM ${endDb}.${table}`;
          const whereCondition = `WHERE ${whereClause}`;
          const query = `${selectClause} ${fromClause} ${whereCondition}`;
          return await trx.raw(query, params);
        } else if (operation === 'DELETE') {
          const deleteClause = 'DELETE';
          const fromClause = `FROM ${endDb}.${table}`;
          const whereCondition = `WHERE ${whereClause}`;
          const query = `${deleteClause} ${fromClause} ${whereCondition}`;
          return await trx.raw(query, params);
        }
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    } catch (error) {
      console.error('Error in executePeriodQuery:', error);
      throw error;
    }
  }

  /**
   * Simplified function for DELETE operations with period logic
   */
  private async deleteWithPeriodLogic(
    trx: any,
    tenant: string,
    table: string,
    start_periode: string,
    end_periode: string,
    whereClause: string = '',
    params: any[] = []
  ): Promise<any> {
    return this.executePeriodQuery(trx, tenant, table, start_periode, end_periode, whereClause, params, 'DELETE');
  }

  async deleteDailyTask(em_id: string, nomor_ajuan: string, tenant: string, start_periode: string, end_periode: string): Promise<any> {
    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // Delete task details first using period logic
      const detailWhereClause = 'daily_task_id IN (SELECT id FROM daily_task WHERE nomor_ajuan = ? AND em_id = ?)';
      const detailParams = [nomor_ajuan, em_id];
      
      await this.deleteWithPeriodLogic(
        trx,
        tenant,
        'daily_task_detail',
        start_periode,
        end_periode,
        detailWhereClause,
        detailParams
      );
      
      // Then delete the main task using period logic
      const taskWhereClause = 'nomor_ajuan = ? AND em_id = ?';
      const taskParams = [nomor_ajuan, em_id];
      
      await this.deleteWithPeriodLogic(
        trx,
        tenant,
        'daily_task',
        start_periode,
        end_periode,
        taskWhereClause,
        taskParams
      );
      
      await trx.commit();
      return { 
        status: true, 
        message: 'Data berhasil dihapus' 
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal menghapus data: ' + error.message);
    }
  }
}


