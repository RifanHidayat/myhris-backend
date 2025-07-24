async tipeCuti(req, res) {
  
    var database = req.query.database;
    var email = req.query.email;
    var periode = req.body.periode;
    var emId = req.query.em_id;
    var durasi = req.body.durasi;
    console.log("durasi ",req.body.durasi);
    var dates =
      req.query.dates == undefined ? "2024-08,2024-09" : req.query.dates;

    console.log(req.query);

    var query = ``;

    var datesplits = dates.split(",");

    query = `SELECT * FROM ${database}_hrm.leave_types WHERE (submission_period<='${durasi}'  OR backdate=0 ) AND  status IN (1) `;
    console.log(query);
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction;
      const [result] = await conn.query(query);
      console.log(result);
      await conn.commit();
      return res.status(200).send({
        status: true,
        
        message: "Succsefully get tipe cuti",
        data: result,
      });
    } catch (e) {
      if (conn) {
        await conn.rollback();
      }
      console.error("Error ouy", e);
      return res.status(400).send({
        status: false,
        message: "ERRoe",
      });
    } finally {
      if (conn) await conn.release();
    }

 
  },