import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Typography,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tabs,
  Radio,
  Input,
  Layout,
  Card,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Badge,
  Avatar,
  Dropdown,
  Popconfirm,
  Divider,
} from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SearchOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
  BellFilled,
  SmileFilled,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Header, Content, Footer } = Layout;

// --- DÙNG ẢNH TRONG THƯ MỤC PUBLIC/IMAGES ---
const IMG_LOGIN_DORA = "/images/doraemon.png";
const IMG_LOGO_BELL = "/images/logo.png";
const IMG_AVATAR_DEFAULT = "/images/avatar.png";

// MÀU SẮC
const DORA_BLUE = "#0096FF";
const DORA_RED = "#FF4D4F";
const DORA_YELLOW = "#FFC53D";

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem("user") || "{}")
  );
  const isAdmin = currentUser?.quyen === 1;

  // DATA
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // HISTORY
  const [historyInvoices, setHistoryInvoices] = useState([]);
  const [historyImports, setHistoryImports] = useState([]);
  const [historyReceipts, setHistoryReceipts] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [isDetailModal, setIsDetailModal] = useState(false);
  const [detailType, setDetailType] = useState("");

  // MODALS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellForm] = Form.useForm();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payForm] = Form.useForm();

  const [isCustomerModal, setIsCustomerModal] = useState(false);
  const [custForm] = Form.useForm();
  const [isBookModal, setIsBookModal] = useState(false);
  const [bookForm] = Form.useForm();
  const [isCatModal, setIsCatModal] = useState(false);
  const [catForm] = Form.useForm();
  const [isUserModal, setIsUserModal] = useState(false);
  const [userForm] = Form.useForm();

  const [editingItem, setEditingItem] = useState(null);

  // MULTI-ROW
  const [importItems, setImportItems] = useState([]);
  const [tempImportForm] = Form.useForm();
  const [saleItems, setSaleItems] = useState([]);
  const [tempSaleForm] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // REPORT & PRINT
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState("ton");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchText, setSearchText] = useState("");
  const [rules, setRules] = useState([]);
  const [ruleForm] = Form.useForm();

  const [printContent, setPrintContent] = useState(null);

  // HELPERS
  const handleError = (e, action) => {
    console.error(e);
    message.error(
      `${action} thất bại: ${e.response?.data?.error || e.message}`
    );
  };
  const formatMoney = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // FETCHING
  const fetchAll = () => {
    if (!token) return;
    fetchBooks();
    fetchCustomers();
    fetchCategories();
    fetchHistory();
    fetchRules();
    if (isAdmin) fetchUsers();
  };
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const r = await axios.get("http://localhost:5000/api/sach");
      setBooks(r.data);
    } catch (e) {}
    setLoading(false);
  };
  const fetchCustomers = async () => {
    try {
      const r = await axios.get("http://localhost:5000/api/khach-hang");
      setCustomers(r.data);
    } catch (e) {}
  };
  const fetchCategories = async () => {
    try {
      const r = await axios.get("http://localhost:5000/api/the-loai");
      setCategories(r.data);
    } catch (e) {}
  };
  const fetchRules = async () => {
    try {
      const r = await axios.get("http://localhost:5000/api/quy-dinh");
      setRules(r.data);
      ruleForm.setFieldsValue(
        r.data.reduce((a, c) => ({ ...a, [c.MaThamSo]: c.GiaTri }), {})
      );
    } catch (e) {}
  };
  const fetchUsers = async () => {
    try {
      const r = await axios.get("http://localhost:5000/api/tai-khoan");
      setUsers(r.data);
    } catch (e) {}
  };

  const fetchReport = async () => {
    setLoading(true);
    const url =
      reportType === "ton"
        ? `ton?thang=${month}&nam=${year}`
        : `cong-no?thang=${month}&nam=${year}`;
    try {
      const r = await axios.get(`http://localhost:5000/api/bao-cao/${url}`);
      setReportData(r.data);
      message.success("Tải xong báo cáo");
    } catch (e) {
      handleError(e, "Tải báo cáo");
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get("http://localhost:5000/api/lich-su/hoa-don"),
        axios.get("http://localhost:5000/api/lich-su/nhap-sach"),
        axios.get("http://localhost:5000/api/lich-su/phieu-thu"),
      ]);
      setHistoryInvoices(r1.data);
      setHistoryImports(r2.data);
      setHistoryReceipts(r3.data);
    } catch (e) {}
  };
  const fetchDetail = async (id, type) => {
    try {
      const u =
        type === "hoadon"
          ? `chi-tiet-hoa-don/${id}`
          : `chi-tiet-phieu-nhap/${id}`;
      const r = await axios.get(`http://localhost:5000/api/${u}`);
      setDetailData(r.data);
      setDetailType(type);
      setIsDetailModal(true);
    } catch (e) {
      handleError(e, "Xem chi tiết");
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  // --- LOGIC IN ẤN (Đã tăng thời gian chờ để không bị trắng trang) ---
  const handlePrint = (type, data) => {
    setPrintContent({
      type,
      data,
      date: new Date().toLocaleDateString("vi-VN"),
    });
    // Chờ 0.5 giây để React render xong DOM rồi mới in
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // --- HÀM XÁC ĐỊNH CỘT KHI IN ---
  const getPrintColumns = () => {
    if (printContent?.type === "invoice") {
      // Cột cho Hóa đơn
      return [
        { title: "Sách", dataIndex: "TenSach" },
        {
          title: "SL",
          dataIndex: detailType === "hoadon" ? "SoLuong" : "SoLuongNhap",
        },
        {
          title: "Đơn Giá",
          dataIndex: detailType === "hoadon" ? "DonGiaBan" : "DonGiaNhap",
          render: (v) => v?.toLocaleString(),
        },
        {
          title: "Thành Tiền",
          dataIndex: "ThanhTien",
          render: (v) => v?.toLocaleString(),
        },
      ];
    } else {
      // Cột cho Báo cáo (Tùy loại Tồn hay Công nợ)
      if (reportType === "ton") {
        return [
          { title: "STT", render: (t, r, i) => i + 1, width: 50 },
          { title: "Sách", dataIndex: "TenSach" },
          { title: "Tồn Đầu", dataIndex: "TonDau" },
          { title: "Phát Sinh Nhập", dataIndex: "PhatSinhNhap" },
          { title: "Phát Sinh Xuất", dataIndex: "PhatSinhXuat" },
          { title: "Tồn Cuối", dataIndex: "TonCuoi" },
        ];
      } else {
        return [
          { title: "STT", render: (t, r, i) => i + 1, width: 50 },
          { title: "Khách Hàng", dataIndex: "HoTen" },
          {
            title: "Nợ Đầu",
            dataIndex: "NoDau",
            render: (v) => v.toLocaleString(),
          },
          {
            title: "Phát Sinh Tăng",
            dataIndex: "PhatSinhTang",
            render: (v) => v.toLocaleString(),
          },
          {
            title: "Phát Sinh Giảm",
            dataIndex: "PhatSinhGiam",
            render: (v) => v.toLocaleString(),
          },
          {
            title: "Nợ Cuối",
            dataIndex: "NoCuoi",
            render: (v) => v.toLocaleString(),
          },
        ];
      }
    }
  };

  // --- HANDLERS (Giữ nguyên) ---
  const addImportItem = (v) => {
    const b = books.find((i) => i.MaSach === v.maSach);
    if (importItems.find((i) => i.maSach === v.maSach))
      return message.warning("Đã có!");
    setImportItems([
      ...importItems,
      { ...v, tenSach: b.TenSach, thanhTien: v.soLuong * v.donGia },
    ]);
    tempImportForm.resetFields();
  };
  const submitImport = async () => {
    if (importItems.length === 0) return message.error("Trống");
    try {
      await axios.post("http://localhost:5000/api/nhap-sach", {
        danhSachSachNhap: importItems,
      });
      message.success("Thành công");
      setIsModalOpen(false);
      setImportItems([]);
      fetchBooks();
      fetchHistory();
    } catch (e) {
      handleError(e, "Nhập sách");
    }
  };
  const addSaleItem = (v) => {
    const b = books.find((i) => i.MaSach === v.maSach);
    if (saleItems.find((i) => i.maSach === v.maSach))
      return message.warning("Đã có!");
    const tiLe =
      (rules.find((r) => r.MaThamSo === "TiLeGiaBan")?.GiaTri || 105) / 100;
    const gia = b.DonGiaNhapGanNhat * tiLe;
    setSaleItems([
      ...saleItems,
      {
        maSach: v.maSach,
        tenSach: b.TenSach,
        soLuong: v.soLuong,
        donGiaNhapGanNhat: b.DonGiaNhapGanNhat,
        donGiaBan: gia,
        thanhTien: v.soLuong * gia,
      },
    ]);
    tempSaleForm.resetFields();
  };
  const submitSale = async () => {
    if (!selectedCustomer || saleItems.length === 0)
      return message.error("Thiếu thông tin");
    try {
      await axios.post("http://localhost:5000/api/ban-sach", {
        maKhachHang: selectedCustomer,
        soTienTra: paymentAmount,
        danhSachSachBan: saleItems,
      });
      message.success("Thành công! Vào Lịch Sử để In Hóa Đơn");
      setIsSellModalOpen(false);
      setSaleItems([]);
      setSelectedCustomer(null);
      setPaymentAmount(0);
      fetchBooks();
      fetchCustomers();
      fetchHistory();
    } catch (e) {
      handleError(e, "Bán sách");
    }
  };
  const handleLogin = async (v) => {
    try {
      const r = await axios.post("http://localhost:5000/api/login", v);
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
  const saveCustomer = async (v) => {
    try {
      if (editingItem)
        await axios.put(
          `http://localhost:5000/api/khach-hang/${editingItem.MaKhachHang}`,
          v
        );
      else await axios.post("http://localhost:5000/api/khach-hang", v);
      message.success("Thành công");
      setIsCustomerModal(false);
      fetchCustomers();
    } catch (e) {
      handleError(e, "Lưu khách");
    }
  };
  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/khach-hang/${id}`);
      message.success("Đã xóa");
      fetchCustomers();
    } catch (e) {
      handleError(e, "Xóa khách");
    }
  };
  const saveCategory = async (v) => {
    try {
      if (editingItem)
        await axios.put(
          `http://localhost:5000/api/the-loai/${editingItem.MaTheLoai}`,
          v
        );
      else await axios.post("http://localhost:5000/api/the-loai", v);
      message.success("Thành công");
      setIsCatModal(false);
      fetchCategories();
    } catch (e) {
      handleError(e, "Lưu thể loại");
    }
  };
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/the-loai/${id}`);
      message.success("Đã xóa");
      fetchCategories();
    } catch (e) {
      handleError(e, "Xóa thể loại");
    }
  };
  const saveBook = async (v) => {
    try {
      if (editingItem)
        await axios.put(
          `http://localhost:5000/api/sach/${editingItem.MaSach}`,
          v
        );
      else await axios.post("http://localhost:5000/api/sach", v);
      message.success("Thành công");
      setIsBookModal(false);
      fetchBooks();
    } catch (e) {
      handleError(e, "Lưu sách");
    }
  };
  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sach/${id}`);
      message.success("Đã xóa");
      fetchBooks();
    } catch (e) {
      handleError(e, "Xóa sách");
    }
  };
  const saveUser = async (v) => {
    try {
      await axios.post("http://localhost:5000/api/tai-khoan", v);
      message.success("Thành công");
      setIsUserModal(false);
      fetchUsers();
    } catch (e) {
      handleError(e, "Tạo user");
    }
  };
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tai-khoan/${id}`);
      message.success("Đã xóa");
      fetchUsers();
    } catch (e) {
      handleError(e, "Xóa user");
    }
  };
  const handleThu = async (v) => {
    try {
      await axios.post("http://localhost:5000/api/thu-tien", v);
      message.success("Thành công");
      setIsPayModalOpen(false);
      payForm.resetFields();
      fetchCustomers();
      fetchHistory();
    } catch (e) {
      handleError(e, "Thu tiền");
    }
  };
  const handleRules = async (v) => {
    try {
      await axios.post("http://localhost:5000/api/quy-dinh", { quyDinh: v });
      message.success("Thành công");
      fetchRules();
    } catch (e) {
      handleError(e, "Cập nhật quy định");
    }
  };

  if (!token)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)",
        }}
      >
        <Card
          style={{
            width: 800,
            borderRadius: 25,
            boxShadow: "0 20px 50px rgba(0,150,255,0.15)",
            overflow: "hidden",
            border: "none",
            padding: 0,
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row>
            <Col
              span={10}
              style={{
                background: "#0096FF",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 30,
              }}
            >
              <img
                src={IMG_LOGIN_DORA}
                alt="Doraemon"
                style={{
                  width: "100%",
                  maxWidth: 200,
                  filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))",
                }}
              />
              <Title
                level={3}
                style={{
                  color: "white",
                  marginTop: 20,
                  fontFamily: "Nunito",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                XIN CHÀO BẠN!
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.9)", textAlign: "center" }}
              >
                Cùng quản lý nhà sách với tớ nhé!
              </Text>
            </Col>
            <Col
              span={14}
              style={{
                padding: "40px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Title
                  level={2}
                  style={{ color: "#0096FF", fontWeight: 800, margin: 0 }}
                >
                  ĐĂNG NHẬP
                </Title>
                <Text type="secondary">Hệ thống quản lý nội bộ</Text>
              </div>
              <Form
                layout="vertical"
                size="large"
                onFinish={handleLogin}
                autoComplete="off"
              >
                <Form.Item name="username" rules={[{ required: true }]}>
                  <Input
                    prefix={<UserOutlined style={{ color: DORA_BLUE }} />}
                    placeholder="Tài khoản"
                    style={{
                      borderRadius: 15,
                      background: "#f5faff",
                      border: "1px solid #d9eaff",
                    }}
                  />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true }]}>
                  <Input.Password
                    prefix={<LockOutlined style={{ color: DORA_BLUE }} />}
                    placeholder="Mật khẩu"
                    style={{
                      borderRadius: 15,
                      background: "#f5faff",
                      border: "1px solid #d9eaff",
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{
                      height: 50,
                      fontSize: 16,
                      fontWeight: "bold",
                      borderRadius: 25,
                      background: DORA_BLUE,
                      borderColor: DORA_BLUE,
                      boxShadow: "0 5px 15px rgba(0,150,255,0.3)",
                      marginTop: 10,
                    }}
                  >
                    MỞ CỬA THẦN KỲ
                  </Button>
                </Form.Item>
              </Form>
              <div style={{ textAlign: "center", color: "#888", fontSize: 12 }}>
                Tài khoản được cấp bởi Quản trị viên
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {/* --- VÙNG IN (CHỈ HIỆN KHI BẤM IN) --- */}
      <div id="print-area">
        {printContent && (
          <div style={{ padding: 40, fontFamily: "Times New Roman" }}>
            <h1
              style={{
                textAlign: "center",
                marginBottom: 5,
                fontSize: 24,
                textTransform: "uppercase",
              }}
            >
              NHÀ SÁCH DORAEMON
            </h1>
            <p style={{ textAlign: "center" }}>
              Địa chỉ: Khu phố 6, Linh Trung, Thủ Đức
            </p>
            <Divider style={{ borderColor: "#000" }} />
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
              {printContent.type === "report"
                ? reportType === "ton"
                  ? "BÁO CÁO TỒN KHO"
                  : "BÁO CÁO CÔNG NỢ"
                : "HÓA ĐƠN GIAO DỊCH"}
            </h2>
            <p style={{ textAlign: "center", marginBottom: 20 }}>
              Ngày in: {printContent.date}
            </p>

            <Table
              dataSource={printContent.data}
              pagination={false}
              bordered
              size="small"
              columns={getPrintColumns()}
            />

            <br />
            <br />
            <Row>
              <Col span={12} style={{ textAlign: "center" }}>
                <p>
                  <b>Người lập phiếu</b>
                </p>
                <br />
                <br />
                <br />
                <p>{currentUser.hoTen}</p>
              </Col>
              <Col span={12} style={{ textAlign: "center" }}>
                <p>
                  <b>Xác nhận</b>
                </p>
                <br />
                <br />
                <br />
                <p>(Ký tên)</p>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: DORA_BLUE,
          padding: "0 30px",
          height: 70,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div
            style={{
              background: "white",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `3px solid ${DORA_RED}`,
            }}
          >
            <img src={IMG_LOGO_BELL} alt="" style={{ width: 50 }} />
          </div>
          <span
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "Nunito",
              letterSpacing: 1,
            }}
          >
            DORAEMON BOOKSTORE
          </span>
        </div>
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: <span style={{ fontWeight: "bold" }}>Đăng Xuất</span>,
                icon: <LogoutOutlined />,
                onClick: handleLogout,
              },
            ],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              background: "rgba(255,255,255,0.2)",
              padding: "5px 15px",
              borderRadius: 30,
            }}
          >
            {/* ẢNH AVATAR */}
            <Avatar
              size="large"
              src={IMG_AVATAR_DEFAULT}
              style={{ border: `2px solid white`, background: "transparent" }}
            />
            <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>
              {currentUser.hoTen || "Nobita"}
            </span>
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 50px" }}>
        <Card
          style={{
            borderRadius: 30,
            minHeight: "80vh",
            boxShadow: "0 10px 30px rgba(0,150,255,0.1)",
            border: "none",
          }}
          bodyStyle={{ padding: 25 }}
        >
          <Tabs
            defaultActiveKey="1"
            type="card"
            size="large"
            tabBarStyle={{ marginBottom: 20 }}
            items={[
              {
                key: "1",
                label: (
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>
                    <BookOutlined /> QUẦY GIAO DỊCH
                  </span>
                ),
                children: (
                  <div>
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                      <Col flex="auto">
                        <Input.Search
                          placeholder="Tìm bảo bối... à nhầm, tìm sách..."
                          allowClear
                          size="large"
                          style={{ borderRadius: 20 }}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          icon={<PlusOutlined />}
                          style={{ borderRadius: 20, background: DORA_BLUE }}
                          onClick={() => setIsModalOpen(true)}
                        >
                          Nhập Sách
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          style={{
                            borderRadius: 20,
                            background: DORA_YELLOW,
                            borderColor: DORA_YELLOW,
                            color: "black",
                          }}
                          onClick={() => setIsSellModalOpen(true)}
                        >
                          Bán Sách
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="large"
                          icon={<DollarOutlined />}
                          style={{
                            borderRadius: 20,
                            background: "#52c41a",
                            borderColor: "#52c41a",
                          }}
                          onClick={() => setIsPayModalOpen(true)}
                        >
                          Thu Tiền
                        </Button>
                      </Col>
                    </Row>
                    <Table
                      dataSource={books.filter((b) =>
                        b.TenSach.toLowerCase().includes(
                          searchText.toLowerCase()
                        )
                      )}
                      rowKey="MaSach"
                      loading={loading}
                      bordered
                      pagination={{ pageSize: 6 }}
                      columns={[
                        {
                          title: "Mã",
                          dataIndex: "MaSach",
                          width: 60,
                          align: "center",
                          render: (t) => (
                            <Tag color="blue" style={{ borderRadius: 10 }}>
                              #{t}
                            </Tag>
                          ),
                        },
                        {
                          title: "Tên Sách",
                          dataIndex: "TenSach",
                          render: (t) => (
                            <b style={{ color: DORA_BLUE, fontSize: 15 }}>
                              {t}
                            </b>
                          ),
                        },
                        {
                          title: "Tồn Kho",
                          dataIndex: "SoLuongTon",
                          align: "center",
                          render: (v) => (
                            <Badge
                              count={v}
                              showZero
                              overflowCount={9999}
                              style={{
                                backgroundColor: v < 20 ? DORA_RED : "#52c41a",
                              }}
                            />
                          ),
                        },
                        {
                          title: "Giá Bán",
                          dataIndex: "DonGiaNhapGanNhat",
                          align: "right",
                          render: (v) => (
                            <Tag
                              color="gold"
                              style={{
                                borderRadius: 10,
                                fontSize: 14,
                                padding: "4px 10px",
                                color: "#555",
                                fontWeight: "bold",
                              }}
                            >
                              {(
                                (v *
                                  (rules.find(
                                    (r) => r.MaThamSo === "TiLeGiaBan"
                                  )?.GiaTri || 105)) /
                                100
                              ).toLocaleString()}{" "}
                              ₫
                            </Tag>
                          ),
                        },
                      ]}
                    />
                    <Card
                      style={{
                        marginTop: 30,
                        borderRadius: 20,
                        border: `2px dashed ${DORA_BLUE}`,
                        background: "#f9fcff",
                      }}
                    >
                      <Title level={4} style={{ color: DORA_BLUE }}>
                        <EyeOutlined /> Túi Thần Kỳ (Lịch Sử)
                      </Title>
                      <Tabs
                        items={[
                          {
                            key: "h1",
                            label: "Hóa Đơn",
                            children: (
                              <Table
                                dataSource={historyInvoices}
                                rowKey="MaHoaDon"
                                pagination={{ pageSize: 5 }}
                                columns={[
                                  {
                                    title: "ID",
                                    dataIndex: "MaHoaDon",
                                    width: 60,
                                  },
                                  {
                                    title: "Ngày",
                                    dataIndex: "NgayLap",
                                    render: (t) =>
                                      new Date(t).toLocaleString("vi-VN"),
                                  },
                                  { title: "Khách", dataIndex: "HoTen" },
                                  {
                                    title: "Tổng",
                                    dataIndex: "TongTien",
                                    render: (v) => (
                                      <b style={{ color: DORA_BLUE }}>
                                        {formatMoney(v)}
                                      </b>
                                    ),
                                  },
                                  {
                                    title: "Xem",
                                    align: "center",
                                    render: (_, r) => (
                                      <Button
                                        shape="circle"
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                          fetchDetail(r.MaHoaDon, "hoadon")
                                        }
                                      />
                                    ),
                                  },
                                ]}
                              />
                            ),
                          },
                          {
                            key: "h2",
                            label: "Nhập Sách",
                            children: (
                              <Table
                                dataSource={historyImports}
                                rowKey="MaPhieuNhap"
                                pagination={{ pageSize: 5 }}
                                columns={[
                                  {
                                    title: "ID",
                                    dataIndex: "MaPhieuNhap",
                                    width: 60,
                                  },
                                  {
                                    title: "Ngày",
                                    dataIndex: "NgayNhap",
                                    render: (t) =>
                                      new Date(t).toLocaleString("vi-VN"),
                                  },
                                  {
                                    title: "Tổng",
                                    dataIndex: "TongTien",
                                    render: (v) => (
                                      <b style={{ color: DORA_RED }}>
                                        {formatMoney(v)}
                                      </b>
                                    ),
                                  },
                                  {
                                    title: "Xem",
                                    align: "center",
                                    render: (_, r) => (
                                      <Button
                                        shape="circle"
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                          fetchDetail(
                                            r.MaPhieuNhap,
                                            "phieunhap"
                                          )
                                        }
                                      />
                                    ),
                                  },
                                ]}
                              />
                            ),
                          },
                          {
                            key: "h3",
                            label: "Phiếu Thu",
                            children: (
                              <Table
                                dataSource={historyReceipts}
                                rowKey="MaPhieuThu"
                                pagination={{ pageSize: 5 }}
                                columns={[
                                  {
                                    title: "ID",
                                    dataIndex: "MaPhieuThu",
                                    width: 60,
                                  },
                                  {
                                    title: "Ngày",
                                    dataIndex: "NgayThu",
                                    render: (t) =>
                                      new Date(t).toLocaleString("vi-VN"),
                                  },
                                  { title: "Khách", dataIndex: "HoTen" },
                                  {
                                    title: "Thu",
                                    dataIndex: "SoTienThu",
                                    render: (v) => (
                                      <Tag color="green">{formatMoney(v)}</Tag>
                                    ),
                                  },
                                ]}
                              />
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>
                    <DatabaseOutlined /> KHO DỮ LIỆU
                  </span>
                ),
                children: (
                  <Tabs
                    defaultActiveKey="2-1"
                    tabPosition="left"
                    items={[
                      {
                        key: "2-1",
                        label: "Sách",
                        children: (
                          <div>
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              style={{
                                marginBottom: 10,
                                borderRadius: 15,
                                borderColor: DORA_BLUE,
                                color: DORA_BLUE,
                              }}
                              block
                              onClick={() => {
                                setEditingItem(null);
                                bookForm.resetFields();
                                setIsBookModal(true);
                              }}
                            >
                              Thêm Sách Mới
                            </Button>
                            <Table
                              dataSource={books}
                              rowKey="MaSach"
                              pagination={{ pageSize: 6 }}
                              columns={[
                                { title: "Tên Sách", dataIndex: "TenSach" },
                                { title: "Thể Loại", dataIndex: "TenTheLoai" },
                                {
                                  title: "Thao tác",
                                  width: 100,
                                  render: (_, r) => (
                                    <Space>
                                      <Button
                                        type="text"
                                        icon={
                                          <EditOutlined
                                            style={{ color: DORA_BLUE }}
                                          />
                                        }
                                        onClick={() => {
                                          setEditingItem(r);
                                          bookForm.setFieldsValue(r);
                                          setIsBookModal(true);
                                        }}
                                      />
                                      {isAdmin && (
                                        <Popconfirm
                                          title="Xóa?"
                                          onConfirm={() => deleteBook(r.MaSach)}
                                        >
                                          <Button
                                            type="text"
                                            icon={
                                              <DeleteOutlined
                                                style={{ color: DORA_RED }}
                                              />
                                            }
                                          />
                                        </Popconfirm>
                                      )}
                                    </Space>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        ),
                      },
                      {
                        key: "2-2",
                        label: "Khách Hàng",
                        children: (
                          <div>
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              style={{
                                marginBottom: 10,
                                borderRadius: 15,
                                borderColor: DORA_BLUE,
                                color: DORA_BLUE,
                              }}
                              block
                              onClick={() => {
                                setEditingItem(null);
                                custForm.resetFields();
                                setIsCustomerModal(true);
                              }}
                            >
                              Thêm Khách
                            </Button>
                            <Table
                              dataSource={customers}
                              rowKey="MaKhachHang"
                              pagination={{ pageSize: 6 }}
                              columns={[
                                { title: "Họ Tên", dataIndex: "HoTen" },
                                { title: "SĐT", dataIndex: "SoDienThoai" },
                                {
                                  title: "Nợ",
                                  dataIndex: "TienNoHienTai",
                                  render: (v) => v.toLocaleString(),
                                },
                                {
                                  title: "Thao tác",
                                  width: 100,
                                  render: (_, r) => (
                                    <Space>
                                      <Button
                                        type="text"
                                        icon={
                                          <EditOutlined
                                            style={{ color: DORA_BLUE }}
                                          />
                                        }
                                        onClick={() => {
                                          setEditingItem(r);
                                          custForm.setFieldsValue(r);
                                          setIsCustomerModal(true);
                                        }}
                                      />
                                      {isAdmin && (
                                        <Popconfirm
                                          title="Xóa?"
                                          onConfirm={() =>
                                            deleteCustomer(r.MaKhachHang)
                                          }
                                        >
                                          <Button
                                            type="text"
                                            icon={
                                              <DeleteOutlined
                                                style={{ color: DORA_RED }}
                                              />
                                            }
                                          />
                                        </Popconfirm>
                                      )}
                                    </Space>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        ),
                      },
                      {
                        key: "2-3",
                        label: "Thể Loại",
                        children: (
                          <div>
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              style={{
                                marginBottom: 10,
                                borderRadius: 15,
                                borderColor: DORA_BLUE,
                                color: DORA_BLUE,
                              }}
                              block
                              onClick={() => {
                                setEditingItem(null);
                                catForm.resetFields();
                                setIsCatModal(true);
                              }}
                            >
                              Thêm Thể Loại
                            </Button>
                            <Table
                              dataSource={categories}
                              rowKey="MaTheLoai"
                              pagination={{ pageSize: 6 }}
                              columns={[
                                { title: "Tên", dataIndex: "TenTheLoai" },
                                {
                                  title: "Thao tác",
                                  width: 100,
                                  render: (_, r) => (
                                    <Space>
                                      <Button
                                        type="text"
                                        icon={
                                          <EditOutlined
                                            style={{ color: DORA_BLUE }}
                                          />
                                        }
                                        onClick={() => {
                                          setEditingItem(r);
                                          catForm.setFieldsValue({
                                            tenTheLoai: r.TenTheLoai,
                                          });
                                          setIsCatModal(true);
                                        }}
                                      />
                                      {isAdmin && (
                                        <Popconfirm
                                          title="Xóa?"
                                          onConfirm={() =>
                                            deleteCategory(r.MaTheLoai)
                                          }
                                        >
                                          <Button
                                            type="text"
                                            icon={
                                              <DeleteOutlined
                                                style={{ color: DORA_RED }}
                                              />
                                            }
                                          />
                                        </Popconfirm>
                                      )}
                                    </Space>
                                  ),
                                },
                              ]}
                            />
                          </div>
                        ),
                      },
                      isAdmin
                        ? {
                            key: "2-4",
                            label: "Nhân Viên",
                            children: (
                              <div>
                                <Button
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  style={{
                                    marginBottom: 10,
                                    borderRadius: 15,
                                    borderColor: DORA_BLUE,
                                    color: DORA_BLUE,
                                  }}
                                  block
                                  onClick={() => {
                                    userForm.resetFields();
                                    setIsUserModal(true);
                                  }}
                                >
                                  Thêm Nhân Viên
                                </Button>
                                <Table
                                  dataSource={users}
                                  rowKey="Id"
                                  pagination={{ pageSize: 6 }}
                                  columns={[
                                    {
                                      title: "Username",
                                      dataIndex: "TenDangNhap",
                                    },
                                    { title: "Họ Tên", dataIndex: "HoTen" },
                                    {
                                      title: "Vai Trò",
                                      dataIndex: "Quyen",
                                      render: (v) =>
                                        v === 1 ? (
                                          <Tag color="red">Admin</Tag>
                                        ) : (
                                          <Tag color="blue">Nhân Viên</Tag>
                                        ),
                                    },
                                    {
                                      title: "Xóa",
                                      width: 60,
                                      render: (_, r) =>
                                        r.TenDangNhap !== "admin" && (
                                          <Popconfirm
                                            title="Xóa?"
                                            onConfirm={() => deleteUser(r.Id)}
                                          >
                                            <Button
                                              type="text"
                                              icon={
                                                <DeleteOutlined
                                                  style={{ color: DORA_RED }}
                                                />
                                              }
                                            />
                                          </Popconfirm>
                                        ),
                                    },
                                  ]}
                                />
                              </div>
                            ),
                          }
                        : null,
                    ].filter(Boolean)}
                  />
                ),
              },
              {
                key: "3",
                label: (
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>
                    <BarChartOutlined /> BÁO CÁO
                  </span>
                ),
                children: (
                  <div>
                    <Space style={{ marginBottom: 20 }}>
                      <b>Loại:</b>
                      <Radio.Group
                        value={reportType}
                        onChange={(e) => {
                          setReportData([]);
                          setReportType(e.target.value);
                        }}
                        buttonStyle="solid"
                      >
                        <Radio.Button value="ton">Tồn Kho</Radio.Button>
                        <Radio.Button value="congno">Công Nợ</Radio.Button>
                      </Radio.Group>
                      <b>Tháng:</b>
                      <InputNumber
                        min={1}
                        max={12}
                        value={month}
                        onChange={setMonth}
                        style={{ borderRadius: 10 }}
                      />
                      <b>Năm:</b>
                      <InputNumber
                        value={year}
                        onChange={setYear}
                        style={{ borderRadius: 10 }}
                      />
                      <Button
                        type="primary"
                        shape="round"
                        onClick={fetchReport}
                      >
                        Xem
                      </Button>
                      {reportData.length > 0 && (
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => handlePrint("report", reportData)}
                        >
                          In Báo Cáo
                        </Button>
                      )}
                    </Space>
                    <Table
                      dataSource={reportData}
                      columns={
                        reportType === "ton"
                          ? [
                              {
                                title: "STT",
                                render: (t, r, i) => i + 1,
                                width: 50,
                              },
                              { title: "Sách", dataIndex: "TenSach" },
                              {
                                title: "Tồn Đầu",
                                dataIndex: "TonDau",
                                align: "center",
                              },
                              {
                                title: "Nhập",
                                dataIndex: "PhatSinhNhap",
                                align: "center",
                                render: (v) =>
                                  v > 0 ? (
                                    <span style={{ color: "green" }}>+{v}</span>
                                  ) : (
                                    v
                                  ),
                              },
                              {
                                title: "Xuất",
                                dataIndex: "PhatSinhXuat",
                                align: "center",
                                render: (v) =>
                                  v > 0 ? (
                                    <span style={{ color: "red" }}>-{v}</span>
                                  ) : (
                                    v
                                  ),
                              },
                              {
                                title: "Tồn Cuối",
                                dataIndex: "TonCuoi",
                                align: "center",
                                render: (v) => <b>{v}</b>,
                              },
                            ]
                          : [
                              {
                                title: "STT",
                                render: (t, r, i) => i + 1,
                                width: 50,
                              },
                              { title: "Khách", dataIndex: "HoTen" },
                              {
                                title: "Nợ Đầu",
                                dataIndex: "NoDau",
                                align: "right",
                                render: (v) => formatMoney(v),
                              },
                              {
                                title: "Tăng",
                                dataIndex: "PhatSinhTang",
                                align: "right",
                                render: (v) =>
                                  v > 0 ? (
                                    <span style={{ color: "red" }}>
                                      +{formatMoney(v)}
                                    </span>
                                  ) : (
                                    v
                                  ),
                              },
                              {
                                title: "Giảm",
                                dataIndex: "PhatSinhGiam",
                                align: "right",
                                render: (v) =>
                                  v > 0 ? (
                                    <span style={{ color: "green" }}>
                                      -{formatMoney(v)}
                                    </span>
                                  ) : (
                                    v
                                  ),
                              },
                              {
                                title: "Nợ Cuối",
                                dataIndex: "NoCuoi",
                                align: "right",
                                render: (v) => (
                                  <Tag color="red">{formatMoney(v)}</Tag>
                                ),
                              },
                            ]
                      }
                      rowKey={reportType === "ton" ? "MaSach" : "MaKhachHang"}
                      loading={loading}
                      bordered
                    />
                  </div>
                ),
              },
              isAdmin
                ? {
                    key: "4",
                    label: (
                      <span style={{ fontSize: 16, fontWeight: "bold" }}>
                        <SettingOutlined /> CẤU HÌNH
                      </span>
                    ),
                    children: (
                      <Row justify="center">
                        <Col span={12}>
                          <Card
                            title="Tham Số Quy Định"
                            bordered={false}
                            style={{
                              borderRadius: 20,
                              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                            }}
                          >
                            <Form
                              form={ruleForm}
                              layout="horizontal"
                              labelCol={{ span: 14 }}
                              wrapperCol={{ span: 10 }}
                              onFinish={handleRules}
                            >
                              {rules.map((r) => (
                                <Form.Item
                                  key={r.MaThamSo}
                                  name={r.MaThamSo}
                                  label={r.MoTa}
                                  rules={[{ required: true }]}
                                >
                                  <InputNumber
                                    style={{ width: "100%", borderRadius: 10 }}
                                  />
                                </Form.Item>
                              ))}
                              <Button
                                type="primary"
                                htmlType="submit"
                                block
                                shape="round"
                                size="large"
                              >
                                Lưu Thay Đổi
                              </Button>
                            </Form>
                          </Card>
                        </Col>
                      </Row>
                    ),
                  }
                : null,
            ].filter(Boolean)}
          />
        </Card>
      </Content>
      <Footer
        style={{ textAlign: "center", color: DORA_BLUE, fontWeight: "bold" }}
      >
        Made by TuTi team ©2025
      </Footer>

      {/* MODAL NHẬP HÀNG */}
      <Modal
        title="Nhập Sách Vào Kho"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setImportItems([]);
        }}
        onOk={submitImport}
        width={700}
        okText="Lưu Phiếu Nhập"
        cancelText="Hủy"
      >
        <div
          style={{
            background: "#E3F2FD",
            padding: 15,
            marginBottom: 15,
            borderRadius: 15,
          }}
        >
          <Form form={tempImportForm} layout="inline" onFinish={addImportItem}>
            <Form.Item
              name="maSach"
              rules={[{ required: true }]}
              style={{ width: 250 }}
            >
              <Select
                placeholder="Chọn sách"
                showSearch
                optionFilterProp="children"
              >
                {books.map((b) => (
                  <Option key={b.MaSach} value={b.MaSach}>
                    {b.TenSach} (Tồn: {b.SoLuongTon})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="soLuong"
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <InputNumber placeholder="SL" min={1} />
            </Form.Item>
            <Form.Item
              name="donGia"
              rules={[{ required: true }]}
              style={{ width: 150 }}
            >
              <InputNumber
                placeholder="Đơn giá"
                min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                shape="circle"
              />
            </Form.Item>
          </Form>
        </div>
        <Table
          dataSource={importItems}
          rowKey="maSach"
          pagination={false}
          size="small"
          columns={[
            { title: "Sách", dataIndex: "tenSach" },
            { title: "SL", dataIndex: "soLuong" },
            {
              title: "Đơn Giá",
              dataIndex: "donGia",
              render: (v) => v.toLocaleString(),
            },
            {
              title: "Thành Tiền",
              dataIndex: "thanhTien",
              render: (v) => formatMoney(v),
            },
            {
              render: (_, r) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setImportItems(
                      importItems.filter((i) => i.maSach !== r.maSach)
                    )
                  }
                />
              ),
            },
          ]}
          summary={(pageData) => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <b>Tổng Cộng:</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <b>
                  {formatMoney(pageData.reduce((s, c) => s + c.thanhTien, 0))}
                </b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Modal>

      {/* MODAL BÁN HÀNG */}
      <Modal
        title="Lập Hóa Đơn Bán"
        open={isSellModalOpen}
        onCancel={() => {
          setIsSellModalOpen(false);
          setSaleItems([]);
          setSelectedCustomer(null);
        }}
        onOk={submitSale}
        width={800}
        okText="Thanh Toán"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 15 }}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn Khách Hàng (Gõ tên để tìm...)"
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            showSearch
            optionFilterProp="children"
            size="large"
          >
            {customers.map((c) => (
              <Option key={c.MaKhachHang} value={c.MaKhachHang}>
                {c.HoTen} (Nợ: {formatMoney(c.TienNoHienTai)})
              </Option>
            ))}
          </Select>
        </div>
        <div
          style={{
            background: "#FFF3E0",
            padding: 15,
            marginBottom: 15,
            borderRadius: 15,
          }}
        >
          <Form form={tempSaleForm} layout="inline" onFinish={addSaleItem}>
            <Form.Item
              name="maSach"
              rules={[{ required: true }]}
              style={{ width: 350 }}
            >
              <Select
                placeholder="Chọn sách bán"
                showSearch
                optionFilterProp="children"
              >
                {books.map((b) => (
                  <Option key={b.MaSach} value={b.MaSach}>
                    {b.TenSach} (Giá:{" "}
                    {formatMoney(
                      (b.DonGiaNhapGanNhat *
                        (rules.find((r) => r.MaThamSo === "TiLeGiaBan")
                          ?.GiaTri || 105)) /
                        100
                    )}
                    ) - Tồn: {b.SoLuongTon}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="soLuong"
              rules={[{ required: true }]}
              style={{ width: 100 }}
            >
              <InputNumber placeholder="SL" min={1} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                shape="circle"
                style={{ background: DORA_YELLOW, borderColor: DORA_YELLOW }}
              />
            </Form.Item>
          </Form>
        </div>
        <Table
          dataSource={saleItems}
          rowKey="maSach"
          pagination={false}
          size="small"
          columns={[
            { title: "Sách", dataIndex: "tenSach" },
            { title: "SL", dataIndex: "soLuong" },
            {
              title: "Đơn Giá",
              dataIndex: "donGiaBan",
              render: (v) => v.toLocaleString(),
            },
            {
              title: "Thành Tiền",
              dataIndex: "thanhTien",
              render: (v) => formatMoney(v),
            },
            {
              render: (_, r) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setSaleItems(saleItems.filter((i) => i.maSach !== r.maSach))
                  }
                />
              ),
            },
          ]}
        />
        <div style={{ textAlign: "right", marginTop: 15, fontSize: 16 }}>
          <b>
            Tổng Tiền:{" "}
            {formatMoney(saleItems.reduce((s, i) => s + i.thanhTien, 0))}
          </b>
          <br />
          <div style={{ marginTop: 5 }}>
            Khách Trả:{" "}
            <InputNumber
              style={{ width: 150 }}
              value={paymentAmount}
              onChange={setPaymentAmount}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL KHÁC */}
      <Modal
        title="Thu Tiền Nợ"
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        onOk={() => payForm.submit()}
      >
        <Form form={payForm} layout="vertical" onFinish={handleThu}>
          <Form.Item
            name="maKhachHang"
            label="Khách Hàng"
            rules={[{ required: true }]}
          >
            <Select>
              {customers.map((c) => (
                <Option key={c.MaKhachHang} value={c.MaKhachHang}>
                  {c.HoTen} (Nợ: {c.TienNoHienTai})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="soTienThu"
            label="Số Tiền Thu"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={editingItem ? "Sửa Khách" : "Thêm Khách Mới"}
        open={isCustomerModal}
        onCancel={() => setIsCustomerModal(false)}
        onOk={() => custForm.submit()}
      >
        <Form form={custForm} layout="vertical" onFinish={saveCustomer}>
          <Form.Item name="HoTen" label="Họ Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="SoDienThoai"
            label="Số Điện Thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="DiaChi" label="Địa Chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="Email" label="Email">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={editingItem ? "Sửa Thể Loại" : "Thêm Thể Loại"}
        open={isCatModal}
        onCancel={() => setIsCatModal(false)}
        onOk={() => catForm.submit()}
      >
        <Form form={catForm} layout="vertical" onFinish={saveCategory}>
          <Form.Item
            name="tenTheLoai"
            label="Tên Thể Loại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={editingItem ? "Cập Nhật Sách" : "Thêm Sách Mới"}
        open={isBookModal}
        onCancel={() => setIsBookModal(false)}
        onOk={() => bookForm.submit()}
      >
        <Form form={bookForm} layout="vertical" onFinish={saveBook}>
          <Form.Item
            name="TenSach"
            label="Tên Sách"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="MaTheLoai"
            label="Thể Loại"
            rules={[{ required: true }]}
          >
            <Select>
              {categories.map((c) => (
                <Option key={c.MaTheLoai} value={c.MaTheLoai}>
                  {c.TenTheLoai}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="TacGia" label="Tác Giả">
            <Input />
          </Form.Item>
          {!editingItem && (
            <Form.Item
              name="DonGiaNhapGanNhat"
              label="Đơn Giá Nhập (Gốc)"
              help="Để tính giá bán ban đầu"
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        title="Cấp Tài Khoản Mới"
        open={isUserModal}
        onCancel={() => setIsUserModal(false)}
        onOk={() => userForm.submit()}
      >
        <Form form={userForm} layout="vertical" onFinish={saveUser}>
          <Form.Item
            name="tenDangNhap"
            label="Tên Đăng Nhập"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="matKhau"
            label="Mật Khẩu"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="hoTen"
            label="Họ Tên Nhân Viên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="quyen" label="Chức Vụ" initialValue={2}>
            <Select>
              <Option value={1}>Quản Trị Viên (Admin)</Option>
              <Option value={2}>Nhân Viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT & IN */}
      <Modal
        title="Chi Tiết"
        open={isDetailModal}
        onCancel={() => setIsDetailModal(false)}
        footer={
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint("invoice", detailData)}
          >
            In Phiếu
          </Button>
        }
        width={700}
      >
        <Table
          dataSource={detailData}
          rowKey={detailType === "hoadon" ? "MaCTHD" : "MaCTPN"}
          columns={[
            { title: "Sách", dataIndex: "TenSach" },
            {
              title: "SL",
              dataIndex: detailType === "hoadon" ? "SoLuong" : "SoLuongNhap",
            },
            {
              title: "Đơn Giá",
              dataIndex: detailType === "hoadon" ? "DonGiaBan" : "DonGiaNhap",
              render: (v) => v?.toLocaleString(),
            },
            {
              title: "Thành Tiền",
              dataIndex: "ThanhTien",
              render: (v) => <b>{formatMoney(v)}</b>,
            },
          ]}
          pagination={false}
          bordered
          summary={(pageData) => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <b>Tổng:</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>
                  {formatMoney(pageData.reduce((s, c) => s + c.ThanhTien, 0))}
                </b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Modal>
    </Layout>
  );
}
export default App;
