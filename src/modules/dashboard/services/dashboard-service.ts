import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import {
  formatDbName,
  getDateNow,
  convertDaysToYMD,
  databaseMaster,
  formatDbNameNow,
} from 'src/common/utils';

interface MenuItem {
  id: number;
  nama: string;
  url: string;
  gambar: string;
  status: number;
}

interface ModulMenu {
  index: number;
  nama_modul: string;
  status: boolean;
  menu: {
    id: number;
    nama: string;
    url: string;
    gambar: string | null;
  }[];
}

interface SysData {
  name: string;
}

interface Employee {
  places: string;
  dep_id: string;
}

interface PlaceCoordinate {
  // sesuaikan properti sesuai tabel places_coordinate
  ID: number;
  trx: string;
  // tambahkan properti lainnya kalau perlu
}

interface Waktukerja {
  // sesuaikan properti sesuai tabel places_coordinate
  ID: number;
  trx: string;
  // tambahkan properti lainnya kalau perlu
}

interface EmployeeDetailResult {
  em_id: string;
  dep_id: string;
  tipe_absen: string;
  lama_bekerja: string;
  sisa_kontrak: string;
  em_status: string;
  tanggal_berakhir_kontrak: string;
  [key: string]: any;
}
interface EmployeeHistoryResult {
  description: string;
  end_date: string;
  [key: string]: any;
}
interface DepartmentResult {
  tipe_absen: string;
  [key: string]: any;
}

@Injectable()
export class DashboardService {
  constructor(private readonly dbService: DbService) {}

