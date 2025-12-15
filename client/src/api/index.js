import axios from "axios";
import { API_URL } from "../constants";

export const api = {
  login: (data) => axios.post(`${API_URL}/login`, data),

  // Sách
  getBooks: () => axios.get(`${API_URL}/sach`),
  createBook: (data) => axios.post(`${API_URL}/sach`, data),
  updateBook: (id, data) => axios.put(`${API_URL}/sach/${id}`, data),
  deleteBook: (id) => axios.delete(`${API_URL}/sach/${id}`),

  // Khách hàng
  getCustomers: () => axios.get(`${API_URL}/khach-hang`),
  createCustomer: (data) => axios.post(`${API_URL}/khach-hang`, data),
  updateCustomer: (id, data) => axios.put(`${API_URL}/khach-hang/${id}`, data),
  deleteCustomer: (id) => axios.delete(`${API_URL}/khach-hang/${id}`),

  // Nghiệp vụ
  importBooks: (data) => axios.post(`${API_URL}/nhap-sach`, data),
  sellBooks: (data) => axios.post(`${API_URL}/ban-sach`, data),
  collectMoney: (data) => axios.post(`${API_URL}/thu-tien`, data),

  // Lịch sử & Báo cáo
  getHistory: () =>
    Promise.all([
      axios.get(`${API_URL}/lich-su/hoa-don`),
      axios.get(`${API_URL}/lich-su/nhap-sach`),
      axios.get(`${API_URL}/lich-su/phieu-thu`),
    ]),
  getReport: (type, month, year) => {
    const url =
      type === "ton"
        ? `ton?thang=${month}&nam=${year}`
        : `cong-no?thang=${month}&nam=${year}`;
    return axios.get(`${API_URL}/bao-cao/${url}`);
  },
  // Các em có thể thêm tiếp các api còn lại (Category, User, Rules...)
};
