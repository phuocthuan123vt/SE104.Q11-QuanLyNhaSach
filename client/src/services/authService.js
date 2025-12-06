import api from "./api";

function mapUserPascalToCamel(dbUser) {
  if (!dbUser) return null;
  return {
    maNhanVien: dbUser.MaNhanVien,
    hoTen: dbUser.HoTen,
    email: dbUser.Email,
    role: dbUser.Role || dbUser.VaiTro || "user",
  };
}

const login = async (credentials) => {
  const res = await api.post("/login", credentials);
  const { token, user } = res.data;
  return { token, user: mapUserPascalToCamel(user) };
};

export default { login };