  async index(dto: {
    tenant: string;
    emId: string;
    branchId: string;
  }): Promise<any> {
    console.log('Masuk function employee/detail');
    const date = getDateNow();
    const tenant = dto.tenant;
    const emId = dto.emId;
    const databasePerode = formatDbName(date, tenant);
    const databasePeriode = formatDbNameNow(dto.tenant);
    const database = databaseMaster(dto.tenant);
    const dateNow = getDateNow();

    const menuDashboardUser = `
   SELECT * FROM menu_dashboard_user JOIN menu_dashboard ON menu_dashboard.id = menu_dashboard_user.menu_id  WHERE menu_dashboard_user.em_id='${emId}'
  `;
    const defaultMenuQuery = `
  SELECT * FROM menu_dashboard'
  `;
    const menuDashboardUserUtama = `SELECT * FROM menu_dashboard_utama_user JOIN menu_dashboard_utama ON menu_dashboard_utama.id = menu_dashboard_utama_user.menu_id  WHERE menu_dashboard_utama_user.em_id='${emId}'`;
    const defaultMenuQueryUtama = `
 SELECT * FROM menu_dashboard_utama'
 `;
    const queryWaktuKerja = `SELECT work_schedule.time_in,work_schedule.time_out FROM ${databasePeriode}.emp_shift JOIN .work_schedule ON emp_shift.work_id=work_schedule.id AND atten_date='${dateNow}' AND em_id='${emId}'`;
    const queryUlta = `SELECT em_id,full_name, job_title, em_birthday, em_mobile, em_image FROM employee WHERE DATE_FORMAT(em_birthday, '%m')=DATE_FORMAT('${dateNow}', '%m') AND employee.status='ACTIVE' ORDER BY DATE_FORMAT(em_birthday, "%d") ASC`;
    const queryPkwt = `
    SELECT CURDATE(), TBL.em_id, ADDDATE(TBL.end_date, INTERVAL - 60 DAY),
    DATEDIFF(TBL.end_date, CURDATE()) AS sisa_kontrak, e.full_name, e.em_image, TBL.em_id, TBL.description, 
    TBL.begin_date, TBL.end_date, TBL.remark, e.status  
    FROM (SELECT MAX(h.nokey) AS nokey, h.em_id, MAX(h.begin_date) AS begin_date, 
    MAX(h.end_date) AS end_date, MAX(h.description) AS description, MAX(h.remark) AS remark    
    FROM employee_history h WHERE h.status = 1 GROUP BY h.em_id) TBL 
    JOIN employee e ON e.em_id = TBL.em_id 
    WHERE ADDDATE(TBL.end_date, INTERVAL - 60 DAY) <= CURDATE()  AND DATEDIFF(TBL.end_date, CURDATE())>0
    AND e.status = 'ACTIVE' AND e.em_status != 'PERMANENT' ORDER BY TBL.end_date
    `;
    const sysdataQuery = `SELECT name,kode,id FROM sysdata`;
    const queryNotice = `SELECT * FROM notice`;

    const knex = this.dbService.getConnection(tenant);
    try {
      //employee
      const trx = await knex.transaction();
      // Get menu keja
      const waktuKerja = (await trx.raw(queryWaktuKerja)) as
        | { rows?: Waktukerja[] }
        | Waktukerja[][];

      const waktuKerjaResult: Waktukerja[] = Array.isArray(waktuKerja)
        ? waktuKerja[0]
        : (waktuKerja.rows ?? []);
      //------------------------------------------------------------------
      // Ulang Tahun
      const ulangTahun = (await trx.raw(queryUlta)) as
        | { rows?: Waktukerja[] }
        | Waktukerja[][];

      const ulangTahunResult: Waktukerja[] = Array.isArray(ulangTahun)
        ? ulangTahun[0]
        : (ulangTahun.rows ?? []);
      //-------------------------------------------------------------------

      // Ulang Tahun
      const pkwt = (await trx.raw(queryPkwt)) as
        | { rows?: Waktukerja[] }
        | Waktukerja[][];

      const pkwtResult: Waktukerja[] = Array.isArray(pkwt)
        ? pkwt[0]
        : (pkwt.rows ?? []);
      //-------------------------------------------------------------------

      // Ulang Tahun
      const sysdata = (await trx.raw(sysdataQuery)) as
        | { rows?: Waktukerja[] }
        | Waktukerja[][];

      const sysdataResult: Waktukerja[] = Array.isArray(sysdata)
        ? sysdata[0]
        : (sysdata.rows ?? []);
      //-------------------------------------------------------------------

      // Ulang Tahun
      const notice = (await trx.raw(queryNotice)) as
        | { rows?: Waktukerja[] }
        | Waktukerja[][];

      const noticeResult: Waktukerja[] = Array.isArray(notice)
        ? notice[0]
        : (notice.rows ?? []);
      //-------------------------------------------------------------------

      // Get menu dashboard berdasarkan user
      const rawMenuDashboard = (await trx.raw(menuDashboardUser)) as
        | { rows?: MenuItem[] }
        | MenuItem[][];

      let resultMenuDashboard: MenuItem[] = Array.isArray(rawMenuDashboard)
        ? rawMenuDashboard[0]
        : (rawMenuDashboard.rows ?? []);

      // Jika hasilnya kosong, ambil dari default menu
      if (resultMenuDashboard.length === 0) {
        const rawDefaultMenu = (await trx.raw(defaultMenuQuery)) as
          | { rows?: MenuItem[] }
          | MenuItem[][];

        resultMenuDashboard = Array.isArray(rawDefaultMenu)
          ? rawDefaultMenu[0]
          : (rawDefaultMenu.rows ?? []);
      }
      // 3. Definisikan modul statis
      const modulStatic = [
        { status: 0, nama_modul: 'Menu Utama' },
        { status: 1, nama_modul: 'Payroll' },
      ];

      const finalData: ModulMenu[] = modulStatic.map((modul, idx) => {
        const filteredMenu = resultMenuDashboard
          .filter((item) => item.status === modul.status)
          .map((item) => ({
            id: item.id,
            nama: item.nama,
            url: item.url,
            gambar: item.gambar,
          }));

        return {
          index: idx,
          nama_modul: modul.nama_modul,
          status: false,
          menu: filteredMenu,
        };
      });
      //-------------------------------------------------------------------
      // Get menu dashboard berdasarkan utama
      const rawMenuDashboardUtama = (await trx.raw(menuDashboardUserUtama)) as
        | { rows?: MenuItem[] }
        | MenuItem[][];

      let resultMenuDashboardUtama: MenuItem[] = Array.isArray(
        rawMenuDashboardUtama,
      )
        ? rawMenuDashboardUtama[0]
        : (rawMenuDashboardUtama.rows ?? []);

      // Jika hasilnya kosong, ambil dari default menu
      if (resultMenuDashboardUtama.length === 0) {
        const rawDefaultMenuUtama = (await trx.raw(defaultMenuQueryUtama)) as
          | { rows?: MenuItem[] }
          | MenuItem[][];

        resultMenuDashboardUtama = Array.isArray(rawDefaultMenuUtama)
          ? rawDefaultMenuUtama[0]
          : (rawDefaultMenuUtama.rows ?? []);
      }

      //-------------------------------------------------------------------
      // place coordinate
      const sysDataRow = await trx<SysData>('sysdata')
        .select('name')
        .where('kode', '013')
        .first();

      const statusApprove =
        String(sysDataRow?.name) === '1' ? 'Approve' : 'Approve2';

      // ambil tugas luar dari emp_labor dan emp_leave
      const tugasLuarQuery = `
    SELECT nomor_ajuan FROM ${databasePerode}.emp_labor 
    WHERE atten_date = ? AND em_id = ? AND SUBSTRING(nomor_ajuan, 1, 2) = 'TL' AND status = ?
    UNION ALL
    SELECT nomor_ajuan FROM ${databasePerode}.emp_leave 
    WHERE date_selected LIKE ? AND em_id = ? AND SUBSTRING(nomor_ajuan, 1, 2) = 'DL' AND leave_status = ?
  `;

      const rawResult = (await trx.raw(tugasLuarQuery, [
        date,
        emId,
        statusApprove,
        `%${date}%`,
        emId,
        statusApprove,
      ])) as { rows?: { nomor_ajuan: string }[] } | { nomor_ajuan: string }[][];

      // Ambil rows-nya tergantung database client
      const tugasLuarRows: { nomor_ajuan: string }[] = Array.isArray(rawResult)
        ? rawResult[0]
        : (rawResult.rows ?? []);
      const employee = await trx<Employee>('employee')
        .select('places', 'dep_id')
        .where('em_id', dto.emId)
        .first();

      if (!employee) {
        throw new InternalServerErrorException('Employee tidak ditemukan');
      }

      const placesArray = employee.places.split(',');

      let coordinates: PlaceCoordinate[] = [];

      if (tugasLuarRows.length > 0) {
        const nomorAjuan = tugasLuarRows[0].nomor_ajuan;
        const kodeTrx = nomorAjuan.substring(0, 2);

        coordinates = await trx<PlaceCoordinate>('places_coordinate')
          .where('trx', kodeTrx)
          .orWhereIn('ID', placesArray);
      } else {
        coordinates = await trx<PlaceCoordinate>('places_coordinate').whereIn(
          'ID',
          placesArray,
        );
      }
      // ----------------------------------------------------------------------------------
      // Employee

      const currentDate = new Date();
      const query = `
        SELECT
          IFNULL((SELECT  IFNULL(work_schedule.time_in ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN ${database}.work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS jam_masuk,
          IFNULL((SELECT  IFNULL(work_schedule.time_in ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN ${database}.work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS time_in,
          IFNULL((SELECT  IFNULL(work_schedule.time_out ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN ${database}.work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS jam_keluar,
          IFNULL((SELECT  IFNULL(work_schedule.time_out ,'00:00:00') FROM ${databasePeriode}.emp_shift LEFT JOIN ${database}.work_schedule ON emp_shift.work_id=work_schedule.id WHERE emp_shift.em_id='${emId}' AND emp_shift.atten_date LIKE '%${dateNow}%') ,'00:00:00') AS time_out,
          a.tipe_absen,
          IFNULL(employee_history.description ,em_status) as em_status,
          a.dep_id,
          IFNULL(MAX(employee_history.end_date) ,'')AS tanggal_berakhir_kontrak,
          IFNULL(DATEDIFF(MAX(employee_history.end_date), CURDATE()),'0') AS sisa_kontrak,
          IFNULL(DATEDIFF(CURDATE(),a.em_joining_date),'0') AS lama_bekerja,
          em_bpjs_kesehatan AS nomor_bpjs_kesehatan,em_bpjs_tenagakerja AS nomor_bpjs_tenagakerja,
          (SELECT beginday_payroll FROM payment_schedule WHERE is_default='Y' LIMIT 1) AS begin_payroll,
          (SELECT NAME FROM sysdata WHERE id='18') AS time_attendance,
          (SELECT NAME FROM sysdata WHERE kode='012') AS is_view_tracking,
          (SELECT NAME FROM sysdata WHERE id='006') AS interval_tracking,
          (SELECT NAME FROM sysdata WHERE kode='021') AS back_date,
          (SELECT NAME FROM sysdata WHERE kode='001') AS periode_awal,
          (SELECT NAME FROM sysdata WHERE kode='040') AS durasi_absen_masuk,
          (SELECT NAME FROM sysdata WHERE kode='041') AS durasi_absen_keluar,
          (SELECT NAME FROM sysdata WHERE kode= '038') AS tipe_alpha,
          a.em_tracking  AS is_tracking,
          CASE 
          WHEN (SELECT COUNT(*) FROM sysdata WHERE kode='046' AND name LIKE '%${emId}%') > 0 THEN 1
          ELSE 0
          END AS is_audit,
          branch_id,
          a.file_face,
          a.loan_limit,
          (SELECT endday_payroll FROM payment_schedule WHERE is_default='Y' LIMIT 1) AS end_payroll,
          em_control, em_controlaccess AS em_control_access,
          branch.name AS branch_name, a.em_id, full_name, em_email, des_id, dep_id, dep_group_id AS dep_group, em_mobile AS em_phone, em_birthday, em_blood_group, em_gender, em_image, em_joining_date, job_title AS posisi, em_hak_akses, last_login, a.status AS status_aktif, em_controlaccess AS em_control_access, b.name AS emp_jobTitle,c.name AS emp_departmen,em_att_working AS emp_att_working FROM employee a 
          LEFT JOIN employee_history ON a.em_id=employee_history.em_id LEFT JOIN designation b ON a.des_id=b.id 
          LEFT JOIN department c ON a.dep_id=c.id LEFT JOIN branch ON branch.id=a.branch_id WHERE a.em_id='${emId}'
          GROUP BY a.em_id
      `;

      const rawResults = (await trx.raw(query)) as
        | { rows?: EmployeeDetailResult[] }
        | EmployeeDetailResult[][];
      console.log(rawResults[0]);
      if (!Array.isArray(rawResults[0]) || rawResults[0].length === 0) {
        throw new NotFoundException('Employee not found');
      }
      const results: EmployeeDetailResult[] = Array.isArray(rawResults)
        ? rawResults[0]
        : (rawResults.rows ?? []);
      const queryHistory = `SELECT * FROM employee_history WHERE em_id='${emId}' ORDER BY id DESC`;
      const rawHistory = (await trx.raw(queryHistory)) as
        | { rows?: EmployeeHistoryResult[] }
        | EmployeeHistoryResult[][];
      const history: EmployeeHistoryResult[] = Array.isArray(rawHistory)
        ? rawHistory[0]
        : (rawHistory.rows ?? []);
      const rawDepartment = (await trx.raw(
        `SELECT * FROM department WHERE id='${results[0].dep_id}'`,
      )) as { rows?: DepartmentResult[] } | DepartmentResult[][];
      const department: DepartmentResult[] = Array.isArray(rawDepartment)
        ? rawDepartment[0]
        : (rawDepartment.rows ?? []);
      const getDaysDifference = (endDate: string) => {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) return 0;
        const diffInMs = end.getTime() - currentDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        return diffInDays + 1;
      };
      if (history.length > 0) {
        results[0].em_status = history[0].description;
        results[0].tanggal_berakhir_kontrak = history[0].end_date;
        const sisaKontrak = getDaysDifference(history[0].end_date);
        if (results[0].em_status == 'PERMANENT') {
          results[0].sisa_kontrak = '0';
          results[0].tanggal_berakhir_kontrak = '';
        } else {
          results[0].sisa_kontrak = sisaKontrak.toString();
        }
      }
      if (
        results[0].tipe_absen == '' ||
        results[0].tipe_absen == '0' ||
        results[0].tipe_absen == null ||
        results[0].tipe_absen == undefined
      ) {
        results[0].tipe_absen = department[0]?.tipe_absen;
      }
      const totalDays = parseInt(results[0].lama_bekerja);
      const result = convertDaysToYMD(totalDays);
      let formatLamaBekerja = '';
      if (result.tahun != 0) {
        formatLamaBekerja = `${result.tahun} Tahun ${result.bulan} Bulan ${result.hari} Hari`;
      } else {
        if (result.bulan != 0) {
          formatLamaBekerja = `${result.bulan} bulan ${result.hari} Hari`;
        } else {
          formatLamaBekerja = `${result.hari} Hari`;
        }
      }
      const totalDaysKontrak = parseInt(results[0].sisa_kontrak);
      const result1 = convertDaysToYMD(totalDaysKontrak);
      let formatSisaKontrak = '';
      if (result1.tahun != 0) {
        formatSisaKontrak = `${result1.tahun} Tahun ${result1.bulan} Bulan ${result1.hari} Hari`;
      } else {
        if (result1.bulan != 0) {
          formatSisaKontrak = `${result1.bulan} Bulan ${result1.hari} Hari`;
        } else {
          formatSisaKontrak = `${result1.hari} hr`;
        }
      }
      if (totalDaysKontrak == 0) {
        formatSisaKontrak = '';
      }
      results[0].sisa_kontrak_format = formatSisaKontrak;
      results[0].lama_bekerja_format = formatLamaBekerja;
      return {
        status: true,
        message: 'Success get employee detail',
        notice: noticeResult,
        employee_pkwt: pkwtResult,
        places: coordinates,
        sysdata: sysdataResult,
        employee: results[0],
        employee_ultah: ulangTahunResult,
        menu_utama: menuDashboardUserUtama,
        time: waktuKerjaResult,
        menus: menuDashboardUser,
      };

      await trx.commit();
      return finalData;
    } catch {
      // trx bisa undefined jika error sebelum assignment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (typeof trx !== 'undefined') await trx.rollback();
      throw new InternalServerErrorException('Terjadi kesalahan: ');
    }
  }
}
