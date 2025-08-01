import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, isDifferentPeriod } from '../../../common/utils';
import { OfficialDutiesStoreDto } from '../dto/official-duties-store.dto';

@Injectable()
export class OfficialDutiesStoreService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Generate nomor ajuan for official duties
   */
  private async generateNomorAjuan(trx: any, tenant: string, start_date: string): Promise<string> {
    const array = start_date.split('-');
    const tahun = array[0];
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    
    const namaDatabaseDynamic = `${tenant}_hrm${convertYear}${convertBulan}`;
    
    // Get the last nomor_ajuan
    const [results] = await trx.raw(`SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE ajuan='4' ORDER BY nomor_ajuan DESC LIMIT 1`);
    
    let nomor;
    if (results.length > 0) {
      const text = results[0]['nomor_ajuan'];
      nomor = parseInt(text.substring(8, 13)) + 1;
    } else {
      nomor = 1;
    }
    
    const nomorStr = String(nomor).padStart(4, '0');
    return `DL${convertYear}${convertBulan}${nomorStr}`;
  }

  /**
   * Store official duties with period logic
   */
  async storeOfficialDuties(dto: OfficialDutiesStoreDto): Promise<any> {
    const { tenant, em_id, date_selected, time_plan, time_plan_to, reason, em_delegation_id, leave_files, start_periode, end_periode } = dto;
    
    // Validate required parameters
    if (!tenant) {
      throw new BadRequestException('Tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    if (!date_selected || date_selected.length === 0) {
      throw new BadRequestException('Date selected is required');
    }
    if (!time_plan) {
      throw new BadRequestException('Time plan is required');
    }
    if (!time_plan_to) {
      throw new BadRequestException('Time plan to is required');
    }
    if (!reason) {
      throw new BadRequestException('Reason is required');
    }
    if (!start_periode || !end_periode) {
      throw new BadRequestException('Start period and end period are required');
    }
    
    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      const start_date = date_selected[0];
      const end_date = date_selected[date_selected.length - 1];
      const leave_duration = date_selected.length;
      
      // Generate nomor ajuan
      const nomor_ajuan = await this.generateNomorAjuan(trx, tenant, start_date);
      
      const startDb = formatDbName(start_periode, tenant);
      const endDb = formatDbName(end_periode, tenant);
      
      const isDifferent = isDifferentPeriod(start_periode, end_periode);
      
      // Prepare insert data
      const insertData = {
        em_id,
        typeid: '4', // Official duties type
        nomor_ajuan,
        leave_type: '4',
        start_date,
        end_date,
        leave_duration,
        date_selected: JSON.stringify(date_selected),
        time_plan,
        time_plan_to,
        apply_date: new Date().toISOString().split('T')[0],
        reason,
        leave_status: 'Pending',
        atten_date: start_date,
        em_delegation: em_delegation_id,
        leave_files: leave_files || null,
        ajuan: '4',
        created_on: new Date()
      };
      
      if (isDifferent) {
        // Different periods: Insert into both databases
        await trx(`${startDb}.emp_leave`).insert(insertData);
        await trx(`${endDb}.emp_leave`).insert(insertData);
      } else {
        // Same period: Insert into end database only
        await trx(`${endDb}.emp_leave`).insert(insertData);
      }
      
      // Get the inserted data
      const [transaksi] = await trx.raw(
        `SELECT * FROM ${endDb}.emp_leave WHERE nomor_ajuan = ?`,
        [nomor_ajuan]
      );
      
      // Get employee data for notification
      const databaseMaster = `${tenant}_hrm`;
      const [employee] = await trx.raw(
        `SELECT * FROM ${databaseMaster}.employee WHERE em_id = ?`,
        [em_id]
      );
      
      // Insert notification (if utility function exists)
      if (employee.length > 0) {
        // TODO: Implement notification logic similar to field assignments
        console.log('Notification should be sent to:', employee[0].em_report_to);
      }
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Successfully stored official duties',
        data: transaksi[0]
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in official duties store service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
