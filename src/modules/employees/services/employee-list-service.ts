import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { databaseMaster } from '../../../common/utils';

interface EmployeeDetailResult {
  em_id: string;
  dep_id: string;
  tipe_absen: string;
  lama_bekerja: string;
  sisa_kontrak: string;
  em_status: string;
  tanggal_berakhir_kontrak: string;
  [key: string]: any;
}

@Injectable()
export class EmployeeListService {
  constructor(private readonly dbService: DbService) {}

  async index(dto: {
    tenant: string;
    emId: string;
    branchId: string;
  }): Promise<any> {
    console.log('Masuk function employee');
    const database = databaseMaster(dto.tenant);
    const tenant = dto.tenant;
    const branchId = dto.branchId;
    let whereCondition = '';
    if (branchId == '' || branchId == null || branchId == undefined) {
      // TODO: implement function
    } else {
      whereCondition = `AND branch_id='${branchId}'`;
    }
    

    const knex = this.dbService.getConnection(tenant);
    let trx;
    try {
      trx = await knex.transaction();
      
      // Build query using query builder
      let query = trx(`${database}.employee`)
        .select('full_name', 'em_id', 'em_image')
        .where('status', 'ACTIVE');
      
      // Add branch condition if provided
      if (branchId && branchId !== '' && branchId !== null && branchId !== undefined) {
        query = query.where('branch_id', branchId);
      }
      
      const results = await query;
      
      await trx.commit();
      
      return {
        status: true,
        message: 'Success get employee',
        data: results,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in employee list service:', error);
      throw new InternalServerErrorException('Terjadi kesalahan: ' + error.message);
    }
  }
}
