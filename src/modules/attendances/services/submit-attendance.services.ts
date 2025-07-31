import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SubmitAttendanceDto } from '../dto/submit-attendance.dto';
import { DbService } from '../../../config/database.service';
import { SftpService } from '../../../config/sftp.service';
import { FcmService } from '../../../common/fcm.service';
import randomstring from 'randomstring';
import { databaseMaster, formatDbNameNow, getDateNow, getTimeNow } from 'src/common/utils';
import * as fs from 'fs';
import * as path from 'path';

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

interface AttendanceFormDataDto {
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
export class SubmitAttendanceService {
  constructor(
    private readonly dbService: DbService,
    private readonly sftpService: SftpService,
    private readonly fcmService: FcmService,
  ) {}

  async submitAttendance(dto: AttendanceFormDataDto): Promise<any> {
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
    const namaDatabasMaster = `${database}_hrm`;
    const dbMaster = databaseMaster(database);

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
    let tanggalAbsen = attendanceDate;
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
      atten_date: attendanceDate,
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
      atttype: parseInt(dto.category || '0'),
      reg_type: dto.reg_type || 0,
    };

    const knex = this.dbService.getConnection(database);
    const trx = await knex.transaction();
    try {
      
      // 1. Cek data absen hari ini
      const results = await trx(`${namaDatabaseDynamic}.attendance`)
        .where({ em_id: dto.em_id, atten_date: attendanceDate })
        .orderBy('id', 'desc');

    
   
      if (results.length === 0) {
        // Absen pertama (datang)
        await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
        console.log('✅ Attendance check-in recorded successfully');
        
        // Check work schedule for late detection
        const workSchedule = await trx(`${namaDatabaseDynamic}.emp_shift`)
          .select('work_schedule.time_in as jam_masuk')
          .join(`${database}_hrm.work_schedule`, 'emp_shift.work_id', 'work_schedule.id')
          .where('emp_shift.em_id', em_id)
          .andWhereRaw('emp_shift.atten_date LIKE ?', [`%${tanggalAbsen}%`])
          .first();

        if (workSchedule && workSchedule.jam_masuk) {
          const jamMasukJadwal = workSchedule.jam_masuk;
          
          // Check if late
          if (jamMasuk > jamMasukJadwal) {
            // Check for approved leave or official duty
            const approvedLeave = await trx(`${namaDatabaseDynamic}.emp_leave`)
              .where('date_selected', 'LIKE', `%${tanggalAbsen}%`)
              .andWhere('leave_status', 'Approve2')
              .andWhere('ajuan', '2')
              .first();

            const officialDuty = await trx(`${namaDatabaseDynamic}.emp_labor`)
              .where('atten_date', tanggalAbsen)
              .andWhere('em_id', em_id)
              .andWhere('status', 'Approve2')
              .first();

            if (!approvedLeave && !officialDuty && lokasiAbsenIn !== 'TUGAS LUAR KANTOR') {
              // Late without excuse - handle warning letter logic
              await this.handleLateAttendance(trx, namaDatabaseDynamic, namaDatabasMaster, em_id, tanggalAbsen, jamMasuk, jamMasukJadwal);
            }
          }
        }
        
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
          console.log('✅ Attendance check-out recorded successfully');
          
          // Handle overtime logic
          await this.handleOvertimeLogic(trx, namaDatabaseDynamic, namaDatabasMaster, em_id, tanggalAbsen, jamKeluar, lokasiAbsenOut);
          
          // Handle early leave logic
          await this.handleEarlyLeaveLogic(trx, namaDatabaseDynamic, namaDatabasMaster, em_id, tanggalAbsen, jamKeluar);
          
          // Example: Send notification after absen keluar
          // TODO: Get token, title, message, url, emIdPengajuan, idx from DB or logic
          // await this.fcmService.sendAttendanceNotification(token, title, message, url, emIdPengajuan, idx);
        } else {
          // Sudah absen keluar, insert absen baru jika logic mengizinkan
          await trx(`${namaDatabaseDynamic}.attendance`).insert(insertData);
          console.log('✅ New attendance session recorded');
        }
      }
      
