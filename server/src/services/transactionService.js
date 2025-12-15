const { getConnection, query } = require("../models/baseModel");

// 1. NHẬP SÁCH
exports.importBooks = async (danhSachSachNhap) => {
  let tongTien = danhSachSachNhap.reduce((s, i) => s + i.soLuong * i.donGia, 0);
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));

    for (let item of danhSachSachNhap) {
      if (item.soLuong < QD["MinNhap"])
        throw new Error(`Sách ${item.tenSach}: Nhập < ${QD["MinNhap"]}`);
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      if (sachDB[0].SoLuongTon > QD["MinTonTruocNhap"])
        throw new Error(
          `Sách ${item.tenSach}: Tồn > ${QD["MinTonTruocNhap"]}, không được nhập`
        );
    }

    const [r] = await conn.query(
      "INSERT INTO PHIEU_NHAP (TongTien) VALUES (?)",
      [tongTien]
    );
    const maPhieu = r.insertId;

    for (let item of danhSachSachNhap) {
      const tt = item.soLuong * item.donGia;
      await conn.query(
        "INSERT INTO CT_PHIEU_NHAP (MaPhieuNhap, MaSach, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?)",
        [maPhieu, item.maSach, item.soLuong, item.donGia, tt]
      );
      await conn.query(
        "UPDATE SACH SET SoLuongTon = SoLuongTon + ?, DonGiaNhapGanNhat = ? WHERE MaSach = ?",
        [item.soLuong, item.donGia, item.maSach]
      );
    }

    await conn.commit();
    return { message: "Nhập thành công" };
  } catch (e) {
    if (conn) await conn.rollback();
    throw e;
  } finally {
    if (conn) conn.release();
  }
};

// 2. BÁN SÁCH
exports.sellBooks = async (maKhachHang, danhSachSachBan, soTienTra) => {
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    // Lấy tham số
    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));
    const tiLeGia = QD["TiLeGiaBan"] / 100;
    const isCheckThuTien = QD["KiemTraThuTien"] === 1;

    // Tính toán
    let tongTienHoaDon = 0;
    for (let item of danhSachSachBan) {
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon, DonGiaNhapGanNhat, TenSach FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      if (sachDB.length === 0)
        throw new Error(`Sách ID ${item.maSach} không tồn tại`);

      const giaBan = sachDB[0].DonGiaNhapGanNhat * tiLeGia;
      item.donGiaBan = giaBan;
      item.thanhTien = item.soLuong * giaBan;
      tongTienHoaDon += item.thanhTien;

      if (sachDB[0].SoLuongTon - item.soLuong < QD["MinTonSauBan"]) {
        throw new Error(
          `Sách "${sachDB[0].TenSach}" vi phạm tồn tối thiểu (${QD["MinTonSauBan"]}) sau khi bán!`
        );
      }
    }

    // Phân bổ tiền
    let tienTraChoHoaDon = 0;
    let tienThuNoCu = 0;
    let noPhatSinh = 0;

    if (soTienTra >= tongTienHoaDon) {
      tienTraChoHoaDon = tongTienHoaDon;
      tienThuNoCu = soTienTra - tongTienHoaDon;
      noPhatSinh = 0;
    } else {
      tienTraChoHoaDon = soTienTra;
      tienThuNoCu = 0;
      noPhatSinh = tongTienHoaDon - soTienTra;
    }

    // Kiểm tra khách hàng
    const [khach] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );
    const noHienTai = khach[0].TienNoHienTai;

    if (tienThuNoCu > 0 && isCheckThuTien && tienThuNoCu > noHienTai) {
      throw new Error(
        `Trả thừa ${tienThuNoCu.toLocaleString()}đ > Nợ hiện tại ${noHienTai.toLocaleString()}đ!`
      );
    }

    const noSauGiaoDich = noHienTai - tienThuNoCu + noPhatSinh;
    if (noSauGiaoDich > QD["MaxNo"]) {
      throw new Error(
        `Nợ sau giao dịch (${noSauGiaoDich.toLocaleString()}đ) vượt quá hạn mức (${QD[
          "MaxNo"
        ].toLocaleString()}đ)!`
      );
    }

    // Ghi DB
    const [hd] = await conn.query(
      "INSERT INTO HOA_DON (MaKhachHang, TongTien, SoTienTra, ConLai) VALUES (?, ?, ?, ?)",
      [maKhachHang, tongTienHoaDon, tienTraChoHoaDon, noPhatSinh]
    );
    const maHoaDon = hd.insertId;

    for (let item of danhSachSachBan) {
      await conn.query(
        "INSERT INTO CT_HOA_DON (MaHoaDon, MaSach, SoLuong, DonGiaBan, ThanhTien) VALUES (?, ?, ?, ?, ?)",
        [maHoaDon, item.maSach, item.soLuong, item.donGiaBan, item.thanhTien]
      );
      await conn.query(
        "UPDATE SACH SET SoLuongTon = SoLuongTon - ? WHERE MaSach = ?",
        [item.soLuong, item.maSach]
      );
    }

    if (tienThuNoCu > 0) {
      await conn.query(
        "INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)",
        [maKhachHang, tienThuNoCu]
      );
    }

    if (tienThuNoCu > 0 || noPhatSinh > 0) {
      const thayDoiNo = noPhatSinh - tienThuNoCu;
      await conn.query(
        "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai + ? WHERE MaKhachHang = ?",
        [thayDoiNo, maKhachHang]
      );
    }

    await conn.commit();
    let msg = "Bán hàng thành công!";
    if (tienThuNoCu > 0)
      msg += ` Đã tự động lập phiếu thu nợ ${tienThuNoCu.toLocaleString()}đ.`;
    return { message: msg };
  } catch (e) {
    if (conn) await conn.rollback();
    throw e;
  } finally {
    if (conn) conn.release();
  }
};

