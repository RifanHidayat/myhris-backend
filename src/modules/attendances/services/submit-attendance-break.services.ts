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
import { formatDbNameNow, getDateNow, getTimeNow } from 'src/common/utils';

interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

interface AttendanceBreakFormDataDto {
  database: string;
  em_id: string;
  date?: string; // Changed from tanggal_absen to date, optional
  reg_type: number;
  type_attendance?: string;
  location?: string;
  note?: string;
  lat_lang?: string;
  place?: string;
  category?: string;
  image?: FileUpload; // For FormData file upload
}

@Injectable()
export class SubmitAttendanceBreakService {
  constructor(
    private readonly dbService: DbService,
    private readonly sftpService: SftpService,
    private readonly fcmService: FcmService,
  ) {}

  async submitAttendanceBreak(dto: AttendanceBreakFormDataDto): Promise<any> {
    const database = dto.database;
    let nameFile = '';
    
    // Get attendance date - use today if date is undefined, null, or empty
    const attendanceDate = dto.date && dto.date.trim() !== '' ? dto.date : getDateNow();
    
    // Handle image upload to FTP using FormData
    if (dto.reg_type === 1 && dto.image) {
      try {
        const now = new Date();
        const stringRandom = randomstring.generate(5);
        nameFile = `${stringRandom}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${now.getHours()}${now.getMinutes()}.png`;
        const tempPath = path.join('/tmp', nameFile);
        
        // Write file from FormData to temp file
        fs.writeFileSync(tempPath, dto.image.buffer);
        
        // Upload to FTP
        const remotePath = `/foto_absen/${database}/${nameFile}`;
        await this.sftpService.connect();
        await this.sftpService.uploadFile(tempPath, remotePath);
        await this.sftpService.disconnect();
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
        
        console.log(`✅ Image uploaded successfully: ${remotePath}`);
        console.log(`📁 File size: ${dto.image.size} bytes`);
        console.log(`📋 Original filename: ${dto.image.originalname}`);
      } catch (error) {
        console.error('❌ Error uploading image to FTP:', error);
        // Continue without image if upload fails
        nameFile = '';
      }
    }

    // Date and period logic
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const convertYear = String(year).substring(2, 4);
    const convertBulan = month <= 9 ? `0${month}` : String(month);
    const namaDatabaseDynamic = formatDbNameNow(database);

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
    let typeAbsen = (dto.type_attendance ?? '').toString();
    // Get current time in HH:mm:ss format
    let formattedTime = getTimeNow();
    
    if (typeAbsen === '1') {
      jamMasuk = formattedTime;
      gambarMasuk = dto.reg_type == 0 ? '' : nameFile;
      lokasiMasuk = dto.location || '';
      catatanMasuk = dto.note || '';
      latLangIn = dto.lat_lang || '';
      lokasiAbsenIn = dto.place || '';
    } else {
      jamKeluar = formattedTime;
      gambarKeluar = dto.reg_type == 0 ? '' : nameFile;
      lokasiKeluar = dto.location || '';
      catatanKeluar = dto.note || '';
      latLangOut = dto.lat_lang || '';
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
      breakin_addr: lokasiMasuk || '',
      breakout_addr: lokasiKeluar || '',
      atttype: parseInt(dto.category || '0'),
      atten_date: attendanceDate,
      reg_type: dto.reg_type || 0,
    };

    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      // 1. Cek data absen regular (check-in/check-out) hari ini
      const regularAttendance = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ 
          em_id: dto.em_id, 
          atten_date: attendanceDate 
        })
        .whereNotNull('signin_time')
        .where('signin_time', '!=', '00:00:00')
        .orderBy('id', 'desc')
        .first();

      // 2. Validasi: Cek apakah sudah ada absen masuk
      if (!regularAttendance) {
        await trx.rollback();
        return {
          status: false,
          message: 'Anda belum memiliki absen masuk hari ini. Silakan absen masuk terlebih dahulu.',
          data: null,
        };
      }

      // 3. Cek data absen istirahat hari ini
      const breakAttendance = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ 
          em_id: dto.em_id, 
          atten_date: attendanceDate 
        })
        .whereNotNull('breakin_time')
        .where('breakin_time', '!=', '00:00:00')
        .orderBy('id', 'desc')
        .first();

      if (!breakAttendance) {
        // Belum ada absen istirahat, update record yang sudah ada dengan break in
        await trx(`${namaDatabaseDynamic}.attendance`)
          .where({ 
            em_id: dto.em_id, 
            atten_date: attendanceDate 
          })
          .update({
            breakin_time: jamMasuk,
            place_break_in: lokasiAbsenIn,
            breakin_longlat: latLangIn,
            breakin_pict: gambarMasuk,
            breakin_note: catatanMasuk,
            breakin_addr: lokasiMasuk,
          });
        console.log('✅ Break in recorded successfully');
        
        await trx.commit();
        return {
          status: true,
          message: 'berhasil kirim absen istirahat masuk',
          data: {
            ...insertData,
            image_uploaded: nameFile ? true : false,
            image_path: nameFile ? `/foto_absen/${database}/${nameFile}` : null,
            original_filename: dto.image?.originalname || null,
            file_size: dto.image?.size || null,
          },
        };
      } else {
        // Sudah ada absen istirahat, cek apakah sudah break out
        if (!breakAttendance.breakout_time || breakAttendance.breakout_time === '00:00:00') {
          // Belum break out, update break out
          await trx(`${namaDatabaseDynamic}.attendance`)
            .where({ id: breakAttendance.id })
            .update({
              breakout_time: jamKeluar,
              place_break_out: lokasiAbsenOut,
              breakout_longlat: latLangOut,
              breakout_pict: gambarKeluar,
              breakout_note: catatanKeluar,
              breakout_addr: lokasiKeluar,
            });
          console.log('✅ Break out recorded successfully');
          
          await trx.commit();
          return {
            status: true,
            message: 'berhasil kirim absen istirahat keluar',
            data: {
              ...insertData,
              image_uploaded: nameFile ? true : false,
              image_path: nameFile ? `/foto_absen/${database}/${nameFile}` : null,
              original_filename: dto.image?.originalname || null,
              file_size: dto.image?.size || null,
            },
          };
        } else {
          // Sudah break out, berikan pesan error
          await trx.rollback();
          return {
            status: false,
            message: 'Anda sudah istirahat keluar. Tidak dapat melakukan absen istirahat lagi.',
            data: null,
          };
        }
      }
    } catch (error) {
      await trx.rollback();
      console.error('❌ Error in submitAttendanceBreak:', error);
      throw new InternalServerErrorException('Gagal kirim absen istirahat', error.message);
    }
  }

  // Method untuk mengambil parameter dari ID
  async getAttendanceById(id: string, database: string): Promise<any> {
    try {
      const namaDatabaseDynamic = formatDbNameNow(database);
      const knex = this.dbService.getConnection(database);
      
      const attendance = await knex(`${namaDatabaseDynamic}.attendance`)
        .where('id', id)
        .first();
      
      if (!attendance) {
        throw new InternalServerErrorException('Attendance tidak ditemukan');
      }
      
      return {
        status: true,
        message: 'Success get attendance by ID',
        data: attendance,
      };
    } catch (error) {
      console.error('❌ Error in getAttendanceById:', error);
      throw new InternalServerErrorException('Gagal mengambil data attendance', error.message);
    }
  }

  // Method untuk update attendance berdasarkan ID
  async updateAttendanceById(id: string, dto: any, database: string): Promise<any> {
    try {
      const namaDatabaseDynamic = formatDbNameNow(database);
      const knex = this.dbService.getConnection(database);
      
      const updateData = {
        breakin_time: dto.breakin_time || '00:00:00',
        breakout_time: dto.breakout_time || '00:00:00',
        place_break_in: dto.place_break_in || '',
        place_break_out: dto.place_break_out || '',
        breakin_longlat: dto.breakin_longlat || '',
        breakout_longlat: dto.breakout_longlat || '',
        breakin_pict: dto.breakin_pict || '',
        breakout_pict: dto.breakout_pict || '',
        breakin_note: dto.breakin_note || '',
        breakout_note: dto.breakout_note || '',
        breakin_addr: dto.breakin_addr || '',
        breakout_addr: dto.breakout_addr || '',
        updated_at: new Date(),
      };
      
      await knex(`${namaDatabaseDynamic}.attendance`)
        .where('id', id)
        .update(updateData);
      
      return {
        status: true,
        message: 'Success update attendance by ID',
        data: { id, ...updateData },
      };
    } catch (error) {
      console.error('❌ Error in updateAttendanceById:', error);
      throw new InternalServerErrorException('Gagal update data attendance', error.message);
    }
  }

  // Method untuk delete attendance berdasarkan ID
  async deleteAttendanceById(id: string, database: string): Promise<any> {
    try {
      const namaDatabaseDynamic = formatDbNameNow(database);
      const knex = this.dbService.getConnection(database);
      
      const deletedCount = await knex(`${namaDatabaseDynamic}.attendance`)
        .where('id', id)
        .del();
      
      if (deletedCount === 0) {
        throw new InternalServerErrorException('Attendance tidak ditemukan untuk dihapus');
      }
      
      return {
        status: true,
        message: 'Success delete attendance by ID',
        data: { id, deleted_count: deletedCount },
      };
    } catch (error) {
      console.error('❌ Error in deleteAttendanceById:', error);
      throw new InternalServerErrorException('Gagal delete data attendance', error.message);
    }
  }
}
