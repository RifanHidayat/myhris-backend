import { Request, Response } from 'express';
import { models } from '../../../common/model';

export async function insertDraft(req: Request, res: Response): Promise<void> {
  const database: string = req.query.database as string;
  const em_id: string = req.body.em_id;
  const array: string[] = req.body.atten_date.split('-');
  const listTask: any[] = req.body.list_task;
  const attenDate: string = req.body.atten_date;
  const status: string = req.body.status;
  const tanggalOld: string = req.body.tanggal_old;

  const tahun = `${array[0]}`;
  const convertYear = tahun.substring(2, 4);
  const convertBulan = array[1].padStart(2, '0');
  const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
  const connection = await models.createConnection1(namaDatabaseDynamic);
  let conn: any;
  try {
    conn = await connection.getConnection();
    await conn.beginTransaction();

    const tanggalFinal = tanggalOld === '' ? attenDate : tanggalOld;
    const [cekDaily] = await conn.query(
      `SELECT id FROM daily_task WHERE tgl_buat = ? AND em_id = ?`,
      [attenDate, em_id]
    );
    if (cekDaily.length > 0) {
      res.status(400).json({
        status: false,
        message: `Tugas di tanggal ${attenDate} ini sudah tersedia`,
      });
      return;
    }
    const queryTask = `INSERT INTO daily_task (em_id, tgl_buat, status_pengajuan) VALUES (?, ?, ?)`;
    const [task] = await conn.query(queryTask, [em_id, attenDate, status]);
    const taskId = task.insertId;
    const queryDetail = `INSERT INTO daily_task_detail (judul, rincian, tgl_finish, daily_task_id, status, level) VALUES (?, ?, ?, ?, ?, ?)`;
    for (const item of listTask) {
      const { task, judul, status, level, tgl_finish } = item;
      const tanggal = formatDate(tgl_finish);
      await conn.query(queryDetail, [judul, task, tanggal, taskId, status.toString(), level]);
    }
    await conn.commit();
    res.status(200).json({
      success: true,
      message: 'Data berhasil di masukan',
    });
  } catch (error: any) {
    if (conn) await conn.rollback();
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data: ' + error.message,
    });
  } finally {
    if (conn) conn.release();
  }
}