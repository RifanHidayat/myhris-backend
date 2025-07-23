import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName, getDateNow } from 'src/common/utils';
import * as Client from 'ssh2-sftp-client';

interface SysData {
  name: string;
}

interface Employee {
  places: string;
  dep_id: string;
}

interface PlaceCoordinate {
  // sesuaikan properti sesuai tabel places_coordinate
  ID: number;
  trx: string;
  // tambahkan properti lainnya kalau perlu
}

@Injectable()
export class PlaceCoordinateService {
  constructor(private readonly dbService: DbService) {}

  async index(dto: {
    tenant: string;
    emId: string;
    branchId: string;
  }): Promise<any> {
    console.log('Masuk function employee/detail');
    const date = getDateNow();
    const tenant = dto.tenant;
    const emId = dto.emId;
    const databasePerode = formatDbName(date, tenant);

    const knex = this.dbService.getConnection(tenant);
    try {
      //employee
      const trx = await knex.transaction();
      // place coordinate
      const sysDataRow = await trx<SysData>('sysdata')
        .select('name')
        .where('kode', '013')
        .first();

      const statusApprove =
        String(sysDataRow?.name) === '1' ? 'Approve' : 'Approve2';

      // ambil tugas luar dari emp_labor dan emp_leave
      const tugasLuarQuery = `
   SELECT nomor_ajuan FROM ${databasePerode}.emp_labor 
   WHERE atten_date = ? AND em_id = ? AND SUBSTRING(nomor_ajuan, 1, 2) = 'TL' AND status = ?
   UNION ALL
   SELECT nomor_ajuan FROM ${databasePerode}.emp_leave 
   WHERE date_selected LIKE ? AND em_id = ? AND SUBSTRING(nomor_ajuan, 1, 2) = 'DL' AND leave_status = ?
 `;

      const rawResult = (await trx.raw(tugasLuarQuery, [
        date,
        emId,
        statusApprove,
        `%${date}%`,
        emId,
        statusApprove,
      ])) as { rows?: { nomor_ajuan: string }[] } | { nomor_ajuan: string }[][];

      // Ambil rows-nya tergantung database client
      const tugasLuarRows: { nomor_ajuan: string }[] = Array.isArray(rawResult)
        ? rawResult[0]
        : (rawResult.rows ?? []);
      const employee = await trx<Employee>('employee')
        .select('places', 'dep_id')
        .where('em_id', dto.emId)
        .first();

      if (!employee) {
        throw new InternalServerErrorException('Employee tidak ditemukan');
      }

      const placesArray = employee.places.split(',');

      let coordinates: PlaceCoordinate[] = [];

      if (tugasLuarRows.length > 0) {
        const nomorAjuan = tugasLuarRows[0].nomor_ajuan;
        const kodeTrx = nomorAjuan.substring(0, 2);

        coordinates = await trx<PlaceCoordinate>('places_coordinate')
          .where('trx', kodeTrx)
          .orWhereIn('ID', placesArray);
      } else {
        coordinates = await trx<PlaceCoordinate>('places_coordinate').whereIn(
          'ID',
          placesArray,
        );
      }
      // ----------------------------------------------------------------------------------
      await trx.commit();
      return {
        status: true,
        message: 'Success get employee detail',
        places: coordinates,
      };
    } catch {
      // trx bisa undefined jika error sebelum assignment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (typeof trx !== 'undefined') await trx.rollback();
      throw new InternalServerErrorException('Terjadi kesalahan: ');
    }
  }
}
