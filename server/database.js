// server/database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', // <-- Thay bằng Host của TiDB
    port: 4000,                                         // <-- Thay bằng Port của TiDB
    user: '2RfMS99VErzNfyG.root',                                // <-- Thay bằng User của TiDB
    password: 'njAb1cZjWXfWrzGZ',                      // <-- Thay bằng Password của TiDB
    database: 'QuanLyNhaSach',                          // Tên DB em muốn đặt
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    multipleStatements: true
});

connection.connect(error => {
    if (error) {
        console.error('❌ LỖI KẾT NỐI CLOUD DB:', error);
        return;
    }
    console.log('☁️ ĐÃ KẾT NỐI DATABASE TRÊN MÂY THÀNH CÔNG!');
});

module.exports = connection;