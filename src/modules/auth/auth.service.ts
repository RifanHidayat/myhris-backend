import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../../config/database.service';
import { LoginDto } from './dto/login.dto';
import { createHash } from 'crypto'; // built-in crypto
import { DatabaseRequestDto } from './dto/database-request.dto';

import type { Knex } from 'knex';

type DBUser = {
  id: number;
  em_email: string;
  em_password: string;
  full_name?: string;
  em_id?: string;
  branch_id?: number;
  token_notif?: string;
};

type PeraturanPerusahaanEmployee = {
  id: number;
  peraturan_perusahaan_id: number;
  em_id: string;
};

function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

interface DatabaseRow {
  dbname: string;
  email: string;
  name: string;
}

// function hasRows(obj: unknown): obj is { rows: DatabaseRow[] } {
//   return (
//     typeof obj === 'object' &&
//     obj !== null &&
//     Object.prototype.hasOwnProperty.call(obj, 'rows') &&
//     Array.isArray((obj as { [key: string]: unknown }).rows)
//   );
// }
function hasRows(obj: unknown): obj is { rows: DatabaseRow[] } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'rows' in obj &&
    Array.isArray((obj as { rows: unknown }).rows)
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
  ) {}

  async validateUser(
    emEmail: string,
    emPassword: string,
    tenant: string,
    tokenNotif: string = '',
  ): Promise<DBUser | null> {
    if (!tenant) throw new BadRequestException('Tenant harus diisi');

    try {
      const knex = this.dbService.getConnection(tenant);
      const passwordValid = sha1(emPassword);

      // Gunakan raw query dengan tipe DBUser[]
      const query = `
        SELECT
          branch.id AS branch_id,
          a.em_tracking AS is_tracking,
          file_face,
          (SELECT name FROM sysdata WHERE id = '006') AS interval_tracking,
          (SELECT name FROM sysdata WHERE kode = '012') AS is_view_tracking,
          (SELECT name FROM sysdata WHERE kode = '043') AS toleransi_pengembalian,
          (SELECT name FROM sysdata WHERE kode = '021') AS back_date,
          IFNULL(MAX(employee_history.end_date), '') AS tanggal_berakhir_kontrak,
          (SELECT beginday_payroll FROM payment_schedule WHERE is_default = 'Y' LIMIT 1) AS begin_payroll,
          (SELECT name FROM sysdata WHERE id = '18') AS time_attendance,
          (SELECT endday_payroll FROM payment_schedule WHERE is_default = 'Y' LIMIT 1) AS end_payroll,
          branch.name AS branch_name,
          a.em_id,
          full_name,
          em_email,
          des_id,
          dep_id,
          dep_group_id AS dep_group,
          em_mobile AS em_phone,
          em_birthday,
          em_blood_group,
          em_gender,
          em_image,
          em_joining_date,
          em_status,
          job_title AS posisi,
          em_hak_akses,
          last_login,
          a.status AS status_aktif,
          em_control,
          em_controlaccess AS em_control_access,
          b.name AS emp_jobTitle,
          c.name AS emp_departmen,
          em_att_working AS emp_att_working
        FROM employee a
        LEFT JOIN designation b ON a.des_id = b.id
        LEFT JOIN department c ON a.dep_id = c.id
        LEFT JOIN branch ON branch.id = a.branch_id
        LEFT JOIN employee_history ON a.em_id = employee_history.em_id
        WHERE a.em_email = ? AND a.em_password= ?
      `;
      const result = await knex.raw<DBUser[]>(query, [emEmail, passwordValid]);

      let user: DBUser | null = null;
      if ('rows' in result && Array.isArray(result.rows)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const row = result.rows[0];
        if (row && typeof row === 'object') {
          user = row as DBUser;
        }
      } else if (Array.isArray(result) && Array.isArray(result[0])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const row = result[0][0];
        if (row && typeof row === 'object') {
          user = row as DBUser;
        }
      }
      if (!user) return null;
      // cek peraturan perusahaan
      type PeraturanPerusahaan = {
        id: number;
        status_transaksi: string;
        tipe: string;
        status: string;
        branch_id: string;
        // tambahkan kolom lain sesuai tabel
      };
      const peraturanQuery = `
        SELECT * FROM peraturan_perusahaan 
        WHERE status_transaksi = '1' 
          AND tipe = 'utama' 
          AND status = '1'
          AND (
            branch_id LIKE '%${user.branch_id?.toString().padStart(2, '0')}%' 
            OR branch_id LIKE '%${user.branch_id}%'
          )
        ORDER BY id DESC 
        LIMIT 1
      `;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const peraturanResult =
        await knex.raw<PeraturanPerusahaan[]>(peraturanQuery);

      let rows: PeraturanPerusahaan[] = [];
      if ('rows' in peraturanResult && Array.isArray(peraturanResult.rows)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rows = peraturanResult.rows as PeraturanPerusahaan[];
      } else if (
        Array.isArray(peraturanResult) &&
        Array.isArray(peraturanResult[0])
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rows = peraturanResult[0] as PeraturanPerusahaan[];
      }

      if (rows.length === 0) {
        // Update token notif jika tidak ada peraturan perusahaan
        await knex('employee')
          .where('em_email', emEmail)
          .update({ token_notif: tokenNotif });
      } else {
        // Cek peraturan perusahaan employee
        const peraturanLoginQuery = `
          SELECT * FROM peraturan_perusahaan_employee 
          WHERE em_id = ? 
          AND peraturan_perusahaan_id = ? 
          ORDER BY id DESC 
          LIMIT 1
        `;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const peraturanLoginResult = await knex.raw<
          PeraturanPerusahaanEmployee[]
        >(peraturanLoginQuery, [user.em_id, rows[0].id]);

        let peraturanLoginData: PeraturanPerusahaanEmployee[] = [];

        if (
          'rows' in peraturanLoginResult &&
          Array.isArray(peraturanLoginResult.rows)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          peraturanLoginData =
            peraturanLoginResult.rows as PeraturanPerusahaanEmployee[];
        } else if (
          Array.isArray(peraturanLoginResult) &&
          Array.isArray(peraturanLoginResult[0])
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          peraturanLoginData =
            peraturanLoginResult[0] as PeraturanPerusahaanEmployee[];
        }

        if (peraturanLoginData.length === 0) {
          // Insert new record if not exists
          await knex('peraturan_perusahaan_employee').insert({
            peraturan_perusahaan_id: rows[0].id,
            em_id: user.em_id,
          });
        }

        // Update token notif
        await knex('employee')
          .where('em_email', emEmail)
          .update({ token_notif: tokenNotif });
      }

      console.log('Proses peraturan perusahaan selesai');
      return user;
    } catch (error) {
      console.error('Error in validateUser:', error);
      throw new InternalServerErrorException('Gagal validasi user');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password, tenant, tokenNotif = '' } = loginDto;

    try {
      const user = await this.validateUser(email, password, tenant, tokenNotif);

      if (!user) {
        throw new UnauthorizedException('Email atau password salah');
      }

      if (user.em_id == null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        throw new UnauthorizedException('Email atau password salah');
      }

      const payload = {
        sub: user.id,
        email: user.em_email,
        tenant,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        token_type: 'Bearer',
        access_token,
        user, // seluruh row user dari database
      };
    } catch (err) {
      console.error('Error in login:', err);

      if (
        err instanceof UnauthorizedException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Gagal login');
    }
  }

  async database(
    dto: DatabaseRequestDto,
  ): Promise<{ status: boolean; message: string; data: DatabaseRow[] }> {
    const { email } = dto;
    const knex = this.dbService.getSisAdminConnection();
    let trx: Knex.Transaction | undefined;
    try {
      trx = await knex.transaction();
      const query = `SELECT DISTINCT co.dbname,ess.email,CONCAT(c.name,' (',co.dbname,')') as name FROM cust_order co  JOIN company c ON c.id=co.company_id  JOIN ess ON ess.dbname=co.dbname WHERE ess.email=? AND ess.aktif='Y'`;
      const result: unknown = await trx.raw(query, [email]);
      await trx.commit();
      let rows: DatabaseRow[] = [];
      if (hasRows(result)) {
        rows = result.rows;
      } else if (Array.isArray(result) && Array.isArray(result[0])) {
        rows = result[0] as DatabaseRow[];
      }
      if (!rows || rows.length === 0) {
        return {
          status: false,
          message: 'User Ess tidak tersedia',
          data: [],
        };
      } else {
        return {
          status: true,
          message: 'Berhasil ambil data',
          data: rows,
        };
      }
    } catch (error) {
      console.error('Error in database:', error);
      if (trx) await trx.rollback();
      return {
        status: false,
        message: 'terjadi kesalahan ',
        data: [],
      };
    }
  }
}
