emp_leave_load_dinasluar(req, res) {
    console.log("-----hoistory dinas luar dengan periode----------");
    var database = req.query.database;

    var em_id = req.body.em_id;
    var bulan = req.body.bulan;
    var tahun = req.body.tahun;

    const convertYear = tahun.substring(2, 4);
    var convertBulan;
    if (bulan.length == 1) {
      convertBulan = bulan <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

    const configDynamic = {
      multipleStatements: true,
      host: ipServer, //my${database}.siscom.id (ip local)
      user: "pro",
      password: "Siscom3519",
      database: `${namaDatabaseDynamic}`,
      connectionLimit: 1000,
      connectTimeout: 60 * 60 * 1000,
      acquireTimeout: 60 * 60 * 1000,
      timeout: 60 * 60 * 1000,
    };
    const mysql = require("mysql");
    const poolDynamic = mysql.createPool(configDynamic);

    var startPeriode =
      req.query.start_periode == undefined
        ? "2024-02-03"
        : req.query.start_periode;
    var endPeriode =
      req.query.end_periode == undefined ? "2024-02-03" : req.query.end_periode;
    var array1 = startPeriode.split("-");
    var array2 = endPeriode.split("-");

    const startPeriodeDynamic = `${database}_hrm${array1[0].substring(2, 4)}${
      array1[1]
    }`;
    const endPeriodeDynamic = `${database}_hrm${array2[0].substring(2, 4)}${
      array2[1]
    }`;

    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    var url = `SELECT * FROM ${namaDatabaseDynamic}.emp_leave WHERE em_id='${em_id}' AND ajuan='4' AND status_transaksi='1' AND atten_date>='${startPeriode}' AND atten_date<='${endPeriode}' ORDER BY id DESC;`;

    if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
      url = `
      SELECT emp_leave.id as idd,emp_leave.* FROM ${startPeriodeDynamic}.emp_leave WHERE em_id='${em_id}' AND ajuan='4' AND status_transaksi='1' AND atten_date>='${startPeriode}' AND atten_date<='${endPeriode}' 

      UNION ALL

      SELECT emp_leave. id as  idd,emp_leave.* FROM ${endPeriodeDynamic}.emp_leave WHERE em_id='${em_id}' AND ajuan='4' AND status_transaksi='1' AND atten_date>='${startPeriode}' AND atten_date<='${endPeriode}'
      
      ORDER BY idd DESC
      `;
    }

    console.log(url);

    poolDynamic.getConnection(function (err, connection) {
      if (err) {
        res.send({
          status: false,
          message: "Database tidak di temukan",
          data: [],
        });
      } else {
        connection.query(url, function (error, results) {
          connection.release();
          if (error != null) console.log(error);
          res.send({
            status: true,
            message: "Berhasil ambil data!",
            jumlah_data: results.length,
            data: results,
          });
        });
      }
    });
  },