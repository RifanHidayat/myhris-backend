import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { getDateNow, formatDbName, isDifferentPeriod, formatDbNameNow } from '../../../common/utils';
import { FieldAssigmentsStoreDto } from '../dto/field-assigments.dto';

/**
 * Generate next nomor ajuan for field assignments
 * Format: TL202507{no_urut} where no_urut is 4 digits
 */
async function generateNomorAjuan(trx: any, databaseName: string): Promise<string> {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const selectClause = 'SELECT nomor_ajuan';
    const fromClause = `FROM ${databaseName}.emp_labor`;
    const whereClause = `WHERE nomor_ajuan IS NOT NULL AND nomor_ajuan != '' AND nomor_ajuan LIKE 'TL${year}${month}%'`;
    const orderClause = 'ORDER BY nomor_ajuan DESC LIMIT 1';
    
    const lastNomorAjuanQuery = `${selectClause} ${fromClause} ${whereClause} ${orderClause}`;
    
    const [lastNomorResult] = await trx.raw(lastNomorAjuanQuery);
    
    let nextNumber = 1;
    
    if (lastNomorResult.length > 0 && lastNomorResult[0].nomor_ajuan) {
      const lastNomorAjuan = lastNomorResult[0].nomor_ajuan;
      const match = lastNomorAjuan.match(/TL\d{6}(\d{4})$/);
      
      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }
    
    const nomorAjuan = `TL${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    console.log(`Generated nomor ajuan: ${nomorAjuan}`);
    return nomorAjuan;
    
  } catch (error) {
    console.error('Error generating nomor ajuan:', error);
    throw new Error('Failed to generate nomor ajuan');
  }
}



@Injectable()
export class FieldAssigmentsStoreService {
  constructor(private readonly dbService: DbService) {}

  async store(dto: FieldAssigmentsStoreDto): Promise<any> {
    const { tenant, em_id, date, start_time, end_time, delegation_id, catatan, created_by, start_periode, end_periode } = dto;
    
    const namaDatabaseDynamic = formatDbNameNow(tenant);
    console.log('Database name:', namaDatabaseDynamic);
    
    const knex = this.dbService.getConnection(tenant);
    let trx;
    
    try {
      trx = await knex.transaction();
      
      // Check if there's already a field assignment for this employee on the same date
      const checkTimeRangeQuery = `
        SELECT id, nomor_ajuan, atten_date, dari_jam, sampai_jam 
        FROM ${namaDatabaseDynamic}.emp_labor 
        WHERE em_id = ? 
          AND ajuan = '2' 
          AND atten_date = ?
      `;
      
      const checkParams = [
        em_id, 
        date
      ];
      console.log('Check query:', checkTimeRangeQuery);
      console.log('Check params:', checkParams);
      const [existingAssignments] = await trx.raw(checkTimeRangeQuery, checkParams);
      
      // Check for time overlap in JavaScript
      const hasTimeOverlap = existingAssignments.some(assignment => {
        const existingStart = assignment.dari_jam;
        const existingEnd = assignment.sampai_jam;
        
        // Check if new time range overlaps with existing
        return (
          (start_time <= existingEnd && end_time >= existingStart) ||
          (existingStart <= end_time && existingEnd >= start_time)
        );
      });
      
      if (hasTimeOverlap) {
        await trx.rollback();
        throw new BadRequestException('Tugas luar sudah di input untuk waktu tersebut');
      }
      
      // Generate nomor ajuan
      const nomorAjuan = await generateNomorAjuan(trx, namaDatabaseDynamic);
      
      // Insert new assignment
      const insertQuery = `INSERT INTO ${namaDatabaseDynamic}.emp_labor 
        (em_id, atten_date, dari_jam, sampai_jam, em_delegation, uraian, nomor_ajuan, ajuan, status, dari_tgl, sampai_tgl, created_on) 
        VALUES (?, ?, ?, ?, ?, ?, ?, '2', 'Pending', ?, ?, NOW())`;
       
      const insertParams = [em_id, date, start_time, end_time, delegation_id, catatan, nomorAjuan, date, date];
      console.log('Insert query:', insertQuery);
      console.log('Insert params:', insertParams);
      const [result] = await trx.raw(insertQuery, insertParams);
      const assignmentId = result.insertId || (result[0] && result[0].insertId);
      
      console.log(`Creating new assignment for date ${date} with ID: ${assignmentId} and nomor ajuan: ${nomorAjuan}`);
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Data berhasil ditambahkan',
        data: {
          id: assignmentId,
          nomor_ajuan: nomorAjuan,
          em_id,
          atten_date: date,
          dari_jam: start_time,
          sampai_jam: end_time,
          em_delegation: delegation_id,
          uraian: catatan,
          status: 'Pending',
          dari_tanggal: date,
          sampai_tanggal: date
        }
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in field assignments store service:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
