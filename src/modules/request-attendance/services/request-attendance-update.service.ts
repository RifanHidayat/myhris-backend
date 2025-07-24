import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName } from 'src/common/utils';

interface RequestAttendanceUpdateDto {
  tenant: string;
  emId: string;
  nomor_ajuan: string;
  status?: string;
}

@Injectable()
export class RequestAttendanceUpdateService {
  constructor(private readonly dbService: DbService) {}

  async update(dto: RequestAttendanceUpdateDto): Promise<any> {
    const { tenant, emId, nomor_ajuan, status } = dto;
    const date = new Date();
    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const dbName = formatDbName(`${tahun}-${bulan}`, tenant);
    const knex = this.dbService.getConnection(tenant);
    try {
      const trx = await knex.transaction();
      await trx(`${dbName}.emp_labor`).where({ em_id: emId, nomor_ajuan }).update({ status: status || 'CANCELLED' });
      await trx.commit();
      return {
        status: true,
        message: 'Berhasil update data!',
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal update data');
    }
  }
} 