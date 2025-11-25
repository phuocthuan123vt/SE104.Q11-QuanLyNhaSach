// server/index.js
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Import cái file em vừa tạo ở Bước 1

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- KHU VỰC VIẾT API ---

// 1. API Lấy danh sách Sách (GET /api/sach)
app.get('/api/sach', (req, res) => {
    const sql = "SELECT * FROM SACH";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. API Test server chạy chưa
app.get('/', (req, res) => {
    res.send("Server Quản Lý Nhà Sách đang chạy ngon lành!");
});

// --- KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});