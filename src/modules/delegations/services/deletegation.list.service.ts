import { Injectable } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

@Injectable()
export class DelegationListService {
  constructor(private readonly dbService: DbService) {}

  async employeeDelegasi(database: string, em_id: string): Promise<{status: boolean, message: string, data: any[]}> {
    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      const result = await trx('employee')
        .select('em_report_to', 'em_report2_to')
        .where('em_id', em_id);
      const data1 = result[0]['em_report_to'].split(',');
      const data2 = result[0]['em_report2_to'].split(',');
      const finalData = data1.concat(data2);
      const employee = await trx('employee')
        .whereIn('em_id', finalData)
        .orderBy('full_name', 'asc');
      await trx.commit();
      return {
        status: true,
        message: 'Successfully get delegasi',
        data: employee,
      };
    } catch (e) {
      await trx.rollback();
      return {
        status: false,
        message: 'Gagal ambil data',
        data: [],
      };
    }
  }
}