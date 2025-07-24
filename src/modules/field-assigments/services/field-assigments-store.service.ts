import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

interface FieldAssigmentsStoreDto {
  database: string;
  nomor_ajuan: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  [key: string]: any;
}

const model = require('../../../common/model');
const utility = require('../../../common/utility');

@Injectable()
export class FieldAssigmentsStoreService {
  async store(dto: FieldAssigmentsStoreDto): Promise<any> {
    const {
      database,
      nomor_ajuan,
      menu_name,
      activity_name,
      created_by,
      ...bodyValue
    } = dto;
    const dateNow = utility.dateNow4();
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
    let conn;
    try {
      const connection = await model.createConnection1(databaseMaster);
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [results] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor  WHERE nomor_ajuan='${nomor_ajuan}'`,
      );
      if (results.length > 0) {
        throw new BadRequestException('Nomor ajuan sudah ada');
      }
      await conn.query(script, [bodyValue]);
      await conn.query(
        `INSERT INTO ${namaDatabaseDynamic}.logs_actvity SET ?;`,
        [dataInsertLog],
      );
      const [transaksi] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan='${nomor_ajuan}'`,
      );
      const [employee] = await conn.query(
        `SELECT * FROM ${databaseMaster}.employee WHERE em_id='${transaksi[0].em_id}'`,
      );
      const [sysdata] = await conn.query(
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
      utility.insertNotifikasi(
        combinedIds,
        'Approval Tugas Luar',
        'TugasLuar',
        employee[0].em_id,
        transaksi[0].id,
        transaksi[0].nomor_ajuan,
        employee[0].full_name,
        namaDatabaseDynamic,
        databaseMaster,
      );
      if (sysdata.length > 0 && sysdata[0].name != null) {
        utility.insertNotifikasi(
          sysdata[0].name,
          'Pengajuan Tugas Luar',
          'TugasLuar',
          employee[0].em_id,
          null,
          transaksi[0].nomor_ajuan,
          employee[0].full_name,
          namaDatabaseDynamic,
          databaseMaster,
        );
      }
      await conn.commit();
      return {
        status: true,
        message: 'Berhasil tambah data tugas luar',
        data: transaksi,
      };
    } catch (e) {
      if (conn) await conn.rollback();
      throw new InternalServerErrorException(e);
    } finally {
      if (conn) await conn.release();
    }
  }
}
