import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SubmitAttendanceDto } from '../dto/submit-attendance.dto';
import { DbService } from '../../../config/database.service';
import { SftpService } from '../../../config/sftp.service';
import { FcmService } from '../../../common/fcm.service';
import randomstring from 'randomstring';
import { formatDbNameNow, databaseMaster, getDateNow } from 'src/common/utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubmitAttendanceService {
  constructor(
    private readonly dbService: DbService,
    private readonly sftpService: SftpService,
    private readonly fcmService: FcmService,
  ) {}

  async submitAttendance(dto: SubmitAttendanceDto & { database: string }): Promise<any> {
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
    const namaDatabasMaster = `${database}_hrm`;

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
    let statusAbsen = '';
    let isNotif = false;
    let deskription = '';
    let title = '';
    let nomorLb = `LB20${convertYear}${convertBulan}`;
    let em_id = dto.em_id || '';
    let dateNow = dto.tanggal_absen || '';
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
      atten_date: dto.tanggal_absen || '',
      signin_time: jamMasuk || '00:00:00',
      signout_time: jamKeluar || '00:00:00',
      working_hour: '',
      place_in: lokasiAbsenIn || '',
      place_out: lokasiAbsenOut || '',
      absence: '',
      overtime: '',
      earnleave: '',
      status: '',
      signin_longlat: latLangIn || '',
      signout_longlat: latLangOut || '',
      signin_pict: gambarMasuk || '',
      signout_pict: gambarKeluar || '',
      signin_note: catatanMasuk || '',
      signout_note: catatanKeluar || '',
      signin_addr: lokasiMasuk || '',
      signout_addr: lokasiKeluar || '',
      atttype: parseInt(dto.kategori || '0'),
      reg_type: dto.reg_type || 0,
    };

    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      // 1. Cek data absen hari ini
      const results = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ em_id: dto.em_id, atten_date: dto.tanggal_absen })
        .orderBy('id', 'desc');
      if (results.length === 0) {
        // Absen pertama (datang)
        await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        // Example: Send notification after absen masuk
        // TODO: Get token, title, message, url, emIdPengajuan, idx from DB or logic
        // await this.fcmService.sendAttendanceNotification(token, title, message, url, emIdPengajuan, idx);
      } else {
        // Sudah ada absen, update signout jika diperlukan
        const lastItem = results[0];
        if (!lastItem.signout_time || lastItem.signout_time === '00:00:00') {
          await trx(`${namaDatabaseDynamic}.attendance`)
            .where({ id: lastItem.id })
            .update({
              signout_time: jamKeluar,
              place_out: lokasiAbsenOut,
              signout_longlat: latLangOut,
              signout_pict: gambarKeluar,
              signout_note: catatanKeluar,
              signout_addr: lokasiKeluar,
            });
          // Example: Send notification after absen keluar
          // TODO: Get token, title, message, url, emIdPengajuan, idx from DB or logic
          // await this.fcmService.sendAttendanceNotification(token, title, message, url, emIdPengajuan, idx);
          // TODO: Call sendAttendanceWarningNotification, sendApprovalNotification, etc as needed
        } else {
          // Sudah absen keluar, insert absen baru jika logic mengizinkan
          await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        }
      }
      // TODO: Implement full logic for lembur, SP, notifikasi, dsb, using Knex and FcmService
      await trx.commit();
      return {
        status: true,
        message: 'berhasil kirim absen',
        title,
        is_show_notif: isNotif,
        deskription,
        status_absen: statusAbsen,
        data: insertData,
      };
    } catch (error) {
      await trx.rollback();
      throw new InternalServerErrorException('Gagal kirim absen', error.message);
    }
  }
}
