const db = require("../db.js");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// 以 table 分

async function getUserByToken (token) {
  const users = await query(
    `SELECT * FROM user WHERE access_token = '${token}'`
  );
  return users[0];
};

async function getUserByEmail (email) {
  const users = await query(
    `SELECT * FROM user WHERE email = '${email}'`
  );
  return users[0];
};


async function updateUserByEmail (token, time, email) {
  return await query(
    `UPDATE user SET access_token = '${token}', last_signin_date = '${time}' WHERE email = '${email}'`
  );
}

async function addUser (data) {
  const sql = 'INSERT INTO user SET ?';
  return await query (sql, data);
};




module.exports = { 
  getUserByToken,
  getUserByEmail, 
  updateUserByEmail,
  addUser
}