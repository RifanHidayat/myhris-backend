import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbName } from 'src/common/utils';

interface LogActivitySearchResult {
  status: boolean;
  jumlah_data: number;
  message: string;
  data: any[];
}

@Injectable()
export class LogActivitySearchService {
  constructor(private readonly dbService: DbService) {}

  async pencarian_aktifitas(dto: {
    database: string;
    em_id: string;
    cari: string;
    start_periode: string;
    end_periode: string;
  }): Promise<LogActivitySearchResult> {
    console.log("-----pencarian aktifitas----------");
    
    const database = dto.database;
    const em_id = dto.em_id;
    const cari = dto.cari;
    let startDb= formatDbName(database, dto.start_periode);
    let endDb= formatDbName(database, dto.end_periode);

    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      const [results] = await trx.raw(
        `SELECT * FROM ${endDb}.logs_actvity WHERE createdUserID='${em_id}' AND menu_name LIKE '%${cari}%' ORDER BY idx DESC`
      );
      
      await trx.commit();
      
      return {
        status: true,
        jumlah_data: results.length,
        message: "Berhasil ambil data!",
        data: results,
      };
    } catch (error) {
      console.error("error", error);
      throw new InternalServerErrorException('Gagal ambil data');
    }
  }
}