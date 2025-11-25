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

// API Lập phiếu nhập sách
app.post('/api/nhap-sach', async (req, res) => {
    const { danhSachSachNhap } = req.body; // Frontend sẽ gửi lên một mảng danh sách sách

    // 1. Tính tổng tiền phiếu nhập
    let tongTien = 0;
    danhSachSachNhap.forEach(item => {
        tongTien += item.soLuong * item.donGia;
    });

    // Bắt đầu Transaction (Chế độ an toàn)
    db.beginTransaction(err => {
        if (err) return res.status(500).json(err);

        // 2. Tạo Phiếu Nhập
        const sqlPhieu = "INSERT INTO PHIEU_NHAP (TongTien) VALUES (?)";
        db.query(sqlPhieu, [tongTien], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json(err));
            }

            const maPhieuNhap = result.insertId; // Lấy ID phiếu vừa tạo

            // 3. Duyệt từng sách để lưu Chi tiết & Cập nhật kho
            // Dùng Promise.all để chạy xong hết mới Commit
            const queries = danhSachSachNhap.map(sach => {
                return new Promise((resolve, reject) => {
                    // 3.1 Lưu chi tiết phiếu nhập
                    const sqlChiTiet = "INSERT INTO CT_PHIEU_NHAP (MaPhieuNhap, MaSach, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?)";
                    const thanhTien = sach.soLuong * sach.donGia;
                    
                    db.query(sqlChiTiet, [maPhieuNhap, sach.maSach, sach.soLuong, sach.donGia, thanhTien], (err) => {
                        if (err) return reject(err);

                        // 3.2 Cập nhật Tồn kho và Giá nhập mới nhất trong bảng SACH
                        const sqlUpdateSach = "UPDATE SACH SET SoLuongTon = SoLuongTon + ?, DonGiaNhapGanNhat = ? WHERE MaSach = ?";
                        db.query(sqlUpdateSach, [sach.soLuong, sach.donGia, sach.maSach], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            });

            // Chờ tất cả lệnh chạy xong
            Promise.all(queries)
                .then(() => {
                    // 4. Lưu tất cả thay đổi
                    db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).json(err));
                        res.json({ message: 'Nhập sách thành công!', maPhieu: maPhieuNhap });
                    });
                })
                .catch(err => {
                    // Nếu có lỗi ở bất kỳ sách nào -> Hủy hết
                    db.rollback(() => res.status(500).json({ error: 'Lỗi khi nhập sách', details: err }));
                });
        });
    });
});