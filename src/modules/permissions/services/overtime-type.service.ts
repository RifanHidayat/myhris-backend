import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';

interface OvertimeTypeResult {
  status: boolean;
  message: string;
  data: any[];
}

@Injectable()
export class OvertimeTypeService {
  constructor(private readonly dbService: DbService) {}

  async getOvertimeTypes(dto: {
    database: string;
  }): Promise<OvertimeTypeResult> {
    console.log("-----get overtime types----------");
    
    const database = dto.database;
    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `SELECT * FROM overtime WHERE status = 'ACTIVE' ORDER BY name ASC`
      );
      
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil data overtime types!",
        data: results,
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data overtime types');
    }
  }

  async getOvertimeTypeById(dto: {
    database: string;
    id: number;
  }): Promise<OvertimeTypeResult> {
    console.log("-----get overtime type by id----------");
    
    const database = dto.database;
    const id = dto.id;
    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `SELECT * FROM overtime WHERE id = ${id} AND status = 'ACTIVE'`
      );
      
      await trx.commit();
      
      return {
        status: true,
        message: "Berhasil ambil data overtime type!",
        data: results,
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data overtime type');
    }
  }
}