      await trx.commit();
      return {
        status: true,
        message: 'berhasil kirim absen',
        title,
        is_show_notif: isNotif,
        deskription,
        status_absen: statusAbsen,
        data: {
          ...insertData,
          image_uploaded: nameFile ? true : false,
          image_path: nameFile ? `/foto_absen/${database}/${nameFile}` : null,
          original_filename: dto.image?.originalname || null,
          file_size: dto.image?.size || null,
        },
      };
    } catch (error) {
      await trx.rollback();
      console.error('❌ Error in submitAttendance:', error);
      throw new InternalServerErrorException('Gagal kirim absen', error.message);
    }
  }

  // Method untuk handle late attendance logic
  private async handleLateAttendance(trx: any, namaDatabaseDynamic: string, namaDatabasMaster: string, em_id: string, tanggalAbsen: string, jamMasuk: string, jamMasukJadwal: string): Promise<void> {
    try {
      // Get late attendance count
      const lateCount = await trx(`${namaDatabaseDynamic}.attendance`)
        .join(`${namaDatabaseDynamic}.emp_shift`, 'emp_shift.atten_date', 'attendance.atten_date')
        .join(`${namaDatabasMaster}.work_schedule`, 'work_schedule.id', 'emp_shift.work_id')
        .where('attendance.em_id', em_id)
        .andWhereRaw('work_schedule.time_in < attendance.signin_time')
        .count('* as count');

      const lateCountNum = parseInt(lateCount[0].count);

      // Get system data for late handling
      const sysdata = await trx(`${namaDatabasMaster}.sysdata`)
        .whereIn('kode', ['S01', '020', '029', 'S08', 'S09'])
        .orderBy('kode');

      if (sysdata.length > 0) {
        const maxLateCount = parseInt(sysdata[0]?.name || '3');
        
        if (lateCountNum >= maxLateCount) {
          // Generate warning letter
          await this.generateWarningLetter(trx, namaDatabasMaster, em_id, 'Absensi Terlambat', lateCountNum);
        }
      }
    } catch (error) {
      console.error('❌ Error in handleLateAttendance:', error);
    }
  }

  // Method untuk handle overtime logic
  private async handleOvertimeLogic(trx: any, namaDatabaseDynamic: string, namaDatabasMaster: string, em_id: string, tanggalAbsen: string, jamKeluar: string, lokasiAbsenOut: string): Promise<void> {
    try {
      // Get work schedule for overtime detection
      const workSchedule = await trx(`${namaDatabaseDynamic}.emp_shift`)
        .select('work_schedule.time_out as jam_keluar')
        .join(`${namaDatabasMaster}.work_schedule`, 'emp_shift.work_id', 'work_schedule.id')
        .where('emp_shift.em_id', em_id)
        .andWhereRaw('emp_shift.atten_date LIKE ?', [`%${tanggalAbsen}%`])
        .first();

      if (workSchedule && workSchedule.jam_keluar) {
        const jamKeluarJadwal = workSchedule.jam_keluar;
        
        if (jamKeluar > jamKeluarJadwal) {
          // Check overtime settings
          const overtimeSettings = await trx(`${namaDatabasMaster}.sysdata`)
            .whereIn('kode', ['041', '042'])
            .orderBy('kode');

          if (overtimeSettings.length > 0) {
            const overtimeEnabled = overtimeSettings[0]?.name === '1';
            
            if (overtimeEnabled) {
              // Generate overtime record
              await this.generateOvertimeRecord(trx, namaDatabaseDynamic, em_id, tanggalAbsen, jamKeluarJadwal, jamKeluar, lokasiAbsenOut);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in handleOvertimeLogic:', error);
    }
  }

  // Method untuk handle early leave logic
  private async handleEarlyLeaveLogic(trx: any, namaDatabaseDynamic: string, namaDatabasMaster: string, em_id: string, tanggalAbsen: string, jamKeluar: string): Promise<void> {
    try {
      // Get work schedule for early leave detection
      const workSchedule = await trx(`${namaDatabaseDynamic}.emp_shift`)
        .select('work_schedule.time_out as jam_keluar')
        .join(`${namaDatabasMaster}.work_schedule`, 'emp_shift.work_id', 'work_schedule.id')
        .where('emp_shift.em_id', em_id)
        .andWhereRaw('emp_shift.atten_date LIKE ?', [`%${tanggalAbsen}%`])
        .first();

      if (workSchedule && workSchedule.jam_keluar) {
        const jamKeluarJadwal = workSchedule.jam_keluar;
        
        if (jamKeluar < jamKeluarJadwal) {
          // Check early leave count
          const earlyLeaveCount = await trx(`${namaDatabaseDynamic}.attendance`)
            .join(`${namaDatabaseDynamic}.emp_shift`, 'emp_shift.atten_date', 'attendance.atten_date')
            .join(`${namaDatabasMaster}.work_schedule`, 'work_schedule.id', 'emp_shift.work_id')
            .where('attendance.em_id', em_id)
            .andWhereRaw('work_schedule.time_out > attendance.signout_time')
            .count('* as count');

          const earlyLeaveCountNum = parseInt(earlyLeaveCount[0].count);

          // Get system data for early leave handling
          const sysdata = await trx(`${namaDatabasMaster}.sysdata`)
            .whereIn('kode', ['S02', '030', '020', 'S10', 'S11'])
            .orderBy('kode');

          if (sysdata.length > 0) {
            const maxEarlyLeaveCount = parseInt(sysdata[0]?.name || '3');
            
            if (earlyLeaveCountNum >= maxEarlyLeaveCount) {
              // Generate warning letter for early leave
              await this.generateWarningLetter(trx, namaDatabasMaster, em_id, 'Absen Pulang Cepat', earlyLeaveCountNum);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in handleEarlyLeaveLogic:', error);
    }
  }

  // Method untuk generate warning letter
  private async generateWarningLetter(trx: any, namaDatabasMaster: string, em_id: string, title: string, count: number): Promise<void> {
    try {
      // Get employee data
      const employee = await trx('employee')
        .where('em_id', em_id)
        .first();

      if (!employee) return;

      // Generate warning letter number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const baseNumber = `SP${year}${month}`;

      // Get last warning letter number
      const lastWarningLetter = await trx(`${namaDatabasMaster}.employee_letter`)
        .where('nomor', 'LIKE', `${baseNumber}%`)
        .orderBy('id', 'desc')
        .first();

      let nomorSp = baseNumber;
      if (lastWarningLetter) {
        const lastNumber = parseInt(lastWarningLetter.nomor.substring(9, 14)) + 1;
        const numberStr = String(lastNumber).padStart(4, '0');
        nomorSp = baseNumber + numberStr;
      } else {
        nomorSp = baseNumber + '0001';
      }

      // Insert warning letter
      const warningLetterData = {
        nomor: nomorSp,
        tgl_surat: getDateNow(),
        em_id: em_id,
        letter_id: 'SP001', // Default letter ID
        eff_date: getDateNow(),
        upload_file: '',
        status: 'Pending',
        approve_status: 'Pending',
        title: title,
        alasan: `${title} ${count}x`,
        exp_date: getDateNow(), // Set expiration date
      };

      await trx(`${namaDatabasMaster}.employee_letter`).insert(warningLetterData);

      console.log(`✅ Warning letter generated: ${nomorSp}`);
    } catch (error) {
      console.error('❌ Error in generateWarningLetter:', error);
    }
  }

  // Method untuk generate overtime record
  private async generateOvertimeRecord(trx: any, namaDatabaseDynamic: string, em_id: string, tanggalAbsen: string, jamMulai: string, jamSelesai: string, lokasi: string): Promise<void> {
    try {
      // Get employee data
      const employee = await trx('employee')
        .where('em_id', em_id)
        .first();

      if (!employee) return;

      // Generate overtime number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const baseNumber = `LB${year}${month}`;

      // Get last overtime number
      const lastOvertime = await trx(`${namaDatabaseDynamic}.emp_labor`)
        .where('nomor_ajuan', 'LIKE', `${baseNumber}%`)
        .orderBy('id', 'desc')
        .first();

      let nomorLb = baseNumber;
      if (lastOvertime) {
        const lastNumber = parseInt(lastOvertime.nomor_ajuan.substring(8, 12)) + 1;
        const numberStr = String(lastNumber).padStart(4, '0');
        nomorLb = baseNumber + numberStr;
      } else {
        nomorLb = baseNumber + '0001';
      }

      // Calculate overtime duration
      const startTime = new Date(`${tanggalAbsen}T${jamMulai}`);
      const endTime = new Date(`${tanggalAbsen}T${jamSelesai}`);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Insert overtime record
      const overtimeData = {
        nomor_ajuan: nomorLb,
        em_id: em_id,
        branch_id: employee.branch_id,
        typeid: 1, // Default type
        dari_jam: jamMulai,
        sampai_jam: jamSelesai,
        atten_date: tanggalAbsen,
        alasan: 'Lembur otomatis',
        status: 'Pending',
        approve_status: 'Pending',
        durasi: durationMinutes,
        lokasi: lokasi,
      };

      await trx(`${namaDatabaseDynamic}.emp_labor`).insert(overtimeData);

      console.log(`✅ Overtime record generated: ${nomorLb}`);
    } catch (error) {
      console.error('❌ Error in generateOvertimeRecord:', error);
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
        signin_time: dto.signin_time || '00:00:00',
        signout_time: dto.signout_time || '00:00:00',
        place_in: dto.place_in || '',
        place_out: dto.place_out || '',
        signin_longlat: dto.signin_longlat || '',
        signout_longlat: dto.signout_longlat || '',
        signin_pict: dto.signin_pict || '',
        signout_pict: dto.signout_pict || '',
        signin_note: dto.signin_note || '',
        signout_note: dto.signout_note || '',
        signin_addr: dto.signin_addr || '',
        signout_addr: dto.signout_addr || '',
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
