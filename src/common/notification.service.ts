import { Injectable, Logger } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { DbService } from '../config/database.service';
import {
  formatDbName,
  getDateNow,
  databaseMaster,
} from './utils';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly fcmService: FcmService,
    private readonly dbService: DbService,
  ) {}

  /**
   * Insert notifikasi ke database dan kirim FCM
   */
  async insertNotification(
    emIds: string,
    title: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
    namaPengajuan: string,
    databasePeriode: string,
    databaseMasterName: string,
  ): Promise<void> {
    this.logger.log(`Masuk ke fungsi notifikasi ${databasePeriode}`);
    this.logger.log(`emIds: ${emIds}`);

    const listData = emIds.toString().split(',').filter(id => id.trim());
    const knex = this.dbService.getConnection(databaseMasterName);

    try {
      const trx = await knex.transaction();

      for (const emId of listData) {
        if (emId.trim()) {
          this.logger.log(`Memproses em_id: ${emId}`);

          const employee = await trx('employee')
            .where('em_id', emId.trim())
            .first();

          if (!employee) {
            this.logger.warn(`Employee dengan ID ${emId} tidak ditemukan.`);
            continue;
          }

          const deskripsi = `${namaPengajuan} mengajukan ${
            url === 'TugasLuar' ? 'Tugas Luar' : url
          } dengan nomor ${nomorAjuan}`;

          const insertData = {
            em_id: employee.em_id,
            title: title,
            deskripsi: deskripsi,
            url: url,
            atten_date: knex.raw('CURDATE()'),
            jam: knex.raw('CURTIME()'),
            status: 2,
            view: 0,
            em_id_pengajuan: emIdPengajuan,
            idx: idx,
          };

          await trx(`${databasePeriode}.notifikasi`).insert(insertData);

          // Kirim notifikasi FCM
          await this.fcmService.sendApprovalNotificationWithNumber(
            employee.token_notif,
            title,
            deskripsi,
            url,
            emIdPengajuan,
            idx,
            nomorAjuan,
          );
        }
      }

      await trx.commit();
      this.logger.log('Transaction completed successfully!');
    } catch (error) {
      this.logger.error('Error occurred:', error);
      throw error;
    }
  }

  /**
   * Insert notifikasi approval
   */
  async insertApprovalNotification(
    emIds: string,
    title: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
    namaPengajuan: string,
    databasePeriode: string,
    databaseMasterName: string,
  ): Promise<void> {
    this.logger.log(`Masuk ke fungsi notifikasi approval ${databasePeriode}`);
    this.logger.log(`emIds: ${emIds}`);

    const listData = emIds.toString().split(',').filter(id => id.trim());
    const knex = this.dbService.getConnection(databaseMasterName);

    try {
      const trx = await knex.transaction();

      for (const emId of listData) {
        if (emId.trim()) {
          this.logger.log(`Memproses em_id: ${emId}`);

          const employee = await trx('employee')
            .where('em_id', emId.trim())
            .first();

          if (!employee) {
            this.logger.warn(`Employee dengan ID ${emId} tidak ditemukan.`);
            continue;
          }

          const deskripsi = `${employee.full_name} mengajukan ${
            url === 'TugasLuar' ? 'Tugas Luar' : url
          } dengan nomor ${nomorAjuan}`;

          const insertData = {
            em_id: employee.em_id,
            title: title,
            deskripsi: deskripsi,
            url: url,
            atten_date: knex.raw('CURDATE()'),
            jam: knex.raw('CURTIME()'),
            status: 2,
            view: 0,
            em_id_pengajuan: emIdPengajuan,
            idx: idx,
          };

          await trx(`${databasePeriode}.notifikasi`).insert(insertData);

          // Kirim notifikasi FCM
          await this.fcmService.sendApprovalNotificationWithNumber(
            employee.token_notif,
            title,
            deskripsi,
            url,
            emIdPengajuan,
            idx,
            nomorAjuan,
          );
        }
      }

      await trx.commit();
      this.logger.log('Transaction completed successfully!');
    } catch (error) {
      this.logger.error('Error occurred:', error);
      throw error;
    }
  }

  /**
   * Insert notifikasi global
   */
  async insertGlobalNotification(
    emIds: string,
    title: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
    namaPengajuan: string,
    databasePeriode: string,
    databaseMasterName: string,
    description: string,
  ): Promise<void> {
    this.logger.log(`Initializing global notification process ${databasePeriode}`);
    const knex = this.dbService.getConnection(databaseMasterName);
    const listData = emIds.toString().split(',').filter(id => id.trim());

    try {
      const trx = await knex.transaction();

      const employeeQueries = listData.map(emId =>
        trx('employee').where('em_id', emId.trim()).first()
      );

      const employees = await Promise.all(employeeQueries);
      const insertQueries = [];

      for (const employee of employees) {
        if (employee) {
          const insertData = {
            em_id: employee.em_id,
            title: title,
            deskripsi: description,
            url: url,
            atten_date: knex.raw('CURDATE()'),
            jam: knex.raw('CURTIME()'),
            status: 2,
            view: 0,
            em_id_pengajuan: emIdPengajuan,
          };

          insertQueries.push(
            trx(`${databasePeriode}.notifikasi`).insert(insertData)
          );

          // Kirim notifikasi FCM global
          await this.fcmService.sendGlobalNotification(
            employee.token_notif,
            title,
            description,
            url,
            emIdPengajuan,
            idx,
            nomorAjuan,
          );
        }
      }

      await Promise.all(insertQueries);
      await trx.commit();
      this.logger.log('Global notification transaction completed successfully!');
    } catch (error) {
      this.logger.error('Error during global notification transaction:', error);
      throw error;
    }
  }

  /**
   * Insert notifikasi absensi
   */
  async insertAttendanceNotification(
    emIds: string,
    title: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
    namaPengajuan: string,
    databasePeriode: string,
    databaseMasterName: string,
  ): Promise<void> {
    const knex = this.dbService.getConnection(databaseMasterName);

    try {
      const trx = await knex.transaction();

      this.logger.log('Mulai transaksi untuk notifikasi absensi');

      // Mendapatkan data pegawai yang mengajukan
      const employeeData = await trx('employee')
        .where('em_id', emIdPengajuan)
        .first();

      if (!employeeData) {
        throw new Error('Data pegawai pengajuan tidak ditemukan');
      }

      const listData = emIds.toString().split(',').filter(id => id.trim());

      for (const emId of listData) {
        // Mendapatkan data karyawan yang akan menerima notifikasi
        const receiver = await trx('employee')
          .where('em_id', emId.trim())
          .first();

        if (!receiver) {
          this.logger.warn(`Data pegawai dengan em_id ${emId} tidak ditemukan`);
          continue;
        }

        let deskripsi = `${employeeData.full_name} `;

        if (url === 'terlambat') {
          deskripsi += 'absen terlambat';
        } else {
          deskripsi += 'absen pulang cepat';
        }

        const insertData = {
          em_id: receiver.em_id,
          title: title,
          deskripsi: deskripsi,
          url: url,
          atten_date: knex.raw('CURDATE()'),
          jam: knex.raw('CURTIME()'),
          status: 2,
          view: 0,
          em_id_pengajuan: emIdPengajuan,
        };

        await trx(`${databasePeriode}.notifikasi`).insert(insertData);

        // Kirim notifikasi FCM absensi
        await this.fcmService.sendAttendanceNotification(
          receiver.token_notif,
          title,
          deskripsi,
          url,
          emIdPengajuan,
          idx,
        );
      }

      await trx.commit();
      this.logger.log('Transaksi notifikasi absensi berhasil disimpan!');
    } catch (error) {
      this.logger.error('Gagal menyimpan notifikasi absensi:', error.message);
      throw error;
    }
  }

  /**
   * Insert notifikasi absensi dengan surat peringatan
   */
  async insertAttendanceWarningNotification(
    emIds: string,
    title: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
    namaPengajuan: string,
    databasePeriode: string,
    databaseMasterName: string,
    nameSp: string,
  ): Promise<void> {
    this.logger.log(`database master: ${databaseMasterName}`);
    this.logger.log(`database periode: ${databasePeriode}`);

    const listData = emIds.toString().split(',').filter(Boolean);
    this.logger.log(`Processing ${listData.length} employees`);
    
    const knex = this.dbService.getConnection(databaseMasterName);

    try {
      const trx = await knex.transaction();

      for (const emId of listData) {
        const employee = await trx('employee')
          .where('em_id', emId.trim())
          .first();

        if (!employee) {
          this.logger.warn(`Employee dengan ID ${emId} tidak ditemukan`);
          continue;
        }

        const salutation = employee.em_gender === 'PRIA' ? 'Bapak' : 
                          employee.em_gender === 'Wanita' ? 'Ibu' : '';

        let deskripsi = `${nameSp} ${namaPengajuan} dengan nomor ${nomorAjuan}`;

        if (url === 'terlambat') {
          deskripsi = `Hi ${employee.full_name}, karyawan dengan ${namaPengajuan} akan diberikan surat peringatan Absen Datang terlambat.`;
        } else if (url === 'tidak_masuk_kerja') {
          deskripsi = `Hi ${employee.full_name}, karyawan dengan ${namaPengajuan} akan diberikan surat peringatan tidak masuk kerja.`;
        }

        const insertData = {
          em_id: employee.em_id,
          title: title,
          deskripsi: deskripsi,
          url: url,
          atten_date: knex.raw('CURDATE()'),
          jam: knex.raw('CURTIME()'),
          status: 2,
          view: 0,
          em_id_pengajuan: emIdPengajuan,
        };

        await trx(`${databasePeriode}.notifikasi`).insert(insertData);

        // Kirim notifikasi FCM absensi warning
        await this.fcmService.sendAttendanceWarningNotification(
          employee.token_notif,
          title,
          deskripsi,
          url,
          emIdPengajuan,
          idx,
        );
      }

      await trx.commit();
      this.logger.log('Attendance warning notification transaction completed successfully!');
    } catch (error) {
      this.logger.error('Error during attendance warning notification processing:', error);
      throw error;
    }
  }
} 