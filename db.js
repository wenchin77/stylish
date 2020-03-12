// MySQL dataBase
const config = require("./config/db_config");
const mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 10, // default 10
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
});

// async function usePooledConnection (actionAsync) {
//     const connection = await new Promise((resolve, reject) => {
//       pool.getConnection((err, connection) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(connection);
//       });
//     });
//     try {
//       return await actionAsync(connection);
//     } finally {
//       connection.release();
//     }
//   }


module.exports =  db ;
