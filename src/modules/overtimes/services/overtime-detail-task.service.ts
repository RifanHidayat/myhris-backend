async detailTask(req, res) {
    console.log("detail task");

    var database = req.query.database;
    let name_url = req.originalUrl;
    var convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    var nameTable = convert1
      .substring(convert1.lastIndexOf("-") + 1)
      .replace("?database=" + req.query.database, "");
    var nomorAjuan = req.body.nomor_ajuan;

    var menu_name = req.body.menu_name;
    var activity_name = req.body.activity_name;
    var createdBy = req.body.created_by;

    var bodyValue = req.body;
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

    var array = utility.dateNow2().split("-");

    const tahun = `${array[0]}`;
    const convertYear = tahun.substring(2, 4);

    console.log("tahun ", tahun);
    var convertBulan;
    if (array[1].length == 1) {
      convertBulan = array[1] <= 9 ? `0${array[1]}` : array[1];
    } else {
      convertBulan = array[1];
    }

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
    const namaDatabaseDynamic = startPeriodeDynamic;
    let date1 = new Date(startPeriode);
    let date2 = new Date(endPeriode);

    const montStart = date1.getMonth() + 1;
    const monthEnd = date2.getMonth() + 1;

    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
      let query = `SELECT a.* FROM ${startPeriodeDynamic}.emp_labor_task a JOIN ${startPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}'`;
      if (montStart < monthEnd || date1.getFullYear() < date2.getFullYear()) {
        query = `SELECT a.* FROM ${startPeriodeDynamic}.emp_labor_task a JOIN ${startPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}'
    AND (a.created_on >= '${startPeriode}' AND a.created_on <= '${endPeriode}')
      UNION ALL SELECT a.* FROM ${endPeriodeDynamic}.emp_labor_task a JOIN ${endPeriodeDynamic}.emp_labor b ON b.id = '${nomorAjuan}' WHERE a.emp_labor_id = '${nomorAjuan}' AND (a.created_on >= '${startPeriode}' AND a.created_on <= '${endPeriode}')`;
      }
      console.log(query);
      const [results] = await conn.query(query);
      console.log(results);
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
      console.error("error", e);
      return res.status(400).send({
        status: false,
        message: "Gagal ambil data",
      });
    } finally {
      if (conn) await conn.release();
    }
  },