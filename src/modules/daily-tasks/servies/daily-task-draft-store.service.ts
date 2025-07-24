async insertDraft(req, res) {
    var database = req.query.database;
    var em_id = req.body.em_id;
    var array = req.body.atten_date.split("-");
    var listTask = req.body.list_task;
    var attenDate = req.body.atten_date;
    var status = req.body.status;
    var tanggalOld = req.body.tanggal_old;

    const tahun = `${array[0]}`;
    console.log("ini tahun", tahun);
    const convertYear = tahun.substring(2, 4);

    const convertBulan = array[1].padStart(2, "0");
    const namaDatabaseDynamic = `${database}_hrm${convertYear}${convertBulan}`;
    const connection = await models.createConnection1(namaDatabaseDynamic);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();

      let tanggalFinal = tanggalOld === "" ? attenDate : tanggalOld;
      const [cekDailyLama] = await conn.query(
        `SELECT id FROM daily_task WHERE em_id = ? AND tgl_buat = ?`,
        [em_id, tanggalFinal]
      );

      const [cekDailyBaru] = await conn.query(
        `SELECT id FROM daily_task WHERE em_id = ? AND tgl_buat = ?`,
        [em_id, attenDate]
      );

      const [cekDaily] = await conn.query(
        `SELECT id FROM daily_task WHERE tgl_buat = '${attenDate}' AND em_id = '${em_id}'`
      );
      console.log("ini cek daily", cekDaily);
      if (cekDaily.length > 0) {
        return res.status(400).json({
          status: false,
          message: `Tugas di tanggal ${attenDate} ini sudah tersedia`,
        });
      } else {
        const queryTask = `
                INSERT INTO daily_task (em_id, tgl_buat, status_pengajuan) 
                VALUES (?, ?, ?)
            `;

        const queryDetail = `
                INSERT INTO daily_task_detail 
                (judul, rincian, tgl_finish, daily_task_id, status, level) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
        const [task] = await conn.query(queryTask, [em_id, attenDate, status]);
        const taskId = task.insertId;

        for (const item of listTask) {
          const { task, judul, status, level, tgl_finish } = item;
          var tanggal = formatDate(tgl_finish);

          await conn.query(queryDetail, [
            judul,
            task,
            tanggal,
            taskId,
            status.toString(),
            level,
          ]);
        }
      }

      await conn.commit();
      res.status(200).json({
        success: true,
        message: "Data berhasil di masukan",
      });
    } catch (error) {
      await conn.rollback();
      console.error("Insert Data Error: ", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui data: " + error.message,
      });
    } finally {
      if (conn) conn.release();
    }
  },