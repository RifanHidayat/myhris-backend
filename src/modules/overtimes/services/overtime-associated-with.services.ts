import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OvertimeAssociatedWithDto {
  database: string;
  dep_id: string | number;
  branch_id?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk mengambil data employee yang berhubungan dengan overtime
 */
@Injectable()
export class OvertimeAssociatedWithService {

  async berhubunganDengan(dto: OvertimeAssociatedWithDto): Promise<any> {
    console.log("-----------Berhubungan dengan----------");
    
    const database = dto.database;
    const dep_id = dto.dep_id;
    const branchId = dto.branch_id;

    const query1 = `SELECT * FROM ${database}_hrm.employee JOIN branch ON employee.branch_id=branch.id WHERE STATUS='ACTIVE' AND branch_id=${branchId} ORDER BY full_name ASC`;
    const query2 = `SELECT * FROM ${database}_hrm.employee WHERE dep_id='${dep_id}' AND branch_id=${branchId} AND status='ACTIVE' ORDER BY full_name ASC`;

    let url: string;
    if (dep_id == "0" || dep_id == 0) {
      url = query1;
      console.log(query1);
    } else {
      url = query2;
      console.log(query2);
    }
    
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [results] = await conn.query(url);
      await conn.commit();
      
      return {
        status: true,
        message: "Successfully get data",
        data: results,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("error", e);
      throw new InternalServerErrorException('Gagal ambil data');
    } finally {
      if (conn) await conn.release();
    }
  }
}