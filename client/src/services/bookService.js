import api from "./api";

function mapBook(db) {
  return {
    maSach: db.MaSach,
    tenSach: db.TenSach,
    tacGia: db.TacGia,
    soLuongTon: db.SoLuongTon,
    donGiaNhapGanNhat: db.DonGiaNhapGanNhat,
  };
}

export async function getBooks() {
  const res = await api.get("/sach");
  return Array.isArray(res.data) ? res.data.map(mapBook) : [];
}

export async function importBooks(danhSachSachNhap) {
  // danhSachSachNhap: [{ maSach, soLuong, donGia }]
  const payload = { danhSachSachNhap };
  return api.post("/nhap-sach", payload);
}

export default { getBooks, importBooks };
