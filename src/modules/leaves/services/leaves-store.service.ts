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
  url?: string;
  start_periode?: string;
  end_periode?: string;
  atten_date?: string;
  [key: string]: any;
}

// TODO: Pastikan model diimport dari lokasi yang benar
const model = require('../../../common/model');
const utility = require('../../../common/utility');

/**
 * Service untuk menyimpan data Cuti
 */
@Injectable()
export class LeavesStoreService {

  async store(dto: LeavesStoreDto): Promise<any> {
    function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
      return date >= startDate && date <= endDate;
    }

    const database = dto.database;
    const name_url = dto.url || '';
    const convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    const nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + dto.database, "")
      .replace("&start_periode=" + (dto.start_periode || ""), "")
      .replace("&end_periode=" + (dto.end_periode || ""), "");

    const menu_name = dto.menu_name;
    const activity_name = dto.activity_name;
    const createdBy = dto.created_by;

    const bodyValue = { ...dto } as any;
    const cutLeave = dto.cut_leave || 0;
    const jumlahCuti = dto.total_cuti || 0;
    
    delete (bodyValue as any).cut_leave;
    delete (bodyValue as any).total_cuti;
    delete (bodyValue as any).menu_name;
    delete (bodyValue as any).activity_name;
    delete (bodyValue as any).created_by;
    
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
    
    bodyValue.created_on = dateNow;
    bodyValue.is_mobile = "1";

    let isError = false;
    let pesan = "";

    const array = dto.date_selected.split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);
    let convertBulan: string;
    
    if (array[1].length == 1) {
      convertBulan = parseInt(array[1]) <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }
    
    const databaseMaster = `${database}_hrm`;
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    let nomorLb = `CT20${convertYear}${convertBulan}`;
    const script = `INSERT INTO ${namaDatabaseDynamic}.emp_leave SET ?`;
    let transaksi = "";
    
    console.log("-------buat cuti--------");
    
    try {
      const connection = await model.createConnection(database);
      
      return new Promise((resolve, reject) => {
        connection.connect((err: any) => {
          if (err) {
            console.error("Error connecting to the database:", err);
            reject(new InternalServerErrorException('Database connection failed'));
            return;
          }

          connection.beginTransaction((err: any) => {
            if (err) {
              console.error("Error beginning transaction:", err);
              connection.end();
              reject(new InternalServerErrorException('Transaction failed'));
              return;
            }

            let query = "";
            const splits = dto.date_selected.split(",");

            const queryPendingPotongCuti = `
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

            for (let i = 0; i < splits.length; i++) {
              console.log(i);

              const subQuery = `  
                SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                WHERE em_id='${dto.em_id}' 
                AND date_selected LIKE '%${splits[i]}%'  
                AND status_transaksi=1 
                AND leave_status IN ('Pending','Approve','Approve2')`;

              if (i === 0) {
                query = subQuery;
              } else {
                query += ` UNION ALL ${subQuery}`;
              }
            }
            console.log(query);

            connection.query(query, (err: any, data: any[]) => {
              if (err) {
                console.error("Error executing SELECT statement:", err);
                connection.rollback(() => {
                  connection.end();
                  reject(new InternalServerErrorException('Database query failed'));
                });
                return;
              }

              connection.query(queryPendingPotongCuti, (err: any, dataPending: any[]) => {
                if (err) {
                  console.error("Error executing SELECT statement:", err);
                  connection.rollback(() => {
                    connection.end();
                    reject(new InternalServerErrorException('Database query failed'));
                  });
                  return;
                }
                
                console.log(queryPendingPotongCuti);
                console.log(dataPending);
                console.log(jumlahCuti);
                console.log(cutLeave);
                
                const totalLeaveDuration = (dataPending[0]?.total_leave_duration || 0) + dto.leave_duration;
                
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
                      const time1 = new Date(
                        `${data[i].atten_date}T${data[i].time_plan}`
                      );
                      const time2 = new Date(
                        `${data[i].atten_date}T${data[i].time_plan_to}`
                      );
                      if (time1 > time2) {
                        time2.setDate(time2.getDate() + 1);
                      }

                      if (timeParam1 > timeParam2) {
                        timeParam2.setDate(timeParam2.getDate() + 1);
                      }

                      transaksi = "Izin";

                      if (isDateInRange(timeParam1, time1, time2)) {
                        isError = true;
                        pesan = `Kamu telah melakukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`;
                      }
                    } else if (
                      dto.leave_type == "FULLDAY" ||
                      dto.leave_type == "FULL DAY" ||
                      dto.leave_type == "Full Day"
                    ) {
                      console.log(data[i].ajuan);

                      if (data[i].ajuan == "1" || data[i].ajuan == 1) {
                        isError = true;
                        pesan = `Kamu telah melakukan pengajuan Cuti pada tanggal ${dto.date_selected} dengan status ${data[i].leave_status}`;
                      }

                      if (data[i].ajuan == "2" || data[i].ajuan == 2) {
                        isError = true;
                        pesan = `Kamu telah melakukan pengajuan Sakit pada tanggal ${dto.date_selected} dengan status ${data[i].leave_status}`;
                      }
                    }
                  }
                }
                
                connection.query(query, (err: any, data: any[]) => {
                  if (err) {
                    console.error("Error executing SELECT statement:", err);
                    connection.rollback(() => {
                      connection.end();
                      reject(new InternalServerErrorException('Database query failed'));
                    });
                    return;
                  }

                  for (let i = 0; i < data.length; i++) {
                    if (data.length > 0) {
                      const timeParam1 = new Date(
                        `${dto.atten_date}T${dto.dari_jam}`
                      );
                      const timeParam2 = new Date(
                        `${dto.atten_date}T${dto.sampai_jam}`
                      );

                      /// jika suda ada data
                      const time1 = new Date(
                        `${data[i].atten_date}T${data[i].dari_jam}`
                      );
                      const time2 = new Date(
                        `${data[i].atten_date}T${data[i].sampai_jam}`
                      );

                      if (time1 > time2) {
                        time2.setDate(time2.getDate() + 1);
                      }

                      if (timeParam1 > timeParam2) {
                        timeParam2.setDate(timeParam2.getDate() + 1);
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
                      } else {
                        if (isDateInRange(timeParam2, time1, time2)) {
                          isError = true;
                          pesan = `Kamu telah melakukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`;
                        }
                      }
                    }
                  }
                  
                  console.log("is error", isError);

                  if (isError === true) {
                    connection.end();
                    resolve({
                      status: false,
                      message: pesan,
                      data: [],
                    });
                    return;
                  } else {
                    connection.query(
                      `SELECT nomor_ajuan FROM ${namaDatabaseDynamic}.emp_leave WHERE nomor_ajuan LIKE '%CT%' ORDER BY id DESC LIMIT 1`,
                      (err: any, results: any[]) => {
                        if (err) {
                          console.error("Error executing SELECT statement:", err);
                          connection.rollback(() => {
                            connection.end();
                            reject(new InternalServerErrorException('Database query failed'));
                          });
                          return;
                        }

                        if (results.length > 0) {
                          const text = results[0]["nomor_ajuan"];
                          const nomor = parseInt(text.substring(8, 13)) + 1;
                          const nomorStr = String(nomor).padStart(4, "0");
                          nomorLb = nomorLb + nomorStr;
                        } else {
                          const nomor = 1;
                          const nomorStr = String(nomor).padStart(4, "0");
                          nomorLb = nomorLb + nomorStr;
                        }
                        
                        bodyValue.nomor_ajuan = nomorLb;
                        const dates = bodyValue.date_selected.split(",");
                        bodyValue.start_date = dates[0];
                        bodyValue.end_date = dates[dates.length - 1];
                        console.log("yah kemari berapa kali?");
                        
                        connection.query(script, [bodyValue], (err: any, results: any[]) => {
                          if (err) {
                            console.error("Error executing INSERT statement:", err);
                            connection.rollback(() => {
                              connection.end();
                              reject(new InternalServerErrorException('Insert failed'));
                            });
                            return;
                          }
                          
                          connection.query(
                            `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE nomor_ajuan='${bodyValue.nomor_ajuan}'`,
                            (err: any, transaksi: any[]) => {
                              if (err) {
                                console.error("Error executing SELECT statement:", err);
                                connection.rollback(() => {
                                  connection.end();
                                  reject(new InternalServerErrorException('Database query failed'));
                                });
                                return;
                              }

                              connection.query(
                                `SELECT * FROM ${databaseMaster}.employee WHERE em_id='${bodyValue.em_id}'`,
                                (err: any, employee: any[]) => {
                                  if (err) {
                                    console.error("Error executing SELECT statement:", err);
                                    connection.rollback(() => {
                                      connection.end();
                                      reject(new InternalServerErrorException('Database query failed'));
                                    });
                                    return;
                                  }
                                  
                                  connection.query(
                                    `SELECT * FROM sysdata WHERE kode IN ('031','012')`,
                                    (err: any, sysdataCuti: any[]) => {
                                      if (err) {
                                        console.error("Error executing SELECT statement:", err);
                                        connection.rollback(() => {
                                          connection.end();
                                          reject(new InternalServerErrorException('Database query failed'));
                                        });
                                        return;
                                      }

                                      connection.query(
                                        `SELECT * FROM assign_leave WHERE em_id='${bodyValue.em_id}' AND dateyear='${tahun}'`,
                                        (err: any, cutiData: any[]) => {
                                          if (err) {
                                            console.error("Error executing SELECT statement:", err);
                                            connection.rollback(() => {
                                              connection.end();
                                              reject(new InternalServerErrorException('Database query failed'));
                                            });
                                            return;
                                          }
                                          
                                          const delegationIds = employee[0].em_report_to
                                            ? Array.isArray(employee[0].em_report_to)
                                              ? employee[0].em_report_to
                                              : [employee[0].em_report_to]
                                            : [];

                                          const emIds = employee[0].em_report2_to
                                            ? Array.isArray(employee[0].em_report2_to)
                                              ? employee[0].em_report2_to
                                              : [employee[0].em_report2_to]
                                            : [];

                                          const combinedIds = [...new Set([
                                            ...delegationIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase())),
                                            ...emIds.flatMap(id => id.split(',').map(i => i.trim().toUpperCase()))
                                          ])];
                                          
                                          console.log('ini syy data cuti ', sysdataCuti[1]);
                                          
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

                                          connection.commit((err: any) => {
                                            if (err) {
                                              console.error("Error committing transaction:", err);
                                              connection.rollback(() => {
                                                connection.end();
                                                reject(new InternalServerErrorException('Commit failed'));
                                              });
                                              return;
                                            }
                                            connection.end();
                                            console.log("Transaction completed successfully!");

                                            if (cutiData.length > 0) {
                                              resolve({
                                                status: true,
                                                message: "Successfully insert data",
                                                tipe: sysdataCuti[1].name,
                                                sisa_cuti:
                                                  cutiData[0].saldo_cut_off +
                                                  cutiData[0].saldo_cuti_bulan_lalu +
                                                  cutiData[0].saldo_cuti_tahun_lalu +
                                                  cutiData[0].perolehan_cuti -
                                                  cutiData[0].expired_cuti -
                                                  cutiData[0].cuti_bersama -
                                                  cutiData[0].terpakai,
                                                total_cuti: 0,
                                                keterangan: "Anda memiliki beberapa pengajuan cuti",
                                              });
                                            } else {
                                              resolve({
                                                status: true,
                                                message: "Successfully insert data",
                                                tipe: sysdataCuti[1].name,
                                                sisa_cuti: 0,
                                                total_cuti: 0,
                                                keterangan: "Anda memiliki beberapa pengajuan cuti",
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
        });
      });
    } catch (error) {
      console.error("Error in store:", error);
      throw new InternalServerErrorException('Gagal menyimpan data cuti');
    }
  }
}   