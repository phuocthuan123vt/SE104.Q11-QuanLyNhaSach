// server/database.js
const mysql = require("mysql2");

// Sử dụng createPool thay vì createConnection
const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "2RfMS99VErzNfyG.root", // <--- Thay User của em
  password: "njAb1cZjWXfWrzGZ", // <--- Thay Pass của em
  database: "QuanLyNhaSach",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10, // Cho phép tối đa 10 kết nối cùng lúc
  queueLimit: 0,
  enableKeepAlive: true, // Giữ kết nối sống
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

// Kiểm tra kết nối ban đầu
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ LỖI KẾT NỐI POOL:", err.message);
  } else {
    console.log("☁️ ĐÃ KẾT NỐI DATABASE (POOL) THÀNH CÔNG!");
    connection.release(); // Trả kết nối về bể
  }
});

module.exports = pool;