// 3. THU TIỀN
exports.collectMoney = async (maKhachHang, soTienThu) => {
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const [qd] = await conn.query(
      "SELECT * FROM THAM_SO WHERE MaThamSo = 'KiemTraThuTien'"
    );
    const [kh] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );

    if (qd[0].GiaTri === 1 && soTienThu > kh[0].TienNoHienTai)
      throw new Error("Số tiền thu vượt quá nợ hiện tại!");

    await conn.query(
      "INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)",
      [maKhachHang, soTienThu]
    );
    await conn.query(
      "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai - ? WHERE MaKhachHang = ?",
      [soTienThu, maKhachHang]
    );

    await conn.commit();
    return { message: "Thu thành công" };
  } catch (e) {
    if (conn) await conn.rollback();
    throw e;
  } finally {
    if (conn) conn.release();
  }
};

// 4. LỊCH SỬ
exports.getHistoryInvoices = async () => {
  return await query(
    "SELECT hd.*, kh.HoTen FROM HOA_DON hd LEFT JOIN KHACH_HANG kh ON hd.MaKhachHang = kh.MaKhachHang ORDER BY hd.NgayLap DESC"
  );
};
exports.getHistoryImports = async () => {
  return await query("SELECT * FROM PHIEU_NHAP ORDER BY NgayNhap DESC");
};
exports.getHistoryReceipts = async () => {
  return await query(
    "SELECT pt.*, kh.HoTen FROM PHIEU_THU_TIEN pt LEFT JOIN KHACH_HANG kh ON pt.MaKhachHang = kh.MaKhachHang ORDER BY pt.NgayThu DESC"
  );
};
exports.getDetailInvoice = async (id) => {
  return await query(
    "SELECT ct.*, s.TenSach FROM CT_HOA_DON ct JOIN SACH s ON ct.MaSach = s.MaSach WHERE ct.MaHoaDon = ?",
    [id]
  );
};
exports.getDetailImport = async (id) => {
  return await query(
    "SELECT ct.*, s.TenSach FROM CT_PHIEU_NHAP ct JOIN SACH s ON ct.MaSach = s.MaSach WHERE ct.MaPhieuNhap = ?",
    [id]
  );
};
