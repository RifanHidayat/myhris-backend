import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../config/database.service';

interface OvertimeTypeResult {
  status: boolean;
  message: string;
  data: any[];
}

@Injectable()
export class OvertimeTypeService {
  constructor(private readonly dbService: DbService) {}

  async overtime(dto: {
    database: string;
    name_data?: string;
    start_periode?: string;
    end_periode?: string;
  }): Promise<OvertimeTypeResult> {
    const database = dto.database;
    console.log("database ", database);
    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `SELECT * FROM ${database}_hrm.overtime WHERE aktif='Y'`
      );
      
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil data overtime types!",
        data: results,
      };
    } catch (error) {
      console.error("Error executing SELECT statement:", error);
      throw new InternalServerErrorException('Gagal ambil data overtime types');
    }
  }
}
