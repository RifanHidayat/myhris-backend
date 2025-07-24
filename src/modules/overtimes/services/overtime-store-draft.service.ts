import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

interface OvertimeStoreDraftDto {
  database: string;
  em_id: string;
  atten_date: string;
  dari_jam: string;
  sampai_jam: string;
  leave_type?: string;
  typeid?: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  branch_id?: string;
  tasks: Array<{ task: string; level: number }>;
  em_delegation?: string;
  em_ids?: string;
}

@Injectable()
export class OvertimeStoreDraftService {
  async store(dto: OvertimeStoreDraftDto): Promise<any> {
    const model = require('../../../common/model');
    const utility = require('../../../common/utility');
    function isDateInRange(date, startDate, endDate) {
      return date >= startDate && date <= endDate;
    }
    const database = dto.database;
    const bodyValue = { ...dto };
    const tasks = dto.tasks;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const dateNow = `${year}-${month.toString().padStart(2, '0')}-${date} ${hours}:${minutes}:${seconds}`;
    bodyValue.tgl_ajuan = utility.dateNow4();
    bodyValue.created_on = dateNow;
    const array = dto.atten_date.split('-');
    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan;
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const script = `INSERT INTO ${namaDatabaseDynamic}.emp_labor SET ?`;
    const databaseMaster = `${database}_hrm`;
    let nomorLb = `LB20${convertYear}${convertBulan}`;
    let transaksion = '';
    const connection = await model.createConnection1(databaseMaster);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      const [data] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
              WHERE em_id='${dto.em_id}' 
              AND (date_selected LIKE '%${dto.atten_date}%')  
              AND  status_transaksi=1 
               AND leave_status IN ('Pending','Approve','Approve2')`,
      );
      for (var i = 0; i < data.length; i++) {
        if (data.length > 0) {
          if (data[0].leave_type == 'HALFDAY') {
            var timeParam1 = new Date(`${dto.atten_date}T${dto.dari_jam}`);
            var timeParam2 = new Date(`${dto.atten_date}T${dto.sampai_jam}`);
            /// jika suda ada data
            var time1 = new Date(`${data[i].atten_date}T${data[i].time_plan}`);
            var time2 = new Date(
              `${data[i].atten_date}T${data[i].time_plan_to}`,
            );
            if (time1 > time2) {
              time2.setDate(time2.getDate() + 1);
            }

            if (timeParam1 > timeParam2) {
              timeParam2.setDate(time2.getDate() + 1);
            }

            transaksion = 'Izin';

            if (isDateInRange(timeParam1, time1, time2)) {
              await conn.commit();
              return {
                status: false,
                message: `Kamu telah melakaukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`,
              };
            }
          } else if (
            dto.leave_type == 'FULLDAY' ||
            dto.leave_type == 'FULL DAY'
          ) {
            if (data[i].ajuan == '1' || data[i].ajuan == 1) {
              await conn.commit();
              return {
                status: false,
                message: `Kamu telah melakaukan pengajuan Cuti  pada tanggal ${dto.atten_date}  dengan status ${data[0].leave_status}`,
              };
            }

            if (data[i].ajuan == '2' || data[i].ajuan == 2) {
              await conn.commit();
              return {
                status: false,
                message: `Kamu telah melakaukan pengajuan Sakit  pada tanggal ${dto.atten_date}  dengan status ${data[0].leave_status}`,
              };
            }
          }
        }
      }
      const [cekLembur] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${dto.em_id}' AND atten_date='${dto.atten_date}' AND status_transaksi=1 AND ( ajuan='1' OR ajuan='2') AND status IN ('Pending','Approve','Approve2')`,
      );
      for (var i = 0; i < cekLembur.length; i++) {
        if (cekLembur.length > 0) {
          var timeParam1 = new Date(`${dto.atten_date}T${dto.dari_jam}`);
          var timeParam2 = new Date(`${dto.atten_date}T${dto.sampai_jam}`);

          /// jika suda ada data
          var time1 = new Date(
            `${cekLembur[i].atten_date}T${cekLembur[i].dari_jam}`,
          );
          var time2 = new Date(
            `${cekLembur[i].atten_date}T${cekLembur[i].sampai_jam}`,
          );

          if (time1 > time2) {
            time2.setDate(time2.getDate() + 1);
          }

          if (timeParam1 > timeParam2) {
            timeParam2.setDate(time2.getDate() + 1);
          }

          if (cekLembur[i].ajuan == '2') {
            transaksion = 'Tugas Luar';
          }

          if (cekLembur[i].ajuan == '1') {
            transaksion = 'Lembur';
          }

          if (isDateInRange(timeParam1, time1, time2)) {
            await conn.commit();
            return {
              status: false,
              message: `Kamu telah melakukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`,
              data: [],
            };
          } else {
            if (isDateInRange(timeParam2, time1, time2)) {
              await conn.commit();
              return {
                status: false,
                message: `Kamu telah melakukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`,
                data: [],
              };
            }
          }
        }
      }
      const [cekNoAjuan] = await conn.query(
        `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan LIKE '%LB%' ORDER BY id DESC LIMIT 1`,
      );
      if (cekNoAjuan.length > 0) {
        var text = cekNoAjuan[0]['nomor_ajuan'];
        var nomor = parseInt(text.substring(8, 13)) + 1;
        var nomorStr = String(nomor).padStart(4, '0');
        nomorLb = nomorLb + nomorStr;
      } else {
        var nomor = 1;
        var nomorStr = String(nomor).padStart(4, '0');
        nomorLb = nomorLb + nomorStr;
      }
      bodyValue.nomor_ajuan = nomorLb;
      await conn.query(script, [bodyValue]);
      const [cekDinilai] = await conn.query(
        `SELECT dinilai FROM overtime where id = '${dto.typeid}'`,
      );

