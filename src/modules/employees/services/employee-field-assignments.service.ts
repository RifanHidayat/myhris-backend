import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';

interface FieldAssignmentsByEmployeeDto {
  tenant: string;
  em_id: string;
  start_periode: string;
  end_periode: string;
}

@Injectable()
export class EmployeeFieldAssignmentsService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Get field assignments by employee with period logic
   * If different periods: UNION from start_db (>= start_periode) and end_db (<= end_periode)
   * If same period: Use only end_db
   */
  async getFieldAssignmentsByEmployee(dto: FieldAssignmentsByEmployeeDto): Promise<any> {
    const { tenant, em_id, start_periode, end_periode } = dto;
    
    // Validate required parameters
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
        // Different periods: UNION from both databases with date conditions
        const selectClause = 'SELECT *';
        const startFromClause = `FROM ${startDb}.emp_labor`;
        const endFromClause = `FROM ${endDb}.emp_labor`;
        const startWhereClause = `WHERE em_id = ? AND ajuan = ? AND atten_date >= ?`;
        const endWhereClause = `WHERE em_id = ? AND ajuan = ? AND atten_date <= ?`;
        
        const query = `
          ${selectClause} ${startFromClause} ${startWhereClause}
          UNION ALL
          ${selectClause} ${endFromClause} ${endWhereClause}
          ORDER BY atten_date DESC, id DESC
        `;
        
        const [results] = await trx.raw(query, [
          em_id, '2', start_periode,
          em_id, '2', end_periode
        ]);
        
        assignments = results;
      } else {
        // Same period: Use only end database
        const selectClause = 'SELECT *';
        const fromClause = `FROM ${endDb}.emp_labor`;
        const whereCondition = `WHERE em_id = ? AND ajuan = ?`;
        const orderClause = 'ORDER BY atten_date DESC, id DESC';
        const query = `${selectClause} ${fromClause} ${whereCondition} ${orderClause}`;
        
        const [results] = await trx.raw(query, [em_id, '2']);
        assignments = results;
      }
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Success get field assignments by employee',
        data: assignments
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in employee field assignments service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }

  /**
   * Get field assignments by employee with additional filters
   */
  async getFieldAssignmentsByEmployeeWithFilters(dto: FieldAssignmentsByEmployeeDto & {
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const { tenant, em_id, start_periode, end_periode, status, date_from, date_to } = dto;
    
    // Validate required parameters
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
        // Different periods: UNION from both databases with date conditions
        const selectClause = 'SELECT *';
        const startFromClause = `FROM ${startDb}.emp_labor`;
        const endFromClause = `FROM ${endDb}.emp_labor`;
        
        // Build WHERE clauses with optional filters
        let startWhereClause = `WHERE em_id = ? AND ajuan = ? AND atten_date >= ?`;
        let endWhereClause = `WHERE em_id = ? AND ajuan = ? AND atten_date <= ?`;
        let startParams = [em_id, '2', start_periode];
        let endParams = [em_id, '2', end_periode];
        
        if (status) {
          startWhereClause += ` AND status = ?`;
          endWhereClause += ` AND status = ?`;
          startParams.push(status);
          endParams.push(status);
        }
        
        if (date_from) {
          startWhereClause += ` AND atten_date >= ?`;
          endWhereClause += ` AND atten_date >= ?`;
          startParams.push(date_from);
          endParams.push(date_from);
        }
        
        if (date_to) {
          startWhereClause += ` AND atten_date <= ?`;
          endWhereClause += ` AND atten_date <= ?`;
          startParams.push(date_to);
          endParams.push(date_to);
        }
        
        const query = `
          ${selectClause} ${startFromClause} ${startWhereClause}
          UNION ALL
          ${selectClause} ${endFromClause} ${endWhereClause}
          ORDER BY atten_date DESC, id DESC
        `;
        
        const [results] = await trx.raw(query, [...startParams, ...endParams]);
        assignments = results;
      } else {
        // Same period: Use only end database
        const selectClause = 'SELECT *';
        const fromClause = `FROM ${endDb}.emp_labor`;
        let whereCondition = `WHERE em_id = ? AND ajuan = ?`;
        let params = [em_id, '2'];
        
        if (status) {
          whereCondition += ` AND status = ?`;
          params.push(status);
        }
        
        if (date_from) {
          whereCondition += ` AND atten_date >= ?`;
          params.push(date_from);
        }
        
        if (date_to) {
          whereCondition += ` AND atten_date <= ?`;
          params.push(date_to);
        }
        
        const orderClause = 'ORDER BY atten_date DESC, id DESC';
        const query = `${selectClause} ${fromClause} ${whereCondition} ${orderClause}`;
        
        const [results] = await trx.raw(query, params);
        assignments = results;
      }
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Success get field assignments by employee with filters',
        data: assignments
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in employee field assignments with filters service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
} 