import { Injectable, Inject } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

@Injectable()
export class EmployeeDivisionService {
  constructor(private readonly dbService: DbService) {}

  async employeeDivisi(database: string, em_id: string): Promise<{status: boolean, message: string, data: any[]}> {
    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      const sysdata = await trx('sysdata').where('kode', '003');
      let table = sysdata[0].name === 'DIV' ? 'dep_id' : 'dep_group_id';
      const employee = await trx('employee').where('em_id', em_id);
      let ids: string[] = [];
      let query;
      if (employee[0].em_hak_akses === '' || employee[0].em_hak_akses === '0') {
        // This query is not fully translatable to knex due to the join and WHERE branch.name (incomplete in original)
        // You may need to adjust this logic as needed
        query = trx('employee')
          .join('branch', 'employee.branch_id', 'branch.id')
          .orderBy('full_name', 'asc')
          .select('employee.*', 'branch.*');
      } else {
        ids = employee[0].em_hak_akses.split(',');
        query = trx('employee')
        .select('em_id', 'full_name', 'branch_id', 'em_hak_akses')
          .whereIn(table, ids)
          .andWhere('branch_id', employee[0].branch_id);
      }
      const results = await query;
      await trx.commit();
      return {
        status: true,
        message: 'Successfully get data',
        data: results,
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