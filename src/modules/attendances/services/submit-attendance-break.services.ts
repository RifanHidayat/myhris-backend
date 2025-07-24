import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SubmitAttendanceDto } from '../dto/submit-attendance.dto';
import { DbService } from '../../../config/database.service';
import { SftpService } from '../../../config/sftp.service';
import randomstring from 'randomstring';
import { formatDbNameNow, databaseMaster, getDateNow } from 'src/common/utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubmitAttendanceBreakService {
  constructor(
    private readonly dbService: DbService,
    private readonly sftpService: SftpService,
  ) {}

  async submitAttendanceBreak(dto: SubmitAttendanceDto): Promise<any> {
    const database = dto.database;
    const em_id = dto.em_id;
    const reg_type = dto.reg_type;
    const gambar = dto.gambar;
    const lokasi = dto.lokasi;
    const catatan = dto.catatan;
    const latLang = dto.latLang;
    const place = dto.place;
    const kategori = dto.kategori;
    const typeAbsen = dto.typeAbsen;
    const tanggal_absen = dto.tanggal_absen;
    const start_date = dto.start_date;
    const end_date = dto.end_date;
    const start_time = dto.start_time;
    const end_time = dto.end_time;

    // Generate nama file jika ada gambar
    let nameFile = '';
    if (reg_type === 1 && gambar) {
      const now = new Date();
      const date = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const hour = now.getHours();
      const menit = now.getMinutes();
      const stringRandom = randomstring.generate(5);
      nameFile = `${stringRandom}${date}${month}${year}${hour}${menit}.png`;
      // Upload ke SFTP
      const remoteFilePath = `/remote/path/${database}/foto_absen/${nameFile}`; // Ganti remoteDirectory sesuai kebutuhan
      const buffer = Buffer.from(gambar, 'base64');
      // Simpan buffer ke file sementara
      const tempDir = path.join(__dirname, '../../../../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const tempFilePath = path.join(tempDir, nameFile);
      fs.writeFileSync(tempFilePath, buffer);
      try {
        await this.sftpService.connect();
        await this.sftpService.uploadFile(tempFilePath, remoteFilePath);
        await this.sftpService.disconnect();
      } catch (err) {
        fs.unlinkSync(tempFilePath);
        throw new BadRequestException('Gagal upload gambar absen istirahat');
      }
      fs.unlinkSync(tempFilePath);
    }

    // Format nama database
    const now = new Date();
    const tahun = `${now.getFullYear()}`;
    const convertYear = tahun.substring(2, 4);
    const convertBulan = (now.getMonth() + 1).toString().padStart(2, '0');
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    const knex = this.dbService.getConnection(database);
    let trx;
    try {
      trx = await knex.transaction();
      // Cek apakah sudah ada record attendance untuk hari itu
      const existing = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ em_id, atten_date: tanggal_absen })
        .orderBy('id', 'desc');
      let insertData: any = {
        em_id,
        breakin_time: '',
        breakout_time: '',
        working_hour: '',
        place_break_in: '',
        place_break_out: '',
        absence: '',
        overtime: '',
        earnleave: '',
        status: '',
        breakin_longlat: '',
        breakout_longlat: '',
        breakin_pict: '',
        breakout_pict: '',
        breakin_note: '',
        breakout_note: '',
        breakin_addr: '',
        breakout_addr: '',
        atttype:
          kategori && !isNaN(parseInt(kategori as string))
            ? parseInt(kategori as string)
            : 1,
      };
      // Set jam masuk/keluar istirahat, gambar, lokasi, dsb
      const currentTime = new Date();
      let hnew = currentTime.getHours();
      let minew = currentTime.getMinutes().toString().padStart(2, '0');
      let snew = currentTime.getSeconds().toString().padStart(2, '0');
      const formattedTime = `${hnew.toString().padStart(2, '0')}:${minew}:${snew}`;
      if (String(typeAbsen) === '1') {
        insertData.breakin_time = formattedTime;
        insertData.breakin_pict = reg_type === 0 ? '' : nameFile;
        insertData.place_break_in = place;
        insertData.breakin_note = catatan;
        insertData.breakin_longlat = latLang;
        insertData.breakin_addr = lokasi;
      } else {
        insertData.breakout_time = formattedTime;
        insertData.breakout_pict = reg_type === 0 ? '' : nameFile;
        insertData.place_break_out = place;
        insertData.breakout_note = catatan;
        insertData.breakout_longlat = latLang;
        insertData.breakout_addr = lokasi;
      }
      // Insert/update logic
      if (!existing || existing.length === 0) {
        await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
      } else {
        const lastItem = existing[0];
        if (!lastItem.breakout_time || lastItem.breakout_time === '00:00:00') {
          await trx(`${namaDatabaseDynamic}.attendance`)
            .where({ id: lastItem.id })
            .update({
              breakout_time: insertData.breakout_time,
              place_break_out: insertData.place_break_out,
              breakout_longlat: insertData.breakout_longlat,
              breakout_pict: insertData.breakout_pict,
              breakout_note: insertData.breakout_note,
              breakout_addr: insertData.breakout_addr,
            });
        } else {
          await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        }
      }
      await trx.commit();
      return {
        status: true,
        message: 'Berhasil kirim absen istirahat',
        data: insertData,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw new InternalServerErrorException(
        'Gagal submit absen istirahat: ' + error.message,
      );
    }
  }
}
