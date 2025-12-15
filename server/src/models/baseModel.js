const db = require("../config/database");

const query = async (sql, params) => {
  const [rows] = await db.promise().query(sql, params);
  return rows;
};

// Hàm lấy connection cho Transaction
const getConnection = async () => {
  return await db.promise().getConnection();
};

module.exports = { query, getConnection };
