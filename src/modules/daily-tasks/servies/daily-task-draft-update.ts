import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface UpdateDraftDto {
  database: string;
  em_id: string;
  atten_date: string;
  list_task: any[];
  status: string;
  id: string | number;
}

const models = require('../../../common/model');

@Injectable()
export class DailyTaskDraftUpdateService {
  async updateDraft(dto: UpdateDraftDto): Promise<any> {
    const { database, em_id, atten_date, list_task, status, id } = dto;
    const array = atten_date.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = array[1].padStart(2, '0');
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const connection = await models.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [cekDaily] = await conn.query(
        `SELECT * FROM daily_task WHERE em_id = ? AND tgl_buat = ? AND id != ?`,
        [em_id, atten_date, id]
      );
      if (cekDaily.length > 0) {
        throw new BadRequestException(`Tugas di tanggal ${atten_date} ini sudah tersedia`);
      } else {
        const taskId = id.toString();
        const queryTask = `UPDATE daily_task SET em_id = ?, tgl_buat = ?, status_pengajuan = ? WHERE id = ?`;
        const queryDetail = `INSERT INTO daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
        await conn.query(queryTask, [em_id, atten_date, status, taskId]);
        const deleteQuery = `DELETE FROM daily_task_detail WHERE daily_task_id = ?`;
        await conn.query(deleteQuery, [taskId]);
        for (const item of list_task) {
          const { task, judul, status, level, tgl_finish } = item;
          const tanggal = this.formatDate(tgl_finish);
          await conn.query(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
        }
      }
      await conn.commit();
      return {
        status: true,
        message: 'Data Berhasil Ditambahkan',
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw new InternalServerErrorException('Gagal menambahkan data: ' + error.message);
    } finally {
      if (conn) conn.release();
    }
  }

  private formatDate(date: string): string {
    // Implementasi format date sesuai kebutuhan
    return date;
  }
}