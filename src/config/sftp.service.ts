import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import SftpClient from 'ssh2-sftp-client';

@Injectable()
export class SftpService {
  private readonly logger = new Logger(SftpService.name);
  private sftp: SftpClient;

  constructor(private configService: ConfigService) {
    this.sftp = new SftpClient();
  }

  async connect(): Promise<void> {
    const host = this.configService.get<string>('sftp.host');
    const port = this.configService.get<number>('sftp.port');
    const username = this.configService.get<string>('sftp.username');
    const password = this.configService.get<string>('sftp.password');
    const privateKeyPath = this.configService.get<string>('sftp.privateKeyPath');

    let privateKey: Buffer | undefined;
    if (privateKeyPath) {
      try {
        privateKey = fs.readFileSync(privateKeyPath);
      } catch (err) {
        this.logger.error(`Failed to read private key file: ${privateKeyPath}`, err as Error);
        throw err;
      }
    }

    try {
      // Pastikan connect adalah fungsi sebelum dipanggil
      if (typeof this.sftp.connect === 'function') {
        await this.sftp.connect({
          host,
          port,
          username,
          password,
          privateKey,
        });
        this.logger.log('SFTP connected successfully');
      } else {
        throw new Error('SFTP client connect method is not a function');
      }
    } catch (err) {
      this.logger.error('Failed to connect to SFTP server', err as Error);
      throw err;
    }
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    try {
      if (typeof this.sftp.put === 'function') {
        await this.sftp.put(localPath, remotePath);
        this.logger.log(`Uploaded file from ${localPath} to ${remotePath}`);
      } else {
        throw new Error('SFTP client put method is not a function');
      }
    } catch (err) {
      this.logger.error(`Failed to upload file to ${remotePath}`, err as Error);
      throw err;
    }
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    try {
      if (typeof this.sftp.get === 'function') {
        await this.sftp.get(remotePath, localPath);
        this.logger.log(`Downloaded file from ${remotePath} to ${localPath}`);
      } else {
        throw new Error('SFTP client get method is not a function');
      }
    } catch (err) {
      this.logger.error(`Failed to download file from ${remotePath}`, err as Error);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (typeof this.sftp.end === 'function') {
        await this.sftp.end();
        this.logger.log('SFTP disconnected');
      } else {
        throw new Error('SFTP client end method is not a function');
      }
    } catch (err) {
      this.logger.error('Failed to disconnect SFTP client', err as Error);
      throw err;
    }
  }
}
