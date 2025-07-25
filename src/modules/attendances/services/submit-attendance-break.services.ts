import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SubmitAttendanceDto } from '../dto/submit-attendance.dto';
import { DbService } from '../../../config/database.service';
import { SftpService } from '../../../config/sftp.service';
import { FcmService } from '../../../common/fcm.service';
import randomstring from 'randomstring';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubmitAttendanceBreakService {
  constructor(
    private readonly dbService: DbService,
    private readonly sftpService: SftpService,
    private readonly fcmService: FcmService,
  ) {}

  async submitAttendanceBreak(dto: SubmitAttendanceDto & { database: string }): Promise<any> {
    const database = dto.database;
    let nameFile = '';
    if (dto.reg_type === 1 && dto.gambar) {
      const now = new Date();
      const stringRandom = randomstring.generate(5);
      nameFile = `${stringRandom}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${now.getHours()}${now.getMinutes()}.png`;
      const tempPath = path.join('/tmp', nameFile);
      fs.writeFileSync(tempPath, Buffer.from(dto.gambar, 'base64'));
      const remotePath = `/foto_absen/${database}/${nameFile}`;
      await this.sftpService.connect();
      await this.sftpService.uploadFile(tempPath, remotePath);
      await this.sftpService.disconnect();
      fs.unlinkSync(tempPath);
    }

    // Date and period logic
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const convertYear = String(year).substring(2, 4);
    const convertBulan = month <= 9 ? `0${month}` : String(month);
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    // Prepare insert data
    let jamMasuk = '';
    let jamKeluar = '';
    let gambarMasuk = '';
    let gambarKeluar = '';
    let lokasiAbsenIn = '';
    let lokasiAbsenOut = '';
    let latLangIn = '';
    let latLangOut = '';
    let lokasiMasuk = '';
    let lokasiKeluar = '';
    let catatanMasuk = '';
    let catatanKeluar = '';
    let typeAbsen = (dto.typeAbsen ?? '').toString();
    let formattedTime = now.toTimeString().split(' ')[0];
    if (typeAbsen === '1') {
      jamMasuk = formattedTime;
      gambarMasuk = dto.reg_type == 0 ? '' : nameFile;
      lokasiMasuk = dto.lokasi || '';
      catatanMasuk = dto.catatan || '';
      latLangIn = dto.latLang || '';
      lokasiAbsenIn = dto.place || '';
    } else {
      jamKeluar = formattedTime;
      gambarKeluar = dto.reg_type == 0 ? '' : nameFile;
      lokasiKeluar = dto.lokasi || '';
      catatanKeluar = dto.catatan || '';
      latLangOut = dto.latLang || '';
      lokasiAbsenOut = dto.place || '';
    }

    const insertData: any = {
      em_id: dto.em_id || '',
      breakin_time: jamMasuk || '00:00:00',
      breakout_time: jamKeluar || '00:00:00',
      working_hour: '',
      place_break_in: lokasiAbsenIn || '',
      place_break_out: lokasiAbsenOut || '',
      absence: '',
      overtime: '',
      earnleave: '',
      status: '',
      breakin_longlat: latLangIn || '',
      breakout_longlat: latLangOut || '',
      breakin_pict: gambarMasuk || '',
      breakout_pict: gambarKeluar || '',
      breakin_note: catatanMasuk || '',
      breakout_note: catatanKeluar || '',
      brakin_addr: lokasiMasuk || '',
      breakout_addr: lokasiKeluar || '',
      atttype: parseInt(dto.kategori || '0'),
      atten_date: dto.tanggal_absen || '',
      reg_type: dto.reg_type || 0,
    };

    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      // 1. Cek data absen istirahat hari ini
      const results = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ em_id: dto.em_id, atten_date: dto.tanggal_absen })
        .orderBy('id', 'desc');
      if (results.length === 0) {
        // Absen break pertama (masuk istirahat)
        await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        // Example: Send notification after break in
        // TODO: Get token, title, message, url, emIdPengajuan, idx from DB or logic
        // await this.fcmService.sendAttendanceNotification(token, title, message, url, emIdPengajuan, idx);
      } else {
        // Sudah ada absen, update break out jika diperlukan
        const lastItem = results[0];
        if (!lastItem.breakout_time || lastItem.breakout_time === '00:00:00') {
          await trx(`${namaDatabaseDynamic}.attendance`)
            .where({ id: lastItem.id })
            .update({
              breakout_time: jamKeluar,
              place_break_out: lokasiAbsenOut,
              breakout_longlat: latLangOut,
              breakout_pict: gambarKeluar,
              breakout_note: catatanKeluar,
              breakout_addr: lokasiKeluar,
            });
          // Example: Send notification after break out
          // TODO: Get token, title, message, url, emIdPengajuan, idx from DB or logic
          // await this.fcmService.sendAttendanceNotification(token, title, message, url, emIdPengajuan, idx);
        } else {
          // Sudah break out, insert break baru jika logic mengizinkan
          await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        }
      }
      await trx.commit();
      return {
        status: true,
        message: 'berhasil kirim absen istirahat',
        data: insertData,
      };
    } catch (error) {
      await trx.rollback();
      throw new InternalServerErrorException('Gagal kirim absen istirahat', error.message);
    }
  }
}
