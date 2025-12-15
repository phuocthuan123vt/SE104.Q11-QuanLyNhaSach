const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "2RfMS99VErzNfyG.root", // User Cloud của bạn
  password: "njAb1cZjWXfWrzGZ", // Pass Cloud của bạn
  database: "QuanLyNhaSach",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ LỖI KẾT NỐI POOL:", err.message);
  } else {
    console.log("☁️ ĐÃ KẾT NỐI DATABASE (POOL) THÀNH CÔNG!");
    connection.release();
  }
});

module.exports = pool;
