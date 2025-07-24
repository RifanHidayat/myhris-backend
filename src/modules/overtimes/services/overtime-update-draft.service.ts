import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OvertimeUpdateDraftDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: Array<{ task: string; judul: string; status: string; level: number; tgl_finish: string; id?: number }>;
  id: string;
  status: string;
}

@Injectable()
export class OvertimeUpdateDraftService {
  async updateDraft(dto: OvertimeUpdateDraftDto): Promise<any> {
    const model = require('../../../common/model');
    const utility = require('../../../common/utility');
    const database = dto.database;
    const array = dto.atten_date.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const connection = await model.createConnection1(`${database}_hrm`);
    const id = dto.id;
    const status = dto.status;
    const listTask = dto.list_task;
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const script = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id='${id}'`;
      await conn.query(script, [dto]);
      await conn.query(`DELETE FROM ${namaDatabaseDynamic}.emp_labor_task WHERE emp_labor_id = ${id}`);
      for (const item of listTask) {
        const { task, judul, status, level, tgl_finish } = item;
        await conn.query(
          `INSERT INTO ${namaDatabaseDynamic}.emp_labor_task (task,persentase,emp_labor_id,level) VALUES(?, '0', ?, ?)`,
          [task, id, level]
        );
      }
      await conn.commit();
      return {
        status: true,
        message: 'Insert to draft successfully',
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Gagal update draft lembur: ' + e.message);
    } finally {
      if (conn) await conn.release();
    }
  }
}
  