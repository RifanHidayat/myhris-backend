import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

interface PayslipListDto {
  database: string;
  em_id: string;
  tahun: string;
}

@Injectable()
export class PayslipListService {
  async slipGaji(dto: PayslipListDto): Promise<any> {
    const { database, em_id, tahun } = dto;
    const configDynamic = {
      multipleStatements: true,
      host: process.env.DB_HOST || 'localhost',
      user: 'pro',
      password: 'Siscom3519',
      database: `${database}_hrm`,
      connectionLimit: 1000,
      connectTimeout: 60 * 60 * 1000,
      acquireTimeout: 60 * 60 * 1000,
      timeout: 60 * 60 * 1000,
    };
    const mysql = require('mysql2/promise');
    const poolDynamic = mysql.createPool(configDynamic);
    const connection = await poolDynamic.getConnection();
    try {
      const [results] = await connection.query(`SELECT * FROM ${database}_hrm.emp_salary${tahun} WHERE em_id='${em_id}' AND payroll='Y' ORDER BY initial`);
      let list_pendapatan: any[] = [];
      let list_pemotongan: any[] = [];
      for (const el of results) {
        for (let i = 1; i <= 12; i++) {
          const index = i.toString().padStart(2, '0');
          if (el[`value${index}`] === '' || el[`value${index}`] == null) {
            el[`value${index}`] = 0;
          } else {
            const [salaryMobile] = await connection.query(`SELECT * FROM ${database}_hrm${tahun.toString().slice(-2)}${index}.emp_salary_mobile WHERE em_id='${em_id}'`);
            if (salaryMobile.length > 0) {
              el[`value${index}`] = this.decryptText(el[`value${index}`], '', '');
            } else {
              el[`value${index}`] = 0;
            }
          }
        }
        if (el.type === 'C') {
          list_pemotongan.push(el);
        } else {
          list_pendapatan.push(el);
        }
      }
      return {
        status: true,
        message: 'Berhasil ambil data!',
        data_pendapatan: list_pendapatan,
        data_pemotongan: list_pemotongan,
      };
    } catch (e) {
      throw new InternalServerErrorException('Gagal ambil data slip gaji');
    } finally {
      if (connection) connection.release();
    }
  }

  private decryptText(textToDecrypt: string, keyInput: string, ivInput: string): string {
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.from('1983759874219020', 'utf8');
    let key: Buffer;
    if (!keyInput) {
      key = Buffer.alloc(32);
    } else {
      key = Buffer.from(keyInput, 'utf8');
      if (key.length !== 32) {
        throw new Error(`Key length invalid: expected 32 bytes but got ${key.length}`);
      }
    }
    if (iv.length !== 16) {
      throw new Error('IV length invalid: expected 16 bytes but got ' + iv.length);
    }
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(textToDecrypt, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
