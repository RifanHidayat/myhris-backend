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
    search: string;
    start_periode: string;
    end_periode: string;
  }): Promise<LogActivitySearchResult> {
    console.log("-----pencarian aktifitas----------");
    
    const database = dto.database;
    const em_id = dto.em_id;
    const search = dto.search;
    const startPeriode = dto.start_periode;
    const endPeriode = dto.end_periode;
    let startDb= formatDbName(startPeriode, database);
    let endDb= formatDbName(endPeriode, database);
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);
    
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    
    const knex = this.dbService.getConnection(database);
    try {
      const trx = await knex.transaction();
      
      let query=
        `SELECT * FROM ${endDb}.logs_actvity WHERE createdUserID='${em_id}' AND menu_name LIKE '%${search}%' ORDER BY idx DESC`
        if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
          query= `SELECT atten_date FROM ${startDb}.attendance WHERE em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')  
          UNION 
          SELECT atten_date FROM ${endDb}.attendance WHERE em_id='${em_id}' AND atttype='1' AND  (atten_date>='${startPeriode}' AND atten_date<='${endPeriode}')  
          `;
        }
        const [results] = await trx.raw(
         query
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