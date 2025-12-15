import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Form, message } from "antd";
import { API_URL } from "../constants";
import { handleError } from "../utils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- AUTH STATE ---
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem("user") || "{}")
  );
  const isAdmin = currentUser?.quyen === 1;

  // --- DATA STATES ---
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);

  // --- HISTORY STATES ---
  const [historyInvoices, setHistoryInvoices] = useState([]);
  const [historyImports, setHistoryImports] = useState([]);
  const [historyReceipts, setHistoryReceipts] = useState([]);

  // --- REPORT STATES ---
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState("ton");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // --- PRINT STATE ---
  const [printContent, setPrintContent] = useState(null);

  // --- MODAL CONTROLS ---
  // Chúng ta quản lý trạng thái mở modal ở đây để các component con gọi được
  const [modals, setModals] = useState({
    import: false,
    sell: false,
    pay: false,
    customer: false,
    book: false,
    category: false,
    user: false,
    detail: false,
  });

  const [detailData, setDetailData] = useState([]);
  const [detailType, setDetailType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [bookForm] = Form.useForm();
  const [custForm] = Form.useForm();
  const [catForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [payForm] = Form.useForm();

  // --- HELPER FUNCTIONS ---
  const toggleModal = (type, isOpen) => {
    setModals((prev) => ({ ...prev, [type]: isOpen }));
  };

  const getRule = (key, defaultVal) =>
    rules.find((r) => r.MaThamSo === key)?.GiaTri || defaultVal;

  // --- API CALLS ---
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/sach`);
      setBooks(r.data);
    } catch (e) {}
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const r = await axios.get(`${API_URL}/khach-hang`);
      setCustomers(r.data);
    } catch (e) {}
  };

  const fetchCategories = async () => {
    try {
      const r = await axios.get(`${API_URL}/the-loai`);
      setCategories(r.data);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const r = await axios.get(`${API_URL}/tai-khoan`);
      setUsers(r.data);
    } catch (e) {}
  };

  const fetchRules = async () => {
    try {
      const r = await axios.get(`${API_URL}/quy-dinh`);
      setRules(r.data);
    } catch (e) {}
  };

  const fetchHistory = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${API_URL}/lich-su/hoa-don`),
        axios.get(`${API_URL}/lich-su/nhap-sach`),
        axios.get(`${API_URL}/lich-su/phieu-thu`),
      ]);
      setHistoryInvoices(r1.data);
      setHistoryImports(r2.data);
      setHistoryReceipts(r3.data);
    } catch (e) {}
  };

  const fetchReport = async () => {
    setLoading(true);
    const url =
      reportType === "ton"
        ? `ton?thang=${month}&nam=${year}`
        : `cong-no?thang=${month}&nam=${year}`;
    try {
      const r = await axios.get(`${API_URL}/bao-cao/${url}`);
      setReportData(r.data);
    } catch (e) {
      handleError(e, "Tải báo cáo");
    }
    setLoading(false);
  };

  const fetchDetail = async (id, type) => {
    try {
      const u =
        type === "hoadon"
          ? `chi-tiet-hoa-don/${id}`
          : `chi-tiet-phieu-nhap/${id}`;
      const r = await axios.get(`${API_URL}/${u}`);
      setDetailData(r.data);
      setDetailType(type);
      toggleModal("detail", true);
    } catch (e) {
      handleError(e, "Xem chi tiết");
    }
  };

  // --- ACTIONS ---
  const handleLogin = async (v) => {
    try {
      const r = await axios.post(`${API_URL}/login`, v);
      sessionStorage.setItem("token", r.data.token);
      sessionStorage.setItem("user", JSON.stringify(r.data.user));
      setToken(r.data.token);
      setCurrentUser(r.data.user);
      message.success(`Xin chào ${r.data.user.hoTen}!`);
    } catch (e) {
      handleError(e, "Đăng nhập");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setToken(null);
  };

  const handlePrint = (type, data) => {
    setPrintContent({
      type,
      data,
      date: new Date().toLocaleDateString("vi-VN"),
      savedReportType: reportType,
    });
    setTimeout(() => window.print(), 500);
  };

  // Init Data
  useEffect(() => {
    if (token) {
      fetchBooks();
      fetchCustomers();
      fetchCategories();
      fetchHistory();
      fetchRules();
      if (isAdmin) fetchUsers();
      fetchReport();
    }
  }, [token]);

  // Refetch report when filter changes
  useEffect(() => {
    if (token) fetchReport();
  }, [reportType, month, year]);

  const value = {
    token,
    currentUser,
    isAdmin,
    handleLogin,
    handleLogout,
    books,
    customers,
    categories,
    users,
    loading,
    rules,
    historyInvoices,
    historyImports,
    historyReceipts,
    reportData,
    reportType,
    setReportType,
    month,
    setMonth,
    year,
    setYear,
    printContent,
    handlePrint,
    modals,
    toggleModal,
    detailData,
    detailType,
    fetchDetail,
    editingItem,
    setEditingItem,
    bookForm,
    custForm,
    catForm,
    userForm,
    payForm,
    fetchBooks,
    fetchCustomers,
    fetchCategories,
    fetchUsers,
    fetchHistory,
    fetchRules,
    fetchReport,
    getRule,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
