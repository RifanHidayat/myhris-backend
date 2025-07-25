import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { getDateNow } from '../../../common/utils';
import { NotificationService } from '../../../common/notification.service';

interface FieldAssigmentsStoreDto {
  database: string;
  nomor_ajuan: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  tenant?: string;
  emId?: string;
  start_periode?: string;
  end_periode?: string;
  [key: string]: any;
}

@Injectable()
export class FieldAssigmentsStoreService {
  constructor(
    private readonly dbService: DbService,
    private readonly notificationService: NotificationService
  ) {}

  async store(dto: FieldAssigmentsStoreDto): Promise<any> {
    const {
      database,
      nomor_ajuan,
      menu_name,
      activity_name,
      created_by,
      tenant,
      emId,
      start_periode,
      end_periode,
      ...bodyValue
    } = dto;
    const dateNow = getDateNow();
    const array = dateNow.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (array[1].length === 1) {
      convertBulan = parseInt(array[1], 10) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const databaseMaster = `${database}_hrm`;
    const script = `INSERT INTO ${namaDatabaseDynamic}.emp_labor SET ?`;
    const dataInsertLog = {
      menu_name,
      activity_name,
      acttivity_script: script,
      createdUserID: created_by,
    };
    bodyValue.tgl_ajuan = dateNow;
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      const [results] = await trx.raw(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor  WHERE nomor_ajuan='${nomor_ajuan}'`,
      );
      if (results.length > 0) {
        throw new BadRequestException('Nomor ajuan sudah ada');
      }
      await trx.raw(script, [bodyValue]);
      await trx.raw(
        `INSERT INTO ${namaDatabaseDynamic}.logs_actvity SET ?;`,
        [dataInsertLog],
      );
      const [transaksi] = await trx.raw(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan='${nomor_ajuan}'`,
      );
      const [employee] = await trx.raw(
        `SELECT * FROM ${databaseMaster}.employee WHERE em_id='${transaksi[0].em_id}'`,
      );
      const [sysdata] = await trx.raw(
        `SELECT * FROM sysdata WHERE kode='034'`,
      );
      const delegationIds = employee[0].em_report_to
        ? Array.isArray(employee[0].em_report_to)
          ? employee[0].em_report_to
          : [employee[0].em_report_to]
        : [];
      const emIds = employee[0].em_report2_to
        ? Array.isArray(employee[0].em_report2_to)
          ? employee[0].em_report2_to
          : [employee[0].em_report2_to]
        : [];
      const combinedIds = [
        ...new Set([
          ...delegationIds.flatMap((id) =>
            id.split(',').map((i) => i.trim().toUpperCase()),
          ),
          ...emIds.flatMap((id) =>
            id.split(',').map((i) => i.trim().toUpperCase()),
          ),
        ]),
      ];
      // TODO: Implement notification using NotificationService
      // await this.notificationService.insertNotification(
      //   combinedIds.join(','),
      //   'Approval Tugas Luar',
      //   'TugasLuar',
      //   employee[0].em_id,
      //   transaksi[0].id,
      //   transaksi[0].nomor_ajuan,
      //   employee[0].full_name,
      //   namaDatabaseDynamic,
      //   databaseMaster,
      // );
      if (sysdata.length > 0 && sysdata[0].name != null) {
        // TODO: Implement notification using NotificationService
        // await this.notificationService.insertNotification(
        //   sysdata[0].name,
        //   'Pengajuan Tugas Luar',
        //   'TugasLuar',
        //   employee[0].em_id,
        //   null,
        //   transaksi[0].nomor_ajuan,
        //   employee[0].full_name,
        //   namaDatabaseDynamic,
        //   databaseMaster,
        // );
      }
      await trx.commit();
      return {
        status: true,
        message: 'Berhasil tambah data tugas luar',
        data: transaksi,
      };
    } catch (e) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException(e);
    }
  }
}
