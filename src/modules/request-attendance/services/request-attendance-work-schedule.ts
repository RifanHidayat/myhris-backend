import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface WorkScheduleDto {
  database: string;
}

@Injectable()
export class RequestAttendanceWorkScheduleService {
  async workSchedule(dto: WorkScheduleDto): Promise<any> {
    const database = dto.database;
    const model = require('../../../common/model');
    let connection;
    try {
      connection = await (
        await model.createConnection1(`${database}_hrm`)
      ).getConnection();
      await connection.beginTransaction();
      const query = `SELECT id, name, time_in, time_out FROM work_schedule`;
      const [records] = await connection.query(query);
      await connection.commit();
      if (records.length === 0) {
        throw new NotFoundException('Data tidak ditemukan');
      }
      return {
        status: true,
        message: 'Data berhasil diambil',
        data: records,
      };
    } catch (e) {
      if (connection) {
        await connection.rollback();
      }
      throw new InternalServerErrorException(
        'Gagal mengambil data work schedule',
      );
    } finally {
      if (connection) await connection.release();
    }
  }
}
