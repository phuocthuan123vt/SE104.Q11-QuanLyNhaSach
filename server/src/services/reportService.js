const { query } = require("../models/baseModel");

exports.getInventoryReport = async (thang, nam) => {
  const sql = `SELECT s.MaSach, s.TenSach, s.SoLuongTon as TonCuoi, IFNULL((SELECT SUM(SoLuongNhap) FROM CT_PHIEU_NHAP ct JOIN PHIEU_NHAP pn ON ct.MaPhieuNhap = pn.MaPhieuNhap WHERE ct.MaSach = s.MaSach AND MONTH(pn.NgayNhap) = ? AND YEAR(pn.NgayNhap) = ?), 0) as PhatSinhNhap, IFNULL((SELECT SUM(SoLuong) FROM CT_HOA_DON ct JOIN HOA_DON hd ON ct.MaHoaDon = hd.MaHoaDon WHERE ct.MaSach = s.MaSach AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhXuat FROM SACH s`;
  const d = await query(sql, [thang, nam, thang, nam]);
  return d.map((i) => ({
    ...i,
    TonDau: i.TonCuoi - i.PhatSinhNhap + Number(i.PhatSinhXuat),
  }));
};

exports.getDebtReport = async (thang, nam) => {
  const sql = `SELECT kh.MaKhachHang, kh.HoTen, kh.TienNoHienTai as NoCuoi, IFNULL((SELECT SUM(ConLai) FROM HOA_DON hd WHERE hd.MaKhachHang = kh.MaKhachHang AND hd.ConLai > 0 AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhTang, IFNULL((SELECT SUM(SoTienThu) FROM PHIEU_THU_TIEN pt WHERE pt.MaKhachHang = kh.MaKhachHang AND MONTH(pt.NgayThu) = ? AND YEAR(pt.NgayThu) = ?), 0) as PhatSinhGiam FROM KHACH_HANG kh`;
  const d = await query(sql, [thang, nam, thang, nam]);
  return d.map((i) => ({
    ...i,
    NoDau: i.NoCuoi - i.PhatSinhTang + Number(i.PhatSinhGiam),
  }));
};
