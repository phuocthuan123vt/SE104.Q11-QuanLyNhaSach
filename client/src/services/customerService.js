import api from "./api";

function mapCustomer(db) {
  return {
    maKhachHang: db.MaKhachHang,
    hoTen: db.HoTen,
    soDienThoai: db.SoDienThoai,
    diaChi: db.DiaChi,
    email: db.Email,
    tienNoHienTai: db.TienNoHienTai,
  };
}

export async function getCustomers() {
  const res = await api.get("/khach-hang");
  return Array.isArray(res.data) ? res.data.map(mapCustomer) : [];
}

export async function addCustomer(payload) {
  return api.post("/khach-hang", payload);
}

export default { getCustomers, addCustomer };
