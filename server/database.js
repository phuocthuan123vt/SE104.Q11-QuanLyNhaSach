// server/database.js
const mysql = require('mysql2');

// Tạo kết nối
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tên đăng nhập mặc định của XAMPP
    password: '',      // Mặc định XAMPP không có mật khẩu (để trống)
    database: 'QuanLyNhaSach', // Tên database em đã tạo trong Workbench
    multipleStatements: true   // Để chạy được nhiều câu lệnh SQL một lúc
});

// Mở kết nối
connection.connect(error => {
    if (error) {
        console.error('❌ LỖI KẾT NỐI DATABASE:', error);
        return;
    }
    console.log('✅ ĐÃ KẾT NỐI MYSQL THÀNH CÔNG!');
});

module.exports = connection;