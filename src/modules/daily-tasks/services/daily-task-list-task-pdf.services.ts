import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { Response } from 'express';

interface DailyTaskListTaskPdfDto {
  database: string;
  em_id: string;
  tahun: string;
  bulan: string;
  id?: string;
  start_periode?: string;
  end_periode?: string;
  tenant?: string;
  emId?: string;
}

@Injectable()
export class DailyTaskListTaskPdfService {
  constructor(private readonly dbService: DbService) {}



  async streamDailyTaskPDF(dto: DailyTaskListTaskPdfDto, res: Response): Promise<void> {
    const { database, em_id, tahun, bulan, id, start_periode, end_periode, tenant, emId } = dto;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (bulan.length == 1) {
      convertBulan = parseInt(bulan) <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    let namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const startPeriode = start_periode || '2024-02-03';
    const endPeriode = end_periode || '2024-02-03';
    const date1 = new Date(startPeriode);
    const date2 = new Date(endPeriode);
    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;
    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      const endPeriodeDynamic = `${database}_hrm${endPeriode.substring(2, 4)}${endPeriode.split('-')[1]}`;
      namaDatabaseDynamic = endPeriodeDynamic;
    }
    
    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      
      // Get employee info and tasks
      const query = `
        SELECT 
          dt.tgl_buat, 
          dt.em_id, 
          dtd.judul, 
          dtd.rincian, 
          dtd.status, 
          dtd.tgl_finish, 
          dtd.level, 
          e.full_name, 
          e.job_title AS posisi, 
          d.name AS jabatan, 
          dep.name AS divisi 
        FROM ${namaDatabaseDynamic}.daily_task dt 
        INNER JOIN ${namaDatabaseDynamic}.daily_task_detail dtd ON dt.id = dtd.daily_task_id 
        INNER JOIN employee e ON dt.em_id = e.em_id 
        INNER JOIN department dep ON e.dep_id = dep.id 
        INNER JOIN designation d ON e.des_id = d.id 
        WHERE dt.em_id = ? AND dt.status_pengajuan = 'post' 
        ORDER BY dt.tgl_buat ASC, dtd.level ASC
      `;
      
      const [result] = await trx.raw(query, [em_id]);
      await trx.commit();
      
      if (result.length === 0) {
        res.status(404).json({
          status: false,
          message: 'Tidak ada data tugas harian untuk periode ini'
        });
        return;
      }
      
      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="daily-tasks-${em_id}-${startPeriode}-${endPeriode}.pdf"`);
      
      // Create PDF content as text (simplified version)
      const pdfContent = this.generatePDFContent(result, em_id, startPeriode, endPeriode);
      
      // Send PDF content
      res.send(pdfContent);
      
    } catch (error) {
      if (trx) await trx.rollback();
      res.status(500).json({
        status: false,
        message: 'Gagal generate PDF: ' + error.message
      });
    }
  }

  private generatePDFContent(data: any[], emId: string, startDate: string, endDate: string): string {
    let content = `DAILY TASK REPORT\n`;
    content += `Employee ID: ${emId}\n`;
    content += `Period: ${startDate} to ${endDate}\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    let currentDate = '';
    data.forEach((task, index) => {
      if (task.tgl_buat !== currentDate) {
        currentDate = task.tgl_buat;
        content += `\n=== ${currentDate} ===\n`;
      }
      
      content += `${task.level}. ${task.judul}\n`;
      content += `   Detail: ${task.rincian}\n`;
      content += `   Status: ${task.status === '1' ? 'Completed' : 'Pending'}\n`;
      if (task.tgl_finish) {
        content += `   Finish Date: ${task.tgl_finish}\n`;
      }
      content += `\n`;
    });
    
    return content;
  }
}
