async berhubunganDengan(req, res) {
    console.log("-----------Berhubungan dengan----------");
    var database = req.query.database;
    var dep_id = req.body.dep_id;
    var branchId = req.headers.branch_id;

    var query1 = ` SELECT * FROM ${database}_hrm.employee JOIN branch ON employee.branch_id=branch.id WHERE STATUS='ACTIVE' AND branch_id=${branchId} ORDER BY full_name ASC `;
    var query2 = `SELECT * FROM ${database}_hrm.employee WHERE dep_id='${dep_id}' AND branch_id=${branchId} AND status='ACTIVE' ORDER BY full_name ASC `;

    var url;
    if (dep_id == "0" || dep_id == 0) {
      url = query1;
      console.log(query1);
    } else {
      url = query2;
      console.log(query2);
    }
    const connection = await model.createConnection1(`${database}_hrm`);
    let conn;
    try {
      conn = await connection.getConnection();
      await conn.beginTransaction();
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
      console.error("error", e);
      return res.status(400).send({
        status: false,
        message: "Gagal ambil data",
      });
    } finally {
      if (conn) await conn.release();
    }
  },