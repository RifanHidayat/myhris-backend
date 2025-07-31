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
  originalUrl?: string;
  cari?: string;
  tgl_ajuan?: string;
  created_on?: string;
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
    function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
      return date >= startDate && date <= endDate;
    }

    const id = dto.id;
    const nomorLb = dto.nomor_ajuan;
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
    const tasks = dto.tasks || [];
    
    console.log("task  ", tasks[0]);
    
    delete (bodyValue as any).menu_name;
    delete (bodyValue as any).activity_name;
    delete (bodyValue as any).created_by;
    delete (bodyValue as any).tasks;
    delete (bodyValue as any).nomor_ajuan;
    delete (bodyValue as any).cari;
    delete (bodyValue as any).id;

    const now = new Date();

    console.log(bodyValue);

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

    const script = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id='${id}'`;

    const databaseMaster = `${database}_hrm`;
    //var nomorLb=`LB20${convertYear}${convertBulan}`;
    const updateScript = `UPDATE ${namaDatabaseDynamic}.emp_labor SET ? WHERE id='${id}'`;

    console.log(updateScript);

    let transaksi = "";

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

          connection.query(
            `SELECT * FROM ${namaDatabaseDynamic}.emp_leave 
                        WHERE em_id='${dto.em_id}' 
                        AND (date_selected LIKE '%${dto.atten_date}%')  
                        AND  status_transaksi=1 
                         AND leave_status IN ('Pending','Approve','Approve2')`,
              (err: any, data: any[]) => {
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
                      // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                        connection.rollback(() => {
                          connection.end();
                          reject(new BadRequestException(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`));
                        });
                      return;
                    }
                  } else if (
                    dto.leave_type == "FULLDAY" ||
                    dto.leave_type == "FULL DAY"
                  ) {
                    if (data[i].ajuan == "1" || data[i].ajuan == 1) {
                      // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                        connection.rollback(() => {
                          connection.end();
                          reject(new BadRequestException(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${data[i].atten_date} dengan status ${data[0].status}`));
                        });
                      return;
                    }

                    if (data[i].ajuan == "2" || data[i].ajuan == 2) {
                      // console.error(`Kamu telah melakaukan pengajuan Sakit  pada tanggal ${req.body.atten_date}  dengan status ${data[0].leave_status}`)
                        connection.rollback(() => {
                          connection.end();
                          reject(new BadRequestException(`Kamu telah melakaukan pengajuan Sakit pada tanggal ${dto.atten_date} dengan status ${data[0].leave_status}`));
                        });
                      return;
                    }
                  }
                }
              }

              connection.query(
                `SELECT * FROM ${namaDatabaseDynamic}.emp_labor WHERE em_id='${dto.em_id}' AND atten_date='${dto.atten_date}' AND status_transaksi=1 AND ( ajuan='1' OR ajuan='2') AND status IN ('Pending','Approve','Approve2') AND id!='${id}'`,
                  (err: any, data: any[]) => {
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
                        // console.error(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`)
                          connection.rollback(() => {
                            connection.end();
                            reject(new BadRequestException(`Kamu telah melakaukan pengajuan ${transaksi} pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`));
                          });
                        return;
                      } else {
                        if (isDateInRange(timeParam2, time1, time2)) {
                          console.error(
                            `Kamu telah melakaukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`
                          );
                            connection.rollback(() => {
                              connection.end();
                              reject(new BadRequestException(`Kamu telah melakaukan pengajuan lembur pada tanggal ${time1} s.d. ${time2} dengan status ${data[0].status}`));
                            });
                          return;
                        }
                      }
                    }
                  }

                    connection.query(script, [bodyValue], (err: any, results: any) => {
                    if (err) {
                        console.error("Error executing UPDATE statement:", err);
                      connection.rollback(() => {
                        connection.end();
                          reject(new InternalServerErrorException('Update failed'));
                        });
                        return;
                    }

                    connection.query(
                      `UPDATE ${database}_hrm.overtime SET pakai='Y' WHERE id='${bodyValue.typeid}' `,
                      [bodyValue],
                        (err: any, updateEmpLabor: any) => {
                        if (err) {
                          console.error(
                              "Error executing UPDATE statement:",
                            err
                          );
                          connection.rollback(() => {
                            connection.end();
                              reject(new InternalServerErrorException('Update overtime failed'));
                            });
                            return;
                        }

                        //Proses Notifikasi
                        connection.query(
                          "SELECT name FROM sysdata WHERE KODE IN (024)",
                            (err: any, sysData: any[]) => {
                            if (err) {
                              console.error(
                                "Error executing SELECT statement:",
                                err
                              );
                              connection.rollback(() => {
                                connection.end();
                                  reject(new InternalServerErrorException('Database query failed'));
                                });
                                return;
                            }

                            connection.query(
                              `SELECT * FROM  ${databaseMaster}.employee WHERE em_id='${bodyValue.em_id}' `,
                                (err: any, user: any[]) => {
                                if (err) {
                                  console.error(
                                    "Error executing SELECT statement:",
                                    err
                                  );
                                  connection.rollback(() => {
                                    connection.end();
                                      reject(new InternalServerErrorException('Database query failed'));
                                    });
                                    return;
                                }

                                connection.query(
                                  `DELETE FROM ${namaDatabaseDynamic}.emp_labor_task WHERE emp_labor_id = ${id}`,
                                    (err: any, deleteResult: any) => {
                                    if (err) {
                                      console.error(
                                          "Error executing DELETE statement:",
                                        err
                                      );
                                      connection.rollback(() => {
                                        connection.end();
                                          reject(new InternalServerErrorException('Delete failed'));
                                        });
                                        return;
                                      }

                                      // Insert tasks
                                      let taskIndex = 0;
                                      const insertTasks = () => {
                                        if (taskIndex >= tasks.length) {
                                          // All tasks inserted, commit transaction
                                          const title = "Approval Lembur";
                                          connection.commit((err: any) => {
                                          if (err) {
                                            console.error(
                                                "Error committing transaction:",
                                              err
                                            );
                                            connection.rollback(() => {
                                              connection.end();
                                                reject(new InternalServerErrorException('Commit failed'));
                                              });
                                              return;
                                            }
                                            connection.end();
                                            console.log(
                                              "Transaction completed successfully!"
                                            );
                                            resolve({ success: true, message: "Update berhasil" });
                                          });
                                          return;
                                        }

                                        const task = tasks[taskIndex]["task"];
                                        const level = tasks[taskIndex]["level"];
                                        console.log(tasks);
                                        
                                        connection.query(
                                          `INSERT INTO ${namaDatabaseDynamic}.emp_labor_task (task,persentase,emp_labor_id,level) VALUES('${task}','0',${id},${level})`,
                                          (err: any, insertResult: any) => {
                                      if (err) {
                                        console.error(
                                                "Error executing INSERT statement:",
                                          err
                                        );
                                        connection.rollback(() => {
                                          connection.end();
                                                reject(new InternalServerErrorException('Insert task failed'));
                                              });
                                          return;
                                        }
                                            taskIndex++;
                                            insertTasks();
                                      }
                                      );
                                      };

                                      insertTasks();
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
            );
          });
        });
      });
    } catch (error) {
      console.error("Error in updateLembur:", error);
      throw new InternalServerErrorException('Update lembur failed');
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
} 