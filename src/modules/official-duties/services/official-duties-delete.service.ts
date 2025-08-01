import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';

@Injectable()
export class OfficialDutiesDeleteService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Execute DELETE query with period logic
   */
  private async executeDeleteQuery(
    trx: any,
    tenant: string,
    start_periode: string,
    end_periode: string,
    whereClause: string = '',
    params: any[] = []
  ): Promise<any> {
    try {
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      if (isDifferent) {
        // Different periods: DELETE from both databases
        const startQuery = `DELETE FROM ${startDb}.emp_leave WHERE ${whereClause} AND atten_date >= ?`;
        const endQuery = `DELETE FROM ${endDb}.emp_leave WHERE ${whereClause} AND atten_date <= ?`;
        
        await trx.raw(startQuery, [...params, start_periode]);
        await trx.raw(endQuery, [...params, end_periode]);
        return { affectedRows: 'multiple' };
      } else {
        // Same period: Use only end database
        const query = `DELETE FROM ${endDb}.emp_leave WHERE ${whereClause}`;
        return await trx.raw(query, params);
      }
    } catch (error) {
      console.error('Error in executeDeleteQuery:', error);
      throw error;
    }
  }

  async deleteOfficialDuties(nomor_ajuan: string, tenant: string, start_periode: string, end_periode: string): Promise<any> {
    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // Delete the official duties using period logic
      const whereClause = 'nomor_ajuan = ? AND ajuan = ?';
      const params = [nomor_ajuan, '4'];
      
      await this.executeDeleteQuery(
        trx,
        tenant,
        start_periode,
        end_periode,
        whereClause,
        params
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
