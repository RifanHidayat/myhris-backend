import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';
import { FieldAssigmentsUpdateDto } from '../dto/field-assigments.dto';

@Injectable()
export class FieldAssigmentsUpdateService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Execute SELECT query with period logic using query builder
   */
  private async executeSelectQuery(
    trx: any,
    tenant: string,
    start_periode: string,
    end_periode: string,
    whereConditions: any = {}
  ): Promise<any> {
    try {
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      if (isDifferent) {
        // Different periods: UNION from both databases
        const startQuery = trx(`${startDb}.emp_labor`)
          .select('*')
          .where(whereConditions)
          .where('atten_date', '>=', start_periode);
          
        const endQuery = trx(`${endDb}.emp_labor`)
          .select('*')
          .where(whereConditions)
          .where('atten_date', '<=', end_periode);
          
        const [startResults] = await startQuery;
        const [endResults] = await endQuery;
        
        return [...startResults, ...endResults];
      } else {
        // Same period: Use only end database
        const results = await trx(`${endDb}.emp_labor`)
          .select('*')
          .where(whereConditions);
        return results;
      }
    } catch (error) {
      console.error('Error in executeSelectQuery:', error);
      throw error;
    }
  }

  /**
   * Execute UPDATE query with period logic using query builder
   */
  private async executeUpdateQuery(
    trx: any,
    tenant: string,
    start_periode: string,
    end_periode: string,
    updateData: any,
    whereConditions: any = {}
  ): Promise<any> {
    try {
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      if (isDifferent) {
        // Different periods: UPDATE both databases
        await trx(`${startDb}.emp_labor`)
          .where(whereConditions)
          .where('atten_date', '>=', start_periode)
          .update(updateData);
          
        await trx(`${endDb}.emp_labor`)
          .where(whereConditions)
          .where('atten_date', '<=', end_periode)
          .update(updateData);
          
        return { affectedRows: 'multiple' };
      } else {
        // Same period: Use only end database
        return await trx(`${endDb}.emp_labor`)
          .where(whereConditions)
          .update(updateData);
      }
    } catch (error) {
      console.error('Error in executeUpdateQuery:', error);
      throw error;
    }
  }

  async updateFieldAssignment(dto: FieldAssigmentsUpdateDto): Promise<any> {
    const { tenant, nomor_ajuan, start_time, end_time, delegation_id, catatan, start_periode, end_periode } = dto;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant is required');
    }
    if (!nomor_ajuan) {
      throw new BadRequestException('Nomor ajuan is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // First, find the assignment to check status
      const whereConditions = {
        nomor_ajuan: nomor_ajuan,
        ajuan: '2'
      };
      
      const assignments = await this.executeSelectQuery(
        trx,
        tenant,
        start_periode,
        end_periode,
        whereConditions
      );
      
      if (assignments.length === 0) {
        throw new BadRequestException('Assignment tidak ditemukan');
      }
      
      // Check if status is still pending
      const assignment = assignments[0];
      if (assignment.status !== 'Pending') {
        throw new BadRequestException('Assignment tidak dapat diupdate karena status bukan Pending');
      }
      
      // Prepare update data
      const updateData: any = {
        modified_on: new Date()
      };
      
      if (start_time) updateData.dari_jam = start_time;
      if (end_time) updateData.sampai_jam = end_time;
      if (delegation_id) updateData.em_delegation = delegation_id;
      if (catatan) updateData.uraian = catatan;
      
      console.log('Update data:', updateData);
      
      // Update the assignment
      await this.executeUpdateQuery(
        trx,
        tenant,
        start_periode,
        end_periode,
        updateData,
        whereConditions
      );
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Data berhasil diupdate',
        data: {
          nomor_ajuan,
          ...updateData
        }
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in field assignments update service:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
