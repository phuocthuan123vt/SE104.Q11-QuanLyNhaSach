const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const SECRET_KEY = 'doan-tot-nghiep-2024'; // Khóa bí mật cho Token

app.use(cors());
app.use(express.json());

// ==========================================
// 1. API XÁC THỰC (AUTHENTICATION)
// ==========================================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM TAI_KHOAN WHERE TenDangNhap = ?";
    
    db.query(sql, [username], async (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(401).json({ error: "Tài khoản không tồn tại!" });

        const user = data[0];
        // So sánh mật khẩu đã mã hóa
        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) return res.status(401).json({ error: "Mật khẩu không đúng!" });

        // Tạo Token
        const token = jwt.sign({ id: user.Id, role: user.Quyen, name: user.HoTen }, SECRET_KEY, { expiresIn: '1d' });
        
        res.json({ message: "Login thành công", token, user: { hoTen: user.HoTen, quyen: user.Quyen } });
    });
});

// ==========================================
// 2. API DANH MỤC (GET)
// ==========================================

app.get('/api/sach', (req, res) => {
    db.query("SELECT * FROM SACH", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/api/khach-hang', (req, res) => {
    db.query("SELECT * FROM KHACH_HANG", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/api/quy-dinh', (req, res) => {
    db.query("SELECT * FROM THAM_SO", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// ==========================================
// 3. API NGHIỆP VỤ (TRANSACTION)
// ==========================================

// Cập nhật Quy định
app.post('/api/quy-dinh', (req, res) => {
    const { quyDinh } = req.body;
    let queries = "";
    const values = [];
    for (const [key, value] of Object.entries(quyDinh)) {
        queries += "UPDATE THAM_SO SET GiaTri = ? WHERE MaThamSo = ?; ";
        values.push(value, key);
    }
    db.query(queries, values, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Cập nhật thành công!" });
    });
});

// Nhập Sách
app.post('/api/nhap-sach', async (req, res) => {
    const { danhSachSachNhap } = req.body;
    let tongTien = 0;
    danhSachSachNhap.forEach(item => { tongTien += item.soLuong * item.donGia; });

    db.beginTransaction(err => {
        if (err) return res.status(500).json(err);
        
        // Tạo phiếu nhập
        db.query("INSERT INTO PHIEU_NHAP (TongTien) VALUES (?)", [tongTien], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            const maPhieuNhap = result.insertId;

            const queries = danhSachSachNhap.map(sach => {
                return new Promise((resolve, reject) => {
                    const thanhTien = sach.soLuong * sach.donGia;
                    // Lưu chi tiết
                    db.query("INSERT INTO CT_PHIEU_NHAP (MaPhieuNhap, MaSach, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?)", 
                        [maPhieuNhap, sach.maSach, sach.soLuong, sach.donGia, thanhTien], (err) => {
                        if (err) return reject(err);
                        // Cập nhật kho và giá nhập mới
                        db.query("UPDATE SACH SET SoLuongTon = SoLuongTon + ?, DonGiaNhapGanNhat = ? WHERE MaSach = ?", 
                            [sach.soLuong, sach.donGia, sach.maSach], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            });

            Promise.all(queries).then(() => {
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ message: 'Nhập sách thành công!' });
                });
            }).catch(err => {
                db.rollback(() => res.status(500).json({ error: 'Lỗi nhập sách', details: err }));
            });
        });
    });
});

// Bán Sách (Có kiểm tra quy định động)
app.post('/api/ban-sach', async (req, res) => {
    const { maKhachHang, danhSachSachBan, soTienTra } = req.body;

    try {
        // 1. Lấy quy định từ DB
        const [thamSoDB] = await db.promise().query("SELECT * FROM THAM_SO");
        const QUY_DINH = {};
        thamSoDB.forEach(row => QUY_DINH[row.MaThamSo] = row.GiaTri);
        const tiLeGia = QUY_DINH['TiLeGiaBan'] / 100;

        // 2. Tính tiền
        let tongTien = 0;
        danhSachSachBan.forEach(s => {
            s.donGiaBan = s.donGiaNhapGanNhat * tiLeGia; 
            s.thanhTien = s.soLuong * s.donGiaBan;
            tongTien += s.thanhTien;
        });
        const conLai = tongTien - soTienTra;

        db.beginTransaction(async (err) => {
            if (err) return res.status(500).json(err);
            try {
                // Kiểm tra Nợ
                const [khach] = await db.promise().query("SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?", [maKhachHang]);
                if (khach[0].TienNoHienTai + conLai > QUY_DINH['MaxNo']) throw "Khách hàng nợ quá giới hạn cho phép!";

                // Kiểm tra Tồn kho
                for (let s of danhSachSachBan) {
                    const [sachDB] = await db.promise().query("SELECT SoLuongTon FROM SACH WHERE MaSach = ?", [s.maSach]);
                    if (sachDB[0].SoLuongTon - s.soLuong < QUY_DINH['MinTonSauBan']) throw `Sách ${s.maSach} vi phạm quy định tồn tối thiểu!`;
                }

                // Lưu Hóa đơn
                const [resultHD] = await db.promise().query("INSERT INTO HOA_DON (MaKhachHang, TongTien, SoTienTra, ConLai) VALUES (?, ?, ?, ?)", [maKhachHang, tongTien, soTienTra, conLai]);
                const maHoaDon = resultHD.insertId;

                // Lưu Chi tiết & Trừ kho
                for (let s of danhSachSachBan) {
                    await db.promise().query("INSERT INTO CT_HOA_DON (MaHoaDon, MaSach, SoLuong, DonGiaBan, ThanhTien) VALUES (?, ?, ?, ?, ?)", [maHoaDon, s.maSach, s.soLuong, s.donGiaBan, s.thanhTien]);
                    await db.promise().query("UPDATE SACH SET SoLuongTon = SoLuongTon - ? WHERE MaSach = ?", [s.soLuong, s.maSach]);
                }

                // Cộng nợ
                if (conLai > 0) await db.promise().query("UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai + ? WHERE MaKhachHang = ?", [conLai, maKhachHang]);

                db.commit(() => res.json({ message: "Bán sách thành công!" }));
            } catch (error) {
                db.rollback(() => res.status(400).json({ error: error.toString() }));
            }
        });
    } catch (e) { res.status(500).json(e); }
});

// Thu Tiền
app.post('/api/thu-tien', (req, res) => {
    const { maKhachHang, soTienThu } = req.body;
    db.beginTransaction(async (err) => {
        if (err) return res.status(500).json(err);
        try {
            // Check quy định thu
            const [thamSoDB] = await db.promise().query("SELECT * FROM THAM_SO WHERE MaThamSo = 'KiemTraThuTien'");
            const isCheckThuTien = thamSoDB[0].GiaTri === 1;

            const [khach] = await db.promise().query("SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?", [maKhachHang]);
            if (isCheckThuTien && soTienThu > khach[0].TienNoHienTai) throw `Tiền thu vượt quá nợ hiện tại!`;

            await db.promise().query("INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)", [maKhachHang, soTienThu]);
            await db.promise().query("UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai - ? WHERE MaKhachHang = ?", [soTienThu, maKhachHang]);

            db.commit(() => res.json({ message: "Thu tiền thành công!" }));
        } catch (error) {
            db.rollback(() => res.status(400).json({ error: error.toString() }));
        }
    });
});

// ==========================================
// 4. API BÁO CÁO (REPORTS)
// ==========================================

app.get('/api/bao-cao/ton', (req, res) => {
    const { thang, nam } = req.query;
    const sql = `
        SELECT s.MaSach, s.TenSach, s.SoLuongTon as TonCuoi,
            COALESCE(SUM(ctpn.SoLuongNhap), 0) as PhatSinhNhap, 
            COALESCE(SUM(cthd.SoLuong), 0) as PhatSinhXuat
        FROM SACH s
        LEFT JOIN CT_PHIEU_NHAP ctpn ON s.MaSach = ctpn.MaSach AND MONTH((SELECT NgayNhap FROM PHIEU_NHAP WHERE MaPhieuNhap = ctpn.MaPhieuNhap)) = ? AND YEAR((SELECT NgayNhap FROM PHIEU_NHAP WHERE MaPhieuNhap = ctpn.MaPhieuNhap)) = ?
        LEFT JOIN CT_HOA_DON cthd ON s.MaSach = cthd.MaSach AND MONTH((SELECT NgayLap FROM HOA_DON WHERE MaHoaDon = cthd.MaHoaDon)) = ? AND YEAR((SELECT NgayLap FROM HOA_DON WHERE MaHoaDon = cthd.MaHoaDon)) = ?
        GROUP BY s.MaSach
    `;
    db.query(sql, [thang, nam, thang, nam], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data.map(i => ({...i, TonDau: i.TonCuoi - i.PhatSinhNhap + i.PhatSinhXuat})));
    });
});

app.get('/api/bao-cao/cong-no', (req, res) => {
    const { thang, nam } = req.query;
    const sql = `
        SELECT kh.MaKhachHang, kh.HoTen, kh.TienNoHienTai as NoCuoi,
            COALESCE(SUM(CASE WHEN hd.ConLai > 0 THEN hd.ConLai ELSE 0 END), 0) as PhatSinhTang,
            COALESCE(SUM(pt.SoTienThu), 0) as PhatSinhGiam
        FROM KHACH_HANG kh
        LEFT JOIN HOA_DON hd ON kh.MaKhachHang = hd.MaKhachHang AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?
        LEFT JOIN PHIEU_THU_TIEN pt ON kh.MaKhachHang = pt.MaKhachHang AND MONTH(pt.NgayThu) = ? AND YEAR(pt.NgayThu) = ?
        GROUP BY kh.MaKhachHang
    `;
    db.query(sql, [thang, nam, thang, nam], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data.map(i => ({...i, NoDau: i.NoCuoi - i.PhatSinhTang + i.PhatSinhGiam})));
    });
});

app.listen(port, () => console.log(`🚀 Server đang chạy tại http://localhost:${port}`));