import { Injectable } from '@nestjs/common';

/**
 * Service untuk menyimpan data Lembur
 */
@Injectable()
export class OvertimesStoreService {

    async store(req, res) {
        function isDateInRange(date, startDate, endDate) {
          return date >= startDate && date <= endDate;
        }
        var database = req.query.database;
        let name_url = req.originalUrl;
        var convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
        var nameTable = convert1
          .substring(convert1.lastIndexOf("-") + 1)
          .replace("?database=" + req.query.database, "");
    
        var menu_name = req.body.menu_name;
        var activity_name = req.body.activity_name;
        var createdBy = req.body.created_by;
        var bodyValue = req.body;
        var branchId = req.headers.branch_id;
        var tasks = req.body.tasks;
        delete bodyValue.menu_name;
        delete bodyValue.activity_name;
        delete bodyValue.created_by;
        delete bodyValue.tasks;
    
        bodyValue.branch_id = req.headers.branch_id;
    
        let now = new Date();
    
        let year = now.getFullYear();
        let month = now.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1
        let date = now.getDate();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
    
        var dateNow = `${year}-${month
          .toString()
          .padStart(2, "0")}-${date} ${hours}:${minutes}:${seconds}`;
        bodyValue.tgl_ajuan = utility.dateNow4();
        bodyValue.created_on = dateNow;
    
        // bodyValue.is_mobile="1"
    
        var array = req.body.atten_date.split("-");
    
        const tahun = `${array[0]}`;
        const convertYear = tahun.substring(2, 4);
        var convertBulan;
        if (array[1].length == 1) {
          convertBulan = array[1] <= 9 ? `0${array[1]}` : array[1];
        } else {
          convertBulan = array[1];
        }
        const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    
        var script = `INSERT INTO ${namaDatabaseDynamic}.emp_labor SET ?`;
    
        const databaseMaster = `${database}_hrm`;
        var nomorLb = `LB20${convertYear}${convertBulan}`;
        var transaksion = "";
        const connection = await model.createConnection1(databaseMaster);
        let conn;
        try {
          console.log("--------begin transaksi-----------");
          conn = await connection.getConnection();
          await conn.beginTransaction();
          const [data] = await conn.query(
            `SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                    WHERE em_id='${req.body.em_id}' 
                    AND (date_selected LIKE '%${req.body.atten_date}%')  
                    AND  status_transaksi=1 
                     AND leave_status IN ('Pending','Approve','Approve2')`
          );
          for (var i = 0; i < data.length; i++) {
            if (data.length > 0) {
              if (data[0].leave_type == "HALFDAY") {
                var timeParam1 = new Date(
                  `${req.body.atten_date}T${req.body.dari_jam}`
                );
                var timeParam2 = new Date(
                  `${req.body.atten_date}T${req.body.sampai_jam}`
                );
                /// jika suda ada data
                var time1 = new Date(`${data[i].atten_date}T${data[i].time_plan}`);
                var time2 = new Date(
                  `${data[i].atten_date}T${data[i].time_plan_to}`
                );
                if (time1 > time2) {
                  time2.setDate(time2.getDate() + 1);
                }
    
                if (timeParam1 > timeParam2) {
                  timeParam2.setDate(time2.getDate() + 1);
                }
    
                transaksion = "Izin";
    
                if (isDateInRange(timeParam1, time1, time2)) {
                  await conn.commit();
                  return res.status(400).send({
                    status: false,
                    message: `Kamu telah melakaukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`,
                  });
                }
              } else if (
                req.body.leave_type == "FULLDAY" ||
                req.body.leave_type == "FULL DAY"
              ) {
                if (data[i].ajuan == "1" || data[i].ajuan == 1) {
                  await conn.commit();
                  return res.status(400).send({
                    status: false,
                    message: `Kamu telah melakaukan pengajuan Cuti  pada tanggal ${req.body.atten_date}  dengan status ${data[0].leave_status}`,
                  });
                }
    
                if (data[i].ajuan == "2" || data[i].ajuan == 2) {
                  await conn.commit();
                  return res.status(400).send({
                    status: false,
                    message: `Kamu telah melakaukan pengajuan Sakit  pada tanggal ${req.body.atten_date}  dengan status ${data[0].leave_status}`,
                  });
                }
              }
            }
          }
          console.log("inin lolos gak");
          const [cekLembur] = await conn.query(
            `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${req.body.em_id}' AND atten_date='${req.body.atten_date}' AND status_transaksi=1 AND ( ajuan='1' OR ajuan='2') AND status IN ('Pending','Approve','Approve2')`
          );
          for (var i = 0; i < cekLembur.length; i++) {
            if (cekLembur.length > 0) {
              var timeParam1 = new Date(
                `${req.body.atten_date}T${req.body.dari_jam}`
              );
              var timeParam2 = new Date(
                `${req.body.atten_date}T${req.body.sampai_jam}`
              );
    
              /// jika suda ada data
              var time1 = new Date(
                `${cekLembur[i].atten_date}T${cekLembur[i].dari_jam}`
              );
              var time2 = new Date(
                `${cekLembur[i].atten_date}T${cekLembur[i].sampai_jam}`
              );
    
              if (time1 > time2) {
                time2.setDate(time2.getDate() + 1);
              }
    
              if (timeParam1 > timeParam2) {
                timeParam2.setDate(time2.getDate() + 1);
              }
    
              if (cekLembur[i].ajuan == "2") {
                transaksion = "Tugas Luar";
              }
    
              if (cekLembur[i].ajuan == "1") {
                transaksion = "Lembur";
              }
    
              if (isDateInRange(timeParam1, time1, time2)) {
                await conn.commit();
                return res.status(400).send({
                  status: false,
                  message: `Kamu telah melakukan pengajuan ${transaksion} pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`,
                  data: [],
                });
              } else {
                if (isDateInRange(timeParam2, time1, time2)) {
                  await conn.commit();
                  return res.status(400).send({
                    status: false,
                    message: `Kamu telah melakukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${cekLembur[0].status}`,
                    data: [],
                  });
                }
              }
            }
          }
          const [cekNoAjuan] = await conn.query(
            `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_labor WHERE nomor_ajuan LIKE '%LB%' ORDER BY id DESC LIMIT 1`
          );
          if (cekNoAjuan.length > 0) {
            var text = cekNoAjuan[0]["nomor_ajuan"];
            var nomor = parseInt(text.substring(8, 13)) + 1;
            var nomorStr = String(nomor).padStart(4, "0");
            nomorLb = nomorLb + nomorStr;
          } else {
            var nomor = 1;
            var nomorStr = String(nomor).padStart(4, "0");
            nomorLb = nomorLb + nomorStr;
          }
          bodyValue.nomor_ajuan = nomorLb;
          await conn.query(script, [bodyValue]);
          // console.log('ini result ', results[0]);
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
          for (var i = 0; i < tasks.length; i++) {
            let task = tasks[i]["task"];
            let level = tasks[i]["level"];
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
    
            utility.insertNotifikasi(
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
            utility.insertNotifikasi(
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
          } else {
            var listData = sysData[0].name.toString().split(",");
            utility.insertNotifikasi(
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
          return res.status(200).send({
            status: true,
            message: "Successfuly insert data",
          });
        } catch (e) {
          console.error("error", e);
          if (conn) {
            await conn.rollback();
          }
          return res.status(400).send({
            status: false,
            message: "Gagal bikin pengajuan lembur",
            pesan: e
          });
        } finally {
          if (conn) await conn.release();
        }
      },
} 