      console.log('ini cek nilai ', cekDinilai);
      const [updateEmpLabor] = await conn.query(
        `UPDATE ${database}_hrm.overtime SET pakai='Y' WHERE id='${dto.typeid}' `,
        [bodyValue],
      );
      const [transaksi] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan ='${bodyValue.nomor_ajuan}'`,
      );
      const [sysData] = await conn.query(
        'SELECT name FROM sysdata WHERE KODE IN (024)',
      );
      const [user] = await conn.query(
        `SELECT * FROM  ${databaseMaster}.employee WHERE em_id='${dto.em_id}'`,
      );
      bodyValue.branch_id = user[0].branch_id;
      console.log(tasks);
      for (var i = 0; i < tasks.length; i++) {
        let task = tasks[i]['task'];
        let level = tasks[i]['level'];
        const [insertTask] = await conn.query(
          `INSERT INTO ${namaDatabaseDynamic}.emp_labor_task (task,persentase,emp_labor_id,level) VALUES('${task}','0','${transaksi[0].id}',${level})`,
        );
      }

      console.log('kesni gak sih');

      if (cekDinilai.length > 0 && cekDinilai[0].dinilai === 'Y') {
        console.log('ini delegation', dto.em_delegation);
        console.log('ini ids', dto.em_ids);
        const delegationIds = dto.em_delegation
          ? Array.isArray(dto.em_delegation)
            ? dto.em_delegation
            : [dto.em_delegation]
          : [];

        const emIds = dto.em_ids
          ? Array.isArray(dto.em_ids)
            ? dto.em_ids
            : [dto.em_ids]
          : [];

        const combinedIds = [
          ...new Set([
            ...delegationIds.flatMap((id) =>
              id.split(',').map((i) => i.trim().toUpperCase()),
            ),
            ...emIds.flatMap((id) =>
              id.split(',').map((i) => i.trim().toUpperCase()),
            ),
          ]),
        ];

        utility.insertNotifikasi(
          combinedIds,
          'Approval Lembur',
          'Lembur',
          user[0].em_id,
          transaksi[0].id,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster,
        );
      } else {
        const delegationIds = user[0].em_report_to
          ? Array.isArray(user[0].em_report_to)
            ? user[0].em_report_to
            : [user[0].em_report_to]
          : [];

        const emIds = user[0].em_report2_to
          ? Array.isArray(user[0].em_report2_to)
            ? user[0].em_report2_to
            : [user[0].em_report2_to]
          : [];

        const combinedIds = [
          ...new Set([
            ...delegationIds.flatMap((id) =>
              id.split(',').map((i) => i.trim().toUpperCase()),
            ),
            ...emIds.flatMap((id) =>
              id.split(',').map((i) => i.trim().toUpperCase()),
            ),
          ]),
        ];
        console.log('ini combinasi id', combinedIds);
        utility.insertNotifikasi(
          combinedIds,
          'Approval Lembur',
          'Lembur',
          user[0].em_id,
          transaksi[0].id,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster,
        );
      }

      if (sysData[0].name == '' || sysData[0].name == null) {
      } else {
        var listData = sysData[0].name.toString().split(',');
        utility.insertNotifikasi(
          listData,
          'Pengajuan Lembur',
          'Lembur',
          user[0].em_id,
          null,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster,
        );
      }
      console.log('ini gak yah');
      await conn.commit();
      return {
        status: true,
        message: 'Successfully insert data',
      };
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException(
        'Gagal bikin pengajuan lembur: ' + e.message,
      );
    } finally {
      if (conn) await conn.release();
    }
  }
}
