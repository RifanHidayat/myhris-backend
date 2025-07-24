import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName } from 'src/common/utils';

interface RequestAttendanceDeleteDto {
  tenant: string;
  emId: string;
  nomor_ajuan: string;
  bulan: string;
  tahun: string;
}

@Injectable()
export class RequestAttendanceDeleteService {
  constructor(private readonly dbService: DbService) {}

  async delete(dto: RequestAttendanceDeleteDto): Promise<any> {
    const { tenant, emId, nomor_ajuan, bulan, tahun } = dto;
    const dbName = formatDbName(`${tahun}-${bulan}`, tenant);
    const knex = this.dbService.getConnection(tenant);
    try {
      const trx = await knex.transaction();
      await trx(`${dbName}.emp_labor`)
        .where({ em_id: emId, nomor_ajuan })
        .update({ status_transaksi: 0 });
      await trx.commit();
      return {
        status: true,
        message: 'Berhasil menghapus data!',
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus data');
    }
  }
}
