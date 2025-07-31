import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface OvertimesStoreDto {
  database: string;
  atten_date: string;
  em_id: string;
  dari_jam: string;
  sampai_jam: string;
  typeid: string;
  tasks: any[];
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  leave_type?: string;
  em_delegation?: string;
  em_ids?: string;
  branch_id?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk menyimpan data Lembur
 */
@Injectable()
export class OvertimesStoreService {

  async store(dto: OvertimesStoreDto): Promise<any> {
    function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
      return date >= startDate && date <= endDate;
    }

    const database = dto.database;
    const name_url = dto.originalUrl || '';
    const convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    const nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + dto.database, "");

    const menu_name = dto.menu_name;
    const activity_name = dto.activity_name;
    const createdBy = dto.created_by;
    const bodyValue = { ...dto } as any;
    const branchId = dto.branch_id;
    const tasks = dto.tasks || [];
    
    delete (bodyValue as any).menu_name;
    delete (bodyValue as any).activity_name;
    delete (bodyValue as any).created_by;
    delete (bodyValue as any).tasks;

    bodyValue.branch_id = dto.branch_id;

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const dateNow = `${year}-${month
      .toString()
      .padStart(2, "0")}-${date} ${hours}:${minutes}:${seconds}`;
    
    bodyValue.tgl_ajuan = this.dateNow4();
    bodyValue.created_on = dateNow;

    // bodyValue.is_mobile="1"

    const array = dto.atten_date.split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan: string;
    
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    const script = `INSERT INTO ${namaDatabaseDynamic}.emp_labor SET ?`;

    const databaseMaster = `${database}_hrm`;
    let nomorLb = `LB20${convertYear}${convertBulan}`;
    let transaksion = "";
    
    const connection = await model.createConnection1(databaseMaster);
    let conn;
    
    try {
      console.log("--------begin transaksi-----------");
      conn = await connection.getConnection();
      await conn.beginTransaction();
      
      const [data] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                WHERE em_id='${dto.em_id}' 
                AND (date_selected LIKE '%${dto.atten_date}%')  
                AND  status_transaksi=1 
                 AND leave_status IN ('Pending','Approve','Approve2')`
      );
      
      for (let i = 0; i < data.length; i++) {
        if (data.length > 0) {
          if (data[0].leave_type == "HALFDAY") {
            const timeParam1 = new Date(
              `${dto.atten_date}T${dto.dari_jam}`
            );
            const timeParam2 = new Date(
              `${dto.atten_date}T${dto.sampai_jam}`
            );
            /// jika suda ada data
            const time1 = new Date(`${data[i].atten_date}T${data[i].time_plan}`);
            const time2 = new Date(
              `${data[i].atten_date}T${data[i].time_plan_to}`
            );
            if (time1 > time2) {
              time2.setDate(time2.getDate() + 1);
            }

            if (timeParam1 > timeParam2) {
              timeParam2.setDate(timeParam2.getDate() + 1);
            }

            transaksion = "Izin";

            if (isDateInRange(timeParam1, time1, time2)) {
              await conn.commit();
              throw new BadRequestException(`Kamu telah melakaukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`);
            }
          } else if (
            dto.leave_type == "FULLDAY" ||
            dto.leave_type == "FULL DAY"
          ) {
            if (data[i].ajuan == "1" || data[i].ajuan == 1) {
              await conn.commit();
              throw new BadRequestException(`Kamu telah melakaukan pengajuan Cuti pada tanggal ${dto.atten_date} dengan status ${data[0].leave_status}`);
            }

            if (data[i].ajuan == "2" || data[i].ajuan == 2) {
              await conn.commit();
              throw new BadRequestException(`Kamu telah melakaukan pengajuan Sakit pada tanggal ${dto.atten_date} dengan status ${data[0].leave_status}`);
            }
          }
        }
      }
      
      console.log("inin lolos gak");
      const [cekLembur] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${dto.em_id}' AND atten_date='${dto.atten_date}' AND status_transaksi=1 AND ( ajuan='1' OR ajuan='2') AND status IN ('Pending','Approve','Approve2')`
      );
      
      for (let i = 0; i < cekLembur.length; i++) {
        if (cekLembur.length > 0) {
          const timeParam1 = new Date(
            `${dto.atten_date}T${dto.dari_jam}`
          );
          const timeParam2 = new Date(
            `${dto.atten_date}T${dto.sampai_jam}`
          );

          /// jika suda ada data
          const time1 = new Date(
            `${cekLembur[i].atten_date}T${cekLembur[i].dari_jam}`
          );
          const time2 = new Date(
            `${cekLembur[i].atten_date}T${cekLembur[i].sampai_jam}`
          );

          if (time1 > time2) {
            time2.setDate(time2.getDate() + 1);
          }

          if (timeParam1 > timeParam2) {
            timeParam2.setDate(timeParam2.getDate() + 1);
          }

          if (cekLembur[i].ajuan == "2") {
            transaksion = "Tugas Luar";
          }

          if (cekLembur[i].ajuan == "1") {
            transaksion = "Lembur";
          }

          if (isDateInRange(timeParam1, time1, time2)) {
            await conn.commit();
            throw new BadRequestException(`Kamu telah melakukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`);
          } else {
            if (isDateInRange(timeParam2, time1, time2)) {
              await conn.commit();
              throw new BadRequestException(`Kamu telah melakukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`);
            }
          }
        }
      }
      
      const [cekNoAjuan] = await conn.query(
        `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan LIKE '%LB%' ORDER BY id DESC LIMIT 1`
      );
      
      if (cekNoAjuan.length > 0) {
        const text = cekNoAjuan[0]["nomor_ajuan"];
        const nomor = parseInt(text.substring(8, 13)) + 1;
        const nomorStr = String(nomor).padStart(4, "0");
        nomorLb = nomorLb + nomorStr;
      } else {
        const nomor = 1;
        const nomorStr = String(nomor).padStart(4, "0");
        nomorLb = nomorLb + nomorStr;
      }
      
      bodyValue.nomor_ajuan = nomorLb;
      await conn.query(script, [bodyValue]);
      
      const [cekDinilai] = await conn.query(
        `SELECT dinilai FROM overtime where id = '${bodyValue.typeid}'`
      );

      console.log("ini cek nilai ", cekDinilai);
      const [updateEmpLabor] = await conn.query(
        `UPDATE ${database}_hrm.overtime SET pakai='Y' WHERE id='${bodyValue.typeid}' `,
        [bodyValue]
      );
      
      const [transaksi] = await conn.query(
        `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan ='${bodyValue.nomor_ajuan}'`
      );
      
      const [sysData] = await conn.query(
        "SELECT name FROM sysdata WHERE KODE IN (024)"
      );
      
      const [user] = await conn.query(
        `SELECT * FROM  ${databaseMaster}.employee WHERE em_id='${bodyValue.em_id}'`
      );
      
      bodyValue.branch_id = user[0].branch_id;
      console.log(tasks);
      
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]["task"];
        const level = tasks[i]["level"];
        const [insertTask] = await conn.query(
          `INSERT INTO ${namaDatabaseDynamic}.emp_labor_task (task,persentase,emp_labor_id,level) VALUES('${task}','0','${transaksi[0].id}',${level})`
        );
      }

      console.log("kesni gak sih");

      if (cekDinilai.length > 0 && cekDinilai[0].dinilai === "Y") {
        console.log("ini delegation", bodyValue.em_delegation);
        console.log("ini ids", bodyValue.em_ids);
        const delegationIds = bodyValue.em_delegation
          ? Array.isArray(bodyValue.em_delegation)
            ? bodyValue.em_delegation
            : [bodyValue.em_delegation]
          : [];

        const emIds = bodyValue.em_ids
          ? Array.isArray(bodyValue.em_ids)
            ? bodyValue.em_ids
            : [bodyValue.em_ids]
          : [];

        const combinedIds = [...new Set([
          ...delegationIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase())),
          ...emIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase()))
        ])];

        this.insertNotifikasi(
          combinedIds,
          "Approval Lembur",
          "Lembur",
          user[0].em_id,
          transaksi[0].id,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster
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

        const combinedIds = [...new Set([
          ...delegationIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase())),
          ...emIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase()))
        ])];
        
        console.log('ini combinasi id', combinedIds);
        this.insertNotifikasi(
          combinedIds,
          "Approval Lembur",
          "Lembur",
          user[0].em_id,
          transaksi[0].id,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster
        );
      }

      if (sysData[0].name == "" || sysData[0].name == null) {
        // Do nothing
      } else {
        const listData = sysData[0].name.toString().split(",");
        this.insertNotifikasi(
          listData,
          "Pengajuan Lembur",
          "Lembur",
          user[0].em_id,
          null,
          transaksi[0].nomor_ajuan,
          user[0].full_name,
          namaDatabaseDynamic,
          databaseMaster
        );
      }
      
      console.log("ini gak yah");
      await conn.commit();
      
      return {
        status: true,
        message: "Successfully insert data",
      };
    } catch (e) {
      console.error("error", e);
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerErrorException('Gagal bikin pengajuan lembur');
    } finally {
      if (conn) await conn.release();
    }
  }

  private dateNow4(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private insertNotifikasi(
    userIds: string[],
    title: string,
    type: string,
    emId: string,
    id: string | null,
    nomorAjuan: string,
    fullName: string,
    namaDatabaseDynamic: string,
    databaseMaster: string
  ): void {
    // Implementation for notification insertion
    console.log('Inserting notification for:', userIds);
  }
} 