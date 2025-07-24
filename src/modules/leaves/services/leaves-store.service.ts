import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

interface LeavesStoreDto {
  database: string;
  em_id: string;
  typeid: string;
  nomor_ajuan: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  leave_duration: number;
  date_selected: string;
  time_plan?: string;
  time_plan_to?: string;
  apply_date?: string;
  reason?: string;
  leave_status?: string;
  em_delegation?: string;
  leave_files?: string;
  ajuan?: string;
  menu_name?: string;
  activity_name?: string;
  created_by?: string;
  cut_leave?: number;
  total_cuti?: number;
  dari_jam?: string;
  sampai_jam?: string;
  [key: string]: any;
}

const model = require('../../../common/model');
const utility = require('../../../common/utility');

/**
 * Service untuk menyimpan data Cuti
 */
@Injectable()
export class LeavesStoreService {

  async store(dto: LeavesStoreDto): Promise<any> {
    function isDateInRange(date, startDate, endDate) {
      return date >= startDate && date <= endDate;
    }

    var database = dto.database;
    let name_url = dto.url;
    var convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    var nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + dto.database, "")
      .replace("&start_periode=" + dto.start_periode, "")
      .replace("&end_periode=" + dto.start_periode, "");

    var menu_name = dto.menu_name;
    var activity_name = dto.activity_name;
    var createdBy = dto.created_by;

    var bodyValue = dto;
    var cutLeave = dto.cut_leave;
    var jumlahCuti = dto.total_cuti;
    delete bodyValue.cut_leave;
    delete bodyValue.total_cuti;
    delete bodyValue.menu_name;
    delete bodyValue.activity_name;
    delete bodyValue.created_by;
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
    bodyValue.created_on = dateNow;
    bodyValue.is_mobile = "1";
    //var script = `INSERT INTO ${nameTable} SET ?`;

    var isError = false;
    var pesan = "";

    var array = dto.date_selected.split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    var convertBulan;
    if (array[1].length == 1) {
      convertBulan = array[1] <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    const databaseMaster = `${database}_hrm`;
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    var nomorLb = `CT20${convertYear}${convertBulan}`;
    var script = `INSERT INTO ${namaDatabaseDynamic}.emp_leave SET ?`;
    var transaksi = "";
    console.log("-------buat cuti--------");
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
          var query = "";
          var splits = dto.date_selected.split(",");

          var query = ``;
          var queryPendingPotongCuti = `
        SELECT 
        SUM(e.leave_duration) AS total_leave_duration,
        e.leave_status AS status,
        e.nomor_ajuan AS nomorAjuan,
        lt.name AS namaAjuan
    FROM ${namaDatabaseDynamic}.emp_leave e
    JOIN ${databaseMaster}.leave_types lt ON e.typeId = lt.id
    WHERE e.em_id = '${dto.em_id}' 
      AND e.status_transaksi = 1
      AND lt.cut_leave = 1
      AND e.leave_status IN ('Pending', 'Approve','Approve2')
    `;

          for (var i = 0; i < splits.length; i++) {
            console.log(i);

            let subQuery = `  
        SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
        WHERE em_id='${dto.em_id}' 
        AND date_selected LIKE '%${splits[i]}%'  
        AND status_transaksi=1 
        AND leave_status IN ('Pending','Approve','Approve2')`;

            //         let subQueryPending = `
            // SELECT e.* FROM ${namaDatabaseDynamic}.emp_leave e
            // JOIN ${databaseMaster}.leave_types lt ON e.typeId = lt.id
            // WHERE e.em_id = '${dto.em_id}'
            // AND e.status_transaksi = 1
            // AND lt.cut_leave = 1`;

            if (i === 0) {
              query = subQuery;
              // queryPendingPotongCuti = subQueryPending;
            } else {
              query += ` UNION ALL ${subQuery}`;
              // queryPendingPotongCuti += ` UNION ALL ${subQueryPending}`;
            }
          }
          console.log(query);

          //    splits.forEach(function(number) {

          //     if ()

          // });

          connection.query(query, (err, data) => {
            if (err) {
              console.error("Error executing SELECT statement:", err);
              connection.rollback(() => {
                connection.end();
                return res.status(400).send({
                  status: false,
                  message: "gagal ambil data",
                  data: [],
                });
              });
              return;
            }

            connection.query(queryPendingPotongCuti, (err, dataPending) => {
              if (err) {
                console.error("Error executing SELECT statement:", err);
                connection.rollback(() => {
                  connection.end();
                  return res.status(400).send({
                    status: false,
                    message: "gagal ambil data",
                    data: [],
                  });
                });
                return;
              }
              console.log(queryPendingPotongCuti);
              console.log(dataPending);
              console.log(jumlahCuti);
              console.log(cutLeave);
              const totalLeaveDuration =
                (dataPending[0]?.total_leave_duration || 0) +
                dto.leave_duration;
              if (cutLeave == 1) {
                if (totalLeaveDuration > jumlahCuti) {
                  isError = true;
                  pesan = `Kamu mempunyai ${dataPending[0]?.namaAjuan} dengan Status ${dataPending[0]?.status} dan nomor ajuan ${dataPending[0]?.nomorAjuan} sehingga sisa cuti kamu tidak mencukupi`;
                }
              }

              console.log(`SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                    WHERE em_id='${dto.em_id}' 
                    AND (date_selected LIKE '%${dto.date_selected}%')  
                    AND  status_transaksi=1 
                    AND leave_status IN ('Pending','Approve','Approve2')`);
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
                      isError = true;
                      pesan = `Kamu telah melakukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`;

                      // return res.status(400).send({
                      //     status: false,
                      //     message: `Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`,
                      //     data:[]

                      //   });
                    }
                  } else if (
                    dto.leave_type == "FULLDAY" ||
                    dto.leave_type == "FULL DAY" ||
                    dto.leave_type == "Full Day"
                  ) {
                    console.log(data[i].ajuan);

                    if (data[i].ajuan == "1" || data[i].ajuan == 1) {
                      isError = true;
                      pesan = `Kamu telah melakukan pengajuan Cuti  pada tanggal ${dto.date_selected} dengan status ${data[i].leave_status}`;
                      // return res.status(400).send({
                      //   status: false,
                      //   message: `Kamu telah melakaukan pengajuan Cuti  pada tanggal ${dto.atten_date}  dengan status ${data[i].leave_status}`,
                      //   data:[]

                      // });
                    }

                    if (data[i].ajuan == "2" || data[i].ajuan == 2) {
                      isError = true;
                      pesan = `Kamu telah melakukan pengajuan Sakit  pada tanggal ${dto.date_selected}  dengan status ${data[i].leave_status}`;

                      // return res.status(400).send({
                      //   status: false,
                      //   message: `Kamu telah melakaukan pengajuan Sakit  pada tanggal ${dto.atten_date}  dengan status ${data[i].leave_status}`,
                      //   data:[]

                      // });
                    }
                  }
                }
              }
              connection.query(query, (err, data) => {
                if (err) {
                  console.error("Error executing SELECT statement:", err);
                  connection.rollback(() => {
                    connection.end();
                    return res.status(400).send({
                      status: false,
                      message: "gagal ambil data",
                      data: [],
                    });
                  });
                  return;
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
                      isError = true;
                      pesan = `Kamu telah melakukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`;
                      // return res.status(400).send({
                      //     status: false,
                      //     message: `Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`,
                      //     data:[]

                      //   });
                    } else {
                      if (isDateInRange(timeParam2, time1, time2)) {
                        isError = true;
                        pesan = `Kamu telah melakukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`;
                        // return res.status(400).send({
                        //     status: false,
                        //     message: `Kamu telah melakaukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`,
                        //     data:[]

                        //   });
                      }
                    }
                  }
                }
                console.log("is errr", isError);

                if (isError == true || isError == "true") {
                  connection.end();
                  return res.status(200).send({
                    status: false,
                    message: pesan,
                    data: [],
                  });
                } else {
                  connection.query(
                    `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_leave WHERE nomor_ajuan LIKE '%CT%' ORDER BY id DESC LIMIT 1`,
                    (err, results) => {
                      if (err) {
                        console.error("Error executing SELECT statement:", err);
                        connection.rollback(() => {
                          connection.end();
                          return res.status(400).send({
                            status: false,
                            message: "gagal ambil data",
                            data: [],
                          });
                        });
                        return;
                      }

                      //   if (results.length>0){

                      //   }else{

                      //     nomorLb=`20${convertYear}${convertBulan}0001`
                      //   }
                      if (results.length > 0) {
                        var text = results[0]["nomor_ajuan"];
                        var nomor = parseInt(text.substring(8, 13)) + 1;
                        var nomorStr = String(nomor).padStart(4, "0");
                        nomorLb = nomorLb + nomorStr;
                      } else {
                        var nomor = 1;
                        var nomorStr = String(nomor).padStart(4, "0");
                        nomorLb = nomorLb + nomorStr;
                      }
                      bodyValue.nomor_ajuan = nomorLb;
                      var dates = bodyValue.date_selected.split(",");
                      bodyValue.start_date = dates[0];
                      bodyValue.end_date = dates[dates.length - 1];
                      console.log("yah kemari berapa kali?");
                      connection.query(script, [bodyValue], (err, results) => {
                        if (err) {
                          console.error(
                            "Error executing SELECT statement:",
                            err
                          );
                          connection.rollback(() => {
                            connection.end();
                            return res.status(400).send({
                              status: false,
                              message: "gagal ambil data",
                              data: [],
                            });
                          });
                          return;
                        }
                        connection.query(
                          `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE nomor_ajuan='${bodyValue.nomor_ajuan}'`,
                          (err, transaksi) => {
                            if (err) {
                              console.error(
                                "Error executing SELECT statement:",
                                err
                              );
                              connection.rollback(() => {
                                connection.end();
                                return res.status(400).send({
                                  status: false,
                                  message: "gagal ambil data",
                                  data: [],
                                });
                              });
                              return;
                            }

                            connection.query(
                              `SELECT * FROM ${databaseMaster}.employee WHERE em_id='${bodyValue.em_id}'`,
                              [bodyValue],
                              (err, employee) => {
                                if (err) {
                                  console.error(
                                    "Error executing SELECT statement:",
                                    err
                                  );
                                  connection.rollback(() => {
                                    connection.end();
                                    return res.status(400).send({
                                      status: false,
                                      message: "gagal ambil data",
                                      data: [],
                                    });
                                  });
                                  return;
                                }
                                connection.query(
                                  `SELECT * FROM sysdata WHERE kode IN ('031','012')`,
                                  (err, sysdataCuti) => {
                                    if (err) {
                                      console.error(
                                        "Error executing SELECT statement:",
                                        err
                                      );
                                      connection.rollback(() => {
                                        connection.end();
                                        return res.status(400).send({
                                          status: false,
                                          message: "gagal ambil data",
                                          data: [],
                                        });
                                      });
                                      return;
                                    }

                                    connection.query(
                                      `SELECT * FROM assign_leave WHERE  em_id='${bodyValue.em_id}' AND dateyear='${tahun}'`,
                                      (err, cutiData) => {
                                        if (err) {
                                          console.error(
                                            "Error executing SELECT statement:",
                                            err
                                          );
                                          connection.rollback(() => {
                                            connection.end();
                                            return res.status(400).send({
                                              status: false,
                                              message: "gagal ambil data",
                                              data: [],
                                            });
                                          });
                                          return;
                                        }
                                        const delegationIds = employee[0]
                                          .em_report_to
                                          ? Array.isArray(
                                              employee[0].em_report_to
                                            )
                                            ? employee[0].em_report_to
                                            : [employee[0].em_report_to]
                                          : [];

                                        const emIds = employee[0].em_report2_to
                                          ? Array.isArray(
                                              employee[0].em_report2_to
                                            )
                                            ? employee[0].em_report2_to
                                            : [employee[0].em_report2_to]
                                          : [];

                                              const combinedIds = [...new Set([
                                                ...delegationIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase())),
                                                ...emIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase()))
                                              ])];
                                            
                                            console.log('ini syy data cuti ',sysdataCuti[1]);
                                            utility.insertNotifikasi(
                                              combinedIds,
                                              "Approval Cuti",
                                              "Cuti",
                                              employee[0].em_id,
                                              transaksi[0].id,
                                              transaksi[0].nomor_ajuan,
                                              employee[0].full_name,
                                              namaDatabaseDynamic,
                                              databaseMaster
                                            );
                                            utility.insertNotifikasi(
                                              sysdataCuti[1].name,
                                              "Pengajuan Cuti",
                                              "Cuti",
                                              employee[0].em_id,
                                              null,
                                              transaksi[0].nomor_ajuan,
                                              employee[0].full_name,
                                              namaDatabaseDynamic,
                                              databaseMaster
                                            );

                                            connection.commit((err) => {
                                              if (err) {
                                                console.error(
                                                  "Error committing transaction:",
                                                  err
                                                );
                                                connection.rollback(() => {
                                                  connection.end();
                                                  return res.status(400).send({
                                                    status: true,
                                                    message:
                                                      "Kombinasi email & password Anda Salah",
                                                    data: [],
                                                  });
                                                });
                                                return;
                                              }
                                              connection.end();
                                              console.log(
                                                "Transaction completed successfully!"
                                              );

                                              if (cutiData.length > 0) {
                                                return res.status(200).send({
                                                  status: true,
                                                  message:
                                                    "Kombinasi email & password Anda Salah",
                                                  tipe: sysdataCuti[1].name,
                                                  sisa_cuti:
                                                    cutiData[0].saldo_cut_off +
                                                    cutiData[0]
                                                      .saldo_cuti_bulan_lalu +
                                                    cutiData[0]
                                                      .saldo_cuti_tahun_lalu +
                                                    cutiData[0].perolehan_cuti -
                                                    cutiData[0].expired_cuti -
                                                    cutiData[0].cuti_bersama -
                                                    cutiData[0].terpakai,
                                                  total_cuti: 0,
                                                  keterangan:
                                                    "Anda memiliki beberapa pengajuan cuti",
                                                });
                                              } else {
                                                return res.status(200).send({
                                                  status: true,
                                                  message:
                                                    "Kombinasi email & password Anda Salah",
                                                  tipe: sysdataCuti[1].name,
                                                  sisa_cuti: 0,
                                                  total_cuti: 0,
                                                  keterangan:
                                                    "Anda memiliki beberapa pengajuan cuti",
                                                });
                                              }

                                            });
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          });
                        }
                      );
                    }
                  });
                });
              });
            });
          } catch ($e) {
            return res.status(400).send({
              status: true,
              message: "Gagal ambil data",
              data: [],
            });
          }
        }
      } 