import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SubmitAttendanceDto } from '../../attendances/dto/submit-attendance.dto';
import { DbService } from '../../../config/database.service';

@Injectable()
export class EmployeeLastAttendanceService {
  constructor(private readonly dbService: DbService) {}

  async viewLastAbsen(dto: SubmitAttendanceDto & { pola?: string | number }): Promise<any> {
    const { database, em_id, tanggal_absen, start_date, end_date, start_time, end_time, pola } = dto;

    // Format nama database dinamis
    const array = tanggal_absen.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = array[1];
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const knex = this.dbService.getConnection(database);

    let trx;
    try {
      trx = await knex.transaction();

      // Query attendance terakhir
      const absensi = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ em_id })
        .orderBy('id', 'desc');

      // Query sysdata
      const sysdata = await trx(`${database}_hrm.sysdata`).where({ kode: '018' });

      let _startDate = start_date;
      let _endDate = end_date;
      let _startTime = start_time;
      let _endTime = end_time;

      if (sysdata.length > 0 && absensi.length > 0) {
        const array1 = sysdata[0].name.split(',');
        if (array1[0].trim() === '00:00' && array1[1].trim() === '00:00') {
          _startTime = absensi[0]['signin_time'];
          _startDate = absensi[0]['atten_date'];
          _endTime = absensi[0]['signin_time'];
          if (_startDate) {
            const date = new Date(_startDate);
            date.setDate(date.getDate() + 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            _endDate = `${year}-${month}-${day}`;
          }
        }
      }

      // Query join dengan places_coordinate
      const absensiNow = await trx
        .select('places_coordinate.trx', `${namaDatabaseDynamic}.attendance.*`)
        .from(`${namaDatabaseDynamic}.attendance`)
        .leftJoin(
          `${database}_hrm.places_coordinate`,
          `${namaDatabaseDynamic}.attendance.place_in`,
          '=',
          'places_coordinate.place'
        )
        .where('em_id', em_id)
        .andWhereRaw(`CONCAT(atten_date, ' ', signin_time) BETWEEN ? AND ?`, [`${_startDate} ${_startTime}`, `${_endDate} ${_endTime}`])
        .andWhere('atttype', 1)
        .orderBy('id', 'desc')
        .limit(1);

      // Query WFH
      let wfhQuery = trx(`${namaDatabaseDynamic}.emp_labor`)
        .select('status', { signing_time: 'dari_jam' }, 'nomor_ajuan')
        .where('em_id', em_id)
        .andWhereRaw(`CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?`, [`${start_date} ${start_time}`, `${start_date} ${start_time}`])
        .andWhereRaw(`CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?`, [`${end_date} ${end_time}`, `${end_date} ${end_time}`])
        .andWhere('status_transaksi', '1');
      if (pola == '2' || pola == 2) {
        wfhQuery = wfhQuery.andWhere(function () {
          this.where('ajuan', '4').orWhere('ajuan', '3');
        }).andWhere(function () {
          this.where('status', 'Pending').orWhere('status', 'Approve');
        });
      } else {
        wfhQuery = wfhQuery.andWhere(function () {
          this.where('ajuan', '4').orWhere('ajuan', '3');
        }).andWhere('status', 'Pending');
      }
      wfhQuery = wfhQuery.orderBy('id', 'desc').limit(1);
      const wfh = await wfhQuery;

      // Query Absen Offline
      let absenOfflineQuery = trx(`${namaDatabaseDynamic}.emp_labor`)
        .select('atten_date', 'status', { signing_time: 'dari_jam' }, { signout_time: 'sampai_jam' }, 'nomor_ajuan')
        .where('em_id', em_id)
        .andWhereRaw(`CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?`, [`${start_date} ${start_time}`, `${start_date} ${start_time}`])
        .andWhereRaw(`CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?`, [`${end_date} ${end_time}`, `${end_date} ${end_time}`])
        .andWhere('ajuan', '5')
        .andWhere('status_transaksi', '1');
      if (pola == '2' || pola == 2) {
        absenOfflineQuery = absenOfflineQuery.andWhere(function () {
          this.where('status', 'Pending').orWhere('status', 'Approve');
        });
      } else {
        absenOfflineQuery = absenOfflineQuery.andWhere('status', 'Pending');
      }
      absenOfflineQuery = absenOfflineQuery.orderBy('id', 'desc').limit(1);
      const absenOffline = await absenOfflineQuery;

      await trx.commit();

      return {
        status: true,
        message: 'Berhasil ambil data!',
        data: absensiNow,
        wfh: wfh,
        offline: absenOffline,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException('Gagal ambil data: ' + error.message);
    }
  }
}
