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
    console.log('Masuk function employee/detail');
    const database = databaseMaster(dto.tenant);
    const tenant = dto.tenant;
    const branchId = dto.branchId;
    let whereCondition = '';
    if (branchId == '' || branchId == null || branchId == undefined) {
      // TODO: implement function
    } else {
      whereCondition = `AND branch_id='${branchId}'`;
    }

    const query = `
      SELECT full_name,em_id,em_image FROM ${database}.employee WHERE status='ACTIVE' ${whereCondition}'
    `;

    const knex = this.dbService.getConnection(tenant);
    try {
      const trx = await knex.transaction();
      const rawResults = (await trx.raw(query)) as
        | { rows?: EmployeeDetailResult[] }
        | EmployeeDetailResult[][];
      const results: EmployeeDetailResult[] = Array.isArray(rawResults)
        ? rawResults[0]
        : (rawResults.rows ?? []);
      return {
        status: true,
        message: 'Success get employee',
        data: results,
      };
    } catch {
      // trx bisa undefined jika error sebelum assignment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (typeof trx !== 'undefined') await trx.rollback();
      throw new InternalServerErrorException('Terjadi kesalahan: ');
    }
  }
}
