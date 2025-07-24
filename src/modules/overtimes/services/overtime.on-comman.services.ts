import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

interface OvertimeOnCommandDto {
  database: string;
  start_periode?: string;
  end_periode?: string;
  val?: any;
  cari?: any;
  dep_group_id?: string;
  branch_id?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

@Injectable()
export class OvertimeOnCommandService {
  async atasPerintah(dto: OvertimeOnCommandDto): Promise<any> {
    const { database, dep_group_id } = dto;
    try {
      const connection = await model.createConnection1(`${database}_hrm`);
      let conn;
      try {
        conn = await connection.getConnection();
        await conn.beginTransaction();
        const [results] = await conn.query(`SELECT * FROM employee
JOIN designation ON employee.des_id = designation.id
JOIN department_group ON employee.dep_group_id = department_group.id
WHERE designation.level <= 3 AND department_group.id = ${dep_group_id};`);
        await conn.commit();
        return {
          status: true,
          message: 'Successfuly get data',
          data: results,
        };
      } catch (e) {
        if (conn) {
          await conn.rollback();
        }
        throw new InternalServerErrorException('Gagal ambil data');
      } finally {
        if (conn) await conn.release();
      }
    } catch (e) {
      throw new BadRequestException('Koneksi database gagal');
    }
  }
}
