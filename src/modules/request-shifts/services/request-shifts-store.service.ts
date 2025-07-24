import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';

interface RequestShiftsStoreDto {
  database: string;
  tgl_ajuan: string;
  work_id_old?: string | number;
  work_id_new?: string | number;
  em_id: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

@Injectable()
export class RequestShiftsStoreService {
  async store(dto: RequestShiftsStoreDto): Promise<any> {
    const { database, tgl_ajuan, work_id_old, work_id_new, em_id, ...bodyValue } = dto;
    const array = tgl_ajuan.split('-');
    bodyValue.work_id_old = work_id_old === '' ? 0 : work_id_old;
    bodyValue.work_id_new = work_id_new === '' ? 0 : work_id_new;
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan: string;
    if (array[1].length === 1) {
      convertBulan = parseInt(array[1], 10) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    let conn;
    try {
      conn = await (await model.createConnection1(`${database}_hrm`)).getConnection();
      await conn.beginTransaction();
      const query = `INSERT INTO ${namaDatabaseDynamic}.emp_labor SET ?`;
      let nomorLb = `SF20${convertYear}${convertBulan}`;
      const [cekNoAjuan] = await conn.query(
        `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan LIKE '%SF%' ORDER BY id DESC LIMIT 1`
      );
      if (cekNoAjuan.length > 0) {
        const text = cekNoAjuan[0]["nomor_ajuan"];
        const nomor = parseInt(text.substring(8, 13)) + 1;
        const nomorStr = String(nomor).padStart(4, "0");
        nomorLb = nomorLb + nomorStr;
      } else {
        const nomor = 1;
        const nomorStr = String(nomor).padStart(4, "0");
        nomorLb = nomorLb + nomorStr;
      }
      bodyValue.nomor_ajuan = nomorLb;
      const [records] = await conn.query(query, [bodyValue]);
      const [user] = await conn.query(
        `SELECT * FROM employee where em_id = '${bodyValue.em_id}'`
      );
      const [transaksi] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE id = '${records.insertId}'`
      );
      const delegationIds = user[0].em_report_to
        ? Array.isArray(user[0].em_report_to)
          ? user[0].em_report_to
          : [user[0].em_report_to]
        : [];
      const emIds = user[0].em_report2_to
        ? Array.isArray(user[0].em_report2_to)
          ? user[0].em_report2_to
          : [user[0].em_report2_to]
        : [];
      const combinedIds = [
        ...new Set([
          ...delegationIds.flatMap((id) => id.split(",").map((i) => i.trim().toUpperCase())),
          ...emIds.flatMap((id) => id.split(",").map((i) => i.trim().toUpperCase())),
        ]),
      ];
      // TODO: Ganti utility.insertNotifikasi ke NotificationService jika sudah NestJS
      // await this.notificationService.insertNotification(...)
      await conn.commit();
      return {
        status: true,
        message: "Succesfuly create shift",
        nomor_ajuan: nomorLb,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException(e);
    } finally {
      if (conn) await conn.release();
    }
  }
} 