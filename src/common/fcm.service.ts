import { Injectable, Logger } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';
import * as admin from 'firebase-admin';

interface NotificationData {
  route: string;
  em_id_pengajuan?: string;
  idx?: string;
  em_id_penerima?: string;
  em_id_pengirim?: string;
  em_image?: string;
  job_title?: string;
  full_name?: string;
}

interface NotificationMessage {
  data: { [key: string]: string };
  notification: {
    title: string;
    body: string;
  };
  token: string;
}

interface ChatNotificationData extends NotificationData {
  em_id_penerima: string;
  em_id_pengirim: string;
  em_image: string;
  job_title: string;
  full_name: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly firebaseConfig: FirebaseConfig;
  private readonly messaging: admin.messaging.Messaging;

  constructor() {
    this.firebaseConfig = FirebaseConfig.getInstance();
    this.messaging = this.firebaseConfig.getMessaging();
  }

  /**
   * Mengirim notifikasi web ke multiple tokens
   */
  async sendWebNotification(
    tokens: string,
    title: string,
    message: string,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const tokenArray = tokens.split(',').filter(token => token.trim());
      
      for (const token of tokenArray) {
        const notificationMessage: NotificationMessage = {
          data: {
            route: 'Pesan',
          },
          notification: {
            title: title,
            body: message,
          },
          token: token.trim(),
        };

        await this.messaging.send(notificationMessage);
      }

      this.logger.log(`Berhasil kirim notifikasi web ke ${tokenArray.length} token`);
      return {
        status: true,
        message: 'Berhasil kirim notifikasi web!',
      };
    } catch (error) {
      this.logger.error('Error sending web notification:', error);
      return {
        status: false,
        message: 'Gagal kirim notifikasi web!',
      };
    }
  }

  /**
   * Mengirim notifikasi approval
   */
  async sendApprovalNotification(
    token: string,
    title: string,
    message: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: url,
          em_id_pengajuan: emIdPengajuan,
          idx: idx,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi approval berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending approval notification:', error);
    }
  }

  /**
   * Mengirim notifikasi approval dengan nomor ajuan
   */
  async sendApprovalNotificationWithNumber(
    token: string,
    title: string,
    message: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: url,
          em_id_pengajuan: emIdPengajuan,
          idx: idx,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      this.logger.log('Sending notification:', notificationMessage);
      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi approval dengan nomor berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending approval notification with number:', error);
    }
  }

  /**
   * Mengirim notifikasi chat
   */
  async sendChatNotification(
    token: string,
    title: string,
    message: string,
    emIdPengirim: string,
    emIdPenerima: string,
    emImage: string,
    jobTitle: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi chat kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: 'pesan',
          em_id_penerima: emIdPenerima,
          em_id_pengirim: emIdPengirim,
          em_image: emImage,
          job_title: jobTitle,
          full_name: title,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi chat berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending chat notification:', error);
    }
  }

  /**
   * Mengirim notifikasi global
   */
  async sendGlobalNotification(
    token: string,
    title: string,
    message: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
    nomorAjuan: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi global kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: url,
          em_id_pengajuan: emIdPengajuan,
          idx: idx,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi global berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending global notification:', error);
    }
  }

  /**
   * Mengirim notifikasi absensi
   */
  async sendAttendanceNotification(
    token: string,
    title: string,
    message: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi absensi kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: url,
          em_id_pengajuan: emIdPengajuan,
          idx: idx,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi absensi berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending attendance notification:', error);
    }
  }

  /**
   * Mengirim notifikasi absensi dengan surat peringatan
   */
  async sendAttendanceWarningNotification(
    token: string,
    title: string,
    message: string,
    url: string,
    emIdPengajuan: string,
    idx: string,
  ): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        this.logger.warn('Token notifikasi absensi warning kosong');
        return;
      }

      const notificationMessage: NotificationMessage = {
        data: {
          route: url,
          em_id_pengajuan: '',
          idx: idx,
        },
        notification: {
          title: title,
          body: message,
        },
        token: token.trim(),
      };

      this.logger.log('Sending attendance warning notification:', notificationMessage);
      await this.messaging.send(notificationMessage);
      this.logger.log('Notifikasi absensi warning berhasil dikirim');
    } catch (error) {
      this.logger.error('Error sending attendance warning notification:', error);
    }
  }
} 