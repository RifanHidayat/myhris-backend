import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface OvertimesUpdateDto {
  database: string;
  atten_date: string;
  id: string;
  nomor_ajuan?: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  tasks?: any[];
  leave_type?: string;
  dari_jam?: string;
  sampai_jam?: string;
  em_id?: string;
  em_delegation?: string;
  typeid?: string;
  status?: string;
  work_id_old?: string | number;
  work_id_new?: string | number;
  uraian?: string;
  approve_status?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');

/**
 * Service untuk mengupdate data Lembur
 */
@Injectable()
export class OvertimesUpdateService {
  async updateLembur(dto: OvertimesUpdateDto): Promise<any> {
    function isDateInRange(date, startDate, endDate) {
      return date >= startDate && date <= endDate;
    }
    var id = dto.id;
    var nomorLb = dto.nomor_ajuan;
    var database = dto.database;
    let name_url = dto.originalUrl;
    var convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    var nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + dto.database, "");

    var menu_name = dto.menu_name;
    var activity_name = dto.activity_name;
    var createdBy = dto.created_by;

    var bodyValue = dto;
    var tasks = dto.tasks;
    console.log("task  ", tasks[0]);
    delete bodyValue.menu_name;
    delete bodyValue.activity_name;
    delete bodyValue.created_by;
    delete bodyValue.tasks;
    delete bodyValue.nomor_ajuan;
    delete bodyValue.cari;
    delete bodyValue.id;

    let now = new Date();

    console.log(bodyValue);

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

    var array = dto.atten_date.split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    var convertBulan;
    if (array[1].length == 1) {
      convertBulan = array[1] <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    var script = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id='${id}'`;

    const databaseMaster = `${database}_hrm`;
    //var nomorLb=`LB20${convertYear}${convertBulan}`;
    var script = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id='${id}'`;

    console.log(script);

    var transaksion = "";
    try {
      const connection = await model.createConnection(database);
      connection.connect((err) => {
        if (err) {
          console.error("Error connecting to the database:", err);
          return;
        }

        connection.beginTransaction((err) => {
          if (err) {
            console.error("Error beginning transaction:", err);
            connection.end();
            return;
          }

          connection.query(
            `SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                        WHERE em_id='${dto.em_id}' 
                        AND (date_selected LIKE '%${dto.atten_date}%')  
                        AND  status_transaksi=1 
                         AND leave_status IN ('Pending','Approve','Approve2')`,
            (err, data) => {
              if (err) {
                console.error("Error executing SELECT statement:", err);
                connection.rollback(() => {
                  connection.end();
                  return;
                }
              }

              for (var i = 0; i < data.length; i++) {
                if (data.length > 0) {
                  if (data[0].leave_type == "HALFDAY") {
                    var timeParam1 = new Date(
                      `${dto.atten_date}T${dto.dari_jam}`
                    );
                    var timeParam2 = new Date(
                      `${dto.atten_date}T${dto.sampai_jam}`
                    );
                    /// jika suda ada data
                    var time1 = new Date(
                      `${data[i].atten_date}T${data[i].time_plan}`
                    );
                    var time2 = new Date(
                      `${data[i].atten_date}T${data[i].time_plan_to}`
                    );
                    if (time1 > time2) {
                      time2.setDate(time2.getDate() + 1);
                    }

                    if (timeParam1 > timeParam2) {
                      timeParam2.setDate(time2.getDate() + 1);
                    }

                    transaksi = "Izin";

                    if (isDateInRange(timeParam1, time1, time2)) {
                      // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                      return;
                    }
                  } else if (
                    dto.leave_type == "FULLDAY" ||
                    dto.leave_type == "FULL DAY"
                  ) {
                    if (data[i].ajuan == "1" || data[i].ajuan == 1) {
                      // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                      return;
                    }

                    if (data[i].ajuan == "2" || data[i].ajuan == 2) {
                      // console.error(`Kamu telah melakaukan pengajuan Sakit  pada tanggal ${req.body.atten_date}  dengan status ${data[0].leave_status}`)
                      return;
                    }
                  }
                }
              }

              connection.query(
                `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${dto.em_id}' AND atten_date='${dto.atten_date}' AND status_transaksi=1 AND ( ajuan='1' OR ajuan='2') AND status IN ('Pending','Approve','Approve2') AND id!='${id}'`,
                (err, data) => {
                  if (err) {
                    console.error("Error executing SELECT statement:", err);
                    connection.rollback(() => {
                      connection.end();
                      return;
                    }
                  }

                  for (var i = 0; i < data.length; i++) {
                    if (data.length > 0) {
                      var timeParam1 = new Date(
                        `${dto.atten_date}T${dto.dari_jam}`
                      );
                      var timeParam2 = new Date(
                        `${dto.atten_date}T${dto.sampai_jam}`
                      );

                      /// jika suda ada data
                      var time1 = new Date(
                        `${data[i].atten_date}T${data[i].dari_jam}`
                      );
                      var time2 = new Date(
                        `${data[i].atten_date}T${data[i].sampai_jam}`
                      );

                      if (time1 > time2) {
                        time2.setDate(time2.getDate() + 1);
                      }

                      if (timeParam1 > timeParam2) {
                        timeParam2.setDate(time2.getDate() + 1);
                      }

                      if (data[i].ajuan == "2") {
                        transaksi = "Tugas Luar";
                      }

                      if (data[i].ajuan == "1") {
                        transaksi = "Lembur";
                      }

                      if (isDateInRange(timeParam1, time1, time2)) {
                        // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                        return;
                      } else {
                        if (isDateInRange(timeParam2, time1, time2)) {
                          console.error(
                            `Kamu telah melakaukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`
                          );
                          return;
                        }
                      }
                    }
                  }

                  connection.query(script, [bodyValue], (err, results) => {
                    if (err) {
                      console.error("Error executing SELECT statement:", err);
                      connection.rollback(() => {
                        connection.end();
                        return;
                      }
                    }

                    connection.query(
                      `UPDATE ${database}_hrm.overtime SET pakai='Y' WHERE id='${bodyValue.typeid}' `,
                      [bodyValue],
                      (err, updateEmpLabor) => {
                        if (err) {
                          console.error(
                            "Error executing SELECT statement:",
                            err
                          );
                          connection.rollback(() => {
                            connection.end();
                            return;
                          }
                        }

                        //Proses Notifikasi
                        connection.query(
                          "SELECT name FROM sysdata WHERE KODE IN (024)",
                          (err, sysData) => {
                            if (err) {
                              console.error(
                                "Error executing SELECT statement:",
                                err
                              );
                              connection.rollback(() => {
                                connection.end();
                                return;
                              }
                            }

                            connection.query(
                              `SELECT * FROM  ${databaseMaster}.employee WHERE em_id='${bodyValue.em_id}' `,
                              (err, user) => {
                                if (err) {
                                  console.error(
                                    "Error executing SELECT statement:",
                                    err
                                  );
                                  connection.rollback(() => {
                                    connection.end();
                                    return;
                                  }
                                }

                                connection.query(
                                  `DELETE FROM ${namaDatabaseDynamic}.emp_labor_task WHERE emp_labor_id = ${id}`,
                                  (err, user) => {
                                    if (err) {
                                      console.error(
                                        "Error executing SELECT statement:",
                                        err
                                      );
                                      connection.rollback(() => {
                                        connection.end();
                                        return;
                                      }
                                    }

                                    for (var i = 0; i < tasks.length; i++) {
                                      var task = tasks[i]["task"];
                                      var level = tasks[i]["level"];
                                      console.log(tasks);
                                      connection.query(
                                        `INSERT INTO ${namaDatabaseDynamic}.emp_labor_task (task,persentase,emp_labor_id,level) VALUES('${task}','0',${id},${level})`,
                                        (err, user) => {
                                          if (err) {
                                            console.error(
                                              "Error executing SELECT statement:",
                                              err
                                            );
                                            connection.rollback(() => {
                                              connection.end();
                                              return;
                                            }
                                          }
                                        }
                                      );
                                    }

                                    var title = "Approval Lembur";
                                    connection.commit((err) => {
                                      if (err) {
                                        console.error(
                                          "Error committing transaction:",
                                          err
                                        );
                                        connection.rollback(() => {
                                          connection.end();
                                          return;
                                        }
                                      }
                                      connection.end();
                                      console.log(
                                        "Transaction completed successfully!"
                                      );
                                      return;
                                    });
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    } catch ($e) {
      return;
    }
  }
} 