async List(req, res) {
    console.log(
      "-----hoistory data dengan start periode and periode----------"
    );
    var database = req.query.database;
    let name_url = req.originalUrl;
    var convert1 = name_url
      .substring(name_url.lastIndexOf("/") + 1)
      .replace("?database=" + req.query.database, "")
      .replace("&start_periode=" + req.query.start_periode, "")
      .replace("&end_periode=" + req.query.end_periode, "");

    console.log(convert1);
    var convert2 = convert1.substring(convert1.lastIndexOf("-") + 1);

    console.log("convert 2", convert2);

    var em_id = req.body.em_id;
    var bulan = req.body.bulan;
    var tahun = req.body.tahun;
    var branchId = req.headers.branch_id;

    const convertYear = tahun.substring(2, 4);
    var convertBulan;
    if (bulan.length == 1) {
      convertBulan = bulan <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

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
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      var url;
      if (
        convert2 == "emp_labor" ||
        convert2 == "emp_leave" ||
        convert2 == "emp_claim"
      ) {
        if (convert2 == "emp_labor") {
          url = ` 
            SELECT emp_labor.status as leave_status, emp_labor.*,overtime.name as type,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')    ORDER BY id DESC`;

          if (
            montStart < monthEnd ||
            date1.getFullYear() < date2.getFullYear()
          ) {
            url = `
              SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${startPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'  
              UNION ALL
              SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${endPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND ( tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'
              ORDER BY idd
              `;
          }
        } else if (convert2 == "emp_claim") {
          url = `SELECT emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') `;

          if (
            montStart < monthEnd ||
            date1.getFullYear() < date2.getFullYear()
          ) {
            url = `
              SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')    
              UNION ALL
              SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') 
              ORDER BY idd
              `;
          }
        } else {
          url = `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
        }
      } else {
        url = `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
      }
      console.log(url);
      const [results] = await conn.query(url);
      await conn.commit();
      return res.status(200).send({
        status: true,
        message: "Successfuly get data",
        data: results,
      });
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("eroor : ", e);
      return res.status(400).send({
        status: false,
        message: "Terjadi kesalahan",
        data: [],
      });
    } finally {
      if (conn) await conn.release();
    }
  },  async historyData(req, res) {
    console.log(
      "-----hoistory data dengan start periode and periode----------"
    );
    var database = req.query.database;
    let name_url = req.originalUrl;
    var convert1 = name_url
      .substring(name_url.lastIndexOf("/") + 1)
      .replace("?database=" + req.query.database, "")
      .replace("&start_periode=" + req.query.start_periode, "")
      .replace("&end_periode=" + req.query.end_periode, "");

    console.log(convert1);
    var convert2 = convert1.substring(convert1.lastIndexOf("-") + 1);

    console.log("convert 2", convert2);

    var em_id = req.body.em_id;
    var bulan = req.body.bulan;
    var tahun = req.body.tahun;
    var branchId = req.headers.branch_id;

    const convertYear = tahun.substring(2, 4);
    var convertBulan;
    if (bulan.length == 1) {
      convertBulan = bulan <= 9 ? `0${bulan}` : bulan;
    } else {
      convertBulan = bulan;
    }
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;

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
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      var url;
      if (
        convert2 == "emp_labor" ||
        convert2 == "emp_leave" ||
        convert2 == "emp_claim"
      ) {
        if (convert2 == "emp_labor") {
          url = ` 
            SELECT emp_labor.status as leave_status, emp_labor.*,overtime.name as type,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')    ORDER BY id DESC`;

          if (
            montStart < monthEnd ||
            date1.getFullYear() < date2.getFullYear()
          ) {
            url = `
              SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${startPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${startPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'  
              UNION ALL
              SELECT emp_labor.id as idd, emp_labor.status as leave_status, ${endPeriodeDynamic}.emp_labor.*,overtime.name as type ,overtime.dinilai FROM ${endPeriodeDynamic}.emp_labor LEFT JOIN ${database}_hrm.overtime ON overtime.id=emp_labor.typeId WHERE em_id='${em_id}' AND status_transaksi=1 AND ( tgl_ajuan<='${endPeriode}')  AND branch_id='${branchId}'
              ORDER BY idd
              `;
          }
        } else if (convert2 == "emp_claim") {
          url = `SELECT emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') `;

          if (
            montStart < monthEnd ||
            date1.getFullYear() < date2.getFullYear()
          ) {
            url = `
              SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1  AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}')    
              UNION ALL
              SELECT emp_claim.id as idd, emp_claim.*,cost.name as name  FROM  ${startPeriodeDynamic}.emp_claim JOIN ${database}_hrm.cost  ON cost.id=emp_claim.cost_id WHERE em_id='${em_id}' AND  status_transaksi=1 AND (tgl_ajuan>='${startPeriode}' AND tgl_ajuan<='${endPeriode}') 
              ORDER BY idd
              `;
          }
        } else {
          url = `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
        }
      } else {
        url = `SELECT * FROM ${convert2} WHERE em_id='${em_id}' ORDER BY id DESC`;
      }
      console.log(url);
      const [results] = await conn.query(url);
      await conn.commit();
      return res.status(200).send({
        status: true,
        message: "Successfuly get data",
        data: results,
      });
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("eroor : ", e);
      return res.status(400).send({
        status: false,
        message: "Terjadi kesalahan",
        data: [],
      });
    } finally {
      if (conn) await conn.release();
    }
  },