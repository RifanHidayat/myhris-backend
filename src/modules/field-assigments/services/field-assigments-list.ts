import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';

@Injectable()
export class FieldAssigmentsListService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Execute period query with UNION logic
   */
  private async executePeriodQuery(
    tenant: string,
    start_periode: string,
    end_periode: string,
    query: string,
    params: any[] = []
  ): Promise<any> {
    const knex = this.dbService.getConnection(tenant);
    let trx;

    try {
      trx = await knex.transaction();
      
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      let results;
      
      if (isDifferent) {
        // Different periods: UNION from both databases
        const startQuery = query.replace('{startDb}', startDb);
        const endQuery = query.replace('{endDb}', endDb);
        
        const unionQuery = `
          ${startQuery}
          UNION ALL
          ${endQuery}
          ORDER BY atten_date DESC, id DESC
        `;
        
        const [unionResults] = await trx.raw(unionQuery, [...params, ...params]);
        results = unionResults;
      } else {
        // Same period: Use only end database
        const singleQuery = query.replace('{endDb}', endDb);
        const [singleResults] = await trx.raw(singleQuery, params);
        results = singleResults;
      }
      
      await trx.commit();
      return results;
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in executePeriodQuery:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }

  /**
   * List field assignments by employee ID with period logic
   * Returns simple data array
   */
  async listByEmployeeId(em_id: string, tenant: string, start_periode: string, end_periode: string): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }

    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      let assignments;
      
      if (isDifferent) {
        // Different periods: UNION from both databases with tgl_ajuan conditions
        const startQuery = `
          SELECT * FROM ${startDb}.emp_labor 
          WHERE em_id = ? 
            AND ajuan = '2' 
            AND tgl_ajuan >= ?
        `;
        
        const endQuery = `
          SELECT * FROM ${endDb}.emp_labor 
          WHERE em_id = ? 
            AND ajuan = '2' 
            AND tgl_ajuan <= ?
        `;
        
        const unionQuery = `
          ${startQuery}
          UNION ALL
          ${endQuery}
          ORDER BY tgl_ajuan DESC, id DESC
        `;
        
        const [results] = await trx.raw(unionQuery, [
          em_id, start_periode,  // For start query
          em_id, end_periode     // For end query
        ]);
        
        assignments = results;
      } else {
        // Same period: Use only end database
        const query = `
          SELECT * FROM ${endDb}.emp_labor 
          WHERE em_id = ? 
            AND ajuan = '2'
          ORDER BY tgl_ajuan DESC, id DESC
        `;
        
        const [results] = await trx.raw(query, [em_id]);
        assignments = results;
      }
      
      await trx.commit();
      
      // Return simple data array
      return assignments;
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in field assignments list by employee service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }

  /**
   * List all field assignments
   */
  async listAll(tenant: string, start_periode: string, end_periode: string): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }

    const query = `
      SELECT * FROM {endDb}.emp_labor 
      WHERE ajuan = '2'
    `;
    
    const results = await this.executePeriodQuery(tenant, start_periode, end_periode, query);
    
    return {
      status: true,
      message: 'Success get all field assignments',
      data: {
        assignments: results,
        total_assignments: results.length
      }
    };
  }

  /**
   * List detail by nomor ajuan
   */
  async listDetailByNomorAjuan(nomor_ajuan: string, tenant: string, start_periode: string, end_periode: string): Promise<any> {
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }

    const query = `
      SELECT * FROM {endDb}.emp_labor 
      WHERE nomor_ajuan = ? AND ajuan = '2'
    `;
    
    const results = await this.executePeriodQuery(tenant, start_periode, end_periode, query, [nomor_ajuan]);
    
    return {
      status: true,
      message: 'Success get field assignment detail',
      data: {
        nomor_ajuan,
        assignment: results.length > 0 ? results[0] : null,
        found: results.length > 0
      }
    };
  }

  /**
   * Generic list method that routes to appropriate specific method
   */
  async list(query: any): Promise<any> {
    const { tenant, em_id, nomor_ajuan, start_periode, end_periode } = query;
    
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    if (nomor_ajuan) {
      return this.listDetailByNomorAjuan(nomor_ajuan, tenant, start_periode, end_periode);
    } else if (em_id) {
      return this.listByEmployeeId(em_id, tenant, start_periode, end_periode);
    } else {
      return this.listAll(tenant, start_periode, end_periode);
    }
  }
}
