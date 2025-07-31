import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface LeaveTypeDto {
  database: string;
  email?: string;
  periode?: string;
  em_id?: string;
  durasi: string;
  dates?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk mengambil tipe cuti
 */
@Injectable()
export class LeaveTypeService {

  async tipeCuti(dto: LeaveTypeDto): Promise<any> {
    const database = dto.database;
    const email = dto.email;
    const periode = dto.periode;
    const emId = dto.em_id;
    const durasi = dto.durasi;
    
    console.log("durasi ", dto.durasi);
    
    const dates = dto.dates == undefined ? "2024-08,2024-09" : dto.dates;

    console.log(dto);

    let query = ``;

    const datesplits = dates.split(",");

    query = `SELECT * FROM ${database}_hrm.leave_types WHERE (submission_period<='${durasi}' OR backdate=0) AND status IN (1)`;
    console.log(query);
    
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [result] = await conn.query(query);
      console.log(result);
      await conn.commit();
      
      return {
        status: true,
        message: "Successfully get tipe cuti",
        data: result,
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("Error out", e);
      throw new InternalServerErrorException('Gagal ambil data tipe cuti');
    } finally {
      if (conn) await conn.release();
    }
  }
}