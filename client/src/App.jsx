// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, Typography, Button, Modal, Form, InputNumber, Select, 
  message, Tabs, Radio, Input, Layout, Card, Space, Tag, Statistic, Row, Col, Badge, Avatar, Dropdown 
} from 'antd';
import { 
  PlusOutlined, ShoppingCartOutlined, DollarOutlined, 
  SearchOutlined, BookOutlined, BarChartOutlined, SettingOutlined,
  UserOutlined, HomeOutlined, LockOutlined, LogoutOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography; 
const { Option } = Select;
const { Header, Content, Footer } = Layout;

function App() {
  // --- STATE ĐĂNG NHẬP (SỬA THÀNH SESSION STORAGE) ---
  // Khi tắt trình duyệt, sessionStorage tự xóa -> Phải đăng nhập lại
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));

  // --- STATE NGHIỆP VỤ ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false); const [form] = Form.useForm();
  const [isSellModalOpen, setIsSellModalOpen] = useState(false); const [sellForm] = Form.useForm();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false); const [payForm] = Form.useForm();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false); const [customerForm] = Form.useForm(); // Thêm modal khách

  // Report & Rule states
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('ton');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchText, setSearchText] = useState('');
  const [rules, setRules] = useState([]); const [ruleForm] = Form.useForm();

  // --- LOGIN / LOGOUT ---
  const handleLogin = async (values) => {
    try {
        const res = await axios.post('http://localhost:5000/api/login', values);
        const { token, user } = res.data;
        
        // SỬA: Dùng sessionStorage thay vì localStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setCurrentUser(user);
        message.success(`Xin chào, ${user.hoTen}!`);
    } catch (error) {
        message.error(error.response?.data?.error || "Lỗi đăng nhập");
    }
  };

  const handleLogout = () => {
      // SỬA: Xóa khỏi sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setCurrentUser({});
      message.info("Đã đăng xuất");
  };

  const fetchAllData = () => { if (!token) return; fetchBooks(); fetchCustomers(); fetchRules(); };
  const fetchBooks = async () => { setLoading(true); try { const res = await axios.get('http://localhost:5000/api/sach'); setBooks(res.data); } catch (e) {} setLoading(false); };
  const fetchCustomers = async () => { try { const res = await axios.get('http://localhost:5000/api/khach-hang'); setCustomers(res.data); } catch (e) {} };
  const fetchRules = async () => { try { const res = await axios.get('http://localhost:5000/api/quy-dinh'); setRules(res.data); } catch (e) {} };
  const fetchReport = async () => { setLoading(true); const url = reportType === 'ton' ? `http://localhost:5000/api/bao-cao/ton?thang=${month}&nam=${year}` : `http://localhost:5000/api/bao-cao/cong-no?thang=${month}&nam=${year}`; try { const res = await axios.get(url); setReportData(res.data); message.success("Tải xong báo cáo"); } catch (e) { message.error("Lỗi tải báo cáo"); } setLoading(false); };

  useEffect(() => { fetchAllData(); }, [token]);

  // --- HANDLERS ---
  const handleNhapSach = async (v) => { try { await axios.post('http://localhost:5000/api/nhap-sach', { danhSachSachNhap: [{ maSach: v.maSach, soLuong: v.soLuong, donGia: v.donGia }] }); message.success('Nhập thành công'); setIsModalOpen(false); fetchBooks(); } catch (e) { message.error('Lỗi'); } };
  const handleBanSach = async (v) => { const sach = books.find(b => b.MaSach === v.maSach); try { await axios.post('http://localhost:5000/api/ban-sach', { maKhachHang: v.maKhachHang, soTienTra: v.soTienTra, danhSachSachBan: [{ maSach: v.maSach, soLuong: v.soLuong, donGiaNhapGanNhat: sach.DonGiaNhapGanNhat }] }); message.success('Bán thành công'); setIsSellModalOpen(false); fetchBooks(); fetchCustomers(); } catch (e) { message.error(e.response?.data?.error || 'Lỗi'); } };
  const handleThuTien = async (v) => { try { await axios.post('http://localhost:5000/api/thu-tien', v); message.success('Thu tiền thành công'); setIsPayModalOpen(false); fetchCustomers(); } catch (e) { message.error(e.response?.data?.error || 'Lỗi'); } };
  const handleSaveRules = async (v) => { try { await axios.post('http://localhost:5000/api/quy-dinh', { quyDinh: v }); message.success("Cập nhật thành công"); fetchRules(); } catch (e) { message.error("Lỗi"); } };
  const handleAddCustomer = async (v) => { try { await axios.post('http://localhost:5000/api/khach-hang', v); message.success('Thêm khách hàng thành công'); setIsCustomerModalOpen(false); customerForm.resetFields(); fetchCustomers(); } catch (e) { message.error('Lỗi thêm khách'); } };

  // --- COLUMNS ---
  const columnsBook = [ { title: 'Mã', dataIndex: 'MaSach', width: 60, render: t => <Tag color="blue">#{t}</Tag> }, { title: 'Tên Sách', dataIndex: 'TenSach', render: t => <b>{t}</b> }, { title: 'Tác Giả', dataIndex: 'TacGia' }, { title: 'Tồn', dataIndex: 'SoLuongTon', render: v => <Badge status={v<20?"error":"success"} text={<b style={{color:v<20?'red':'green'}}>{v}</b>} /> }, { title: 'Giá Bán', dataIndex: 'DonGiaNhapGanNhat', render: v => <Tag color="gold">{(v * (rules.find(r=>r.MaThamSo==='TiLeGiaBan')?.GiaTri || 105)/100).toLocaleString()} ₫</Tag> } ];
  const columnsTon = [{ title: 'Sách', dataIndex: 'TenSach' }, { title: 'Tồn Đầu', dataIndex: 'TonDau' }, { title: 'Nhập', dataIndex: 'PhatSinhNhap', render: v=>v>0?<span style={{color:'green'}}>+{v}</span>:v }, { title: 'Xuất', dataIndex: 'PhatSinhXuat', render: v=>v>0?<span style={{color:'red'}}>-{v}</span>:v }, { title: 'Tồn Cuối', dataIndex: 'TonCuoi', render: v=><b>{v}</b> }];
  const columnsCongNo = [{ title: 'Khách', dataIndex: 'HoTen' }, { title: 'Nợ Đầu', dataIndex: 'NoDau', render: v=>v.toLocaleString() }, { title: 'Tăng', dataIndex: 'PhatSinhTang', render: v=>v>0?<span style={{color:'red'}}>+{v.toLocaleString()}</span>:v }, { title: 'Giảm', dataIndex: 'PhatSinhGiam', render: v=>v>0?<span style={{color:'green'}}>-{v.toLocaleString()}</span>:v }, { title: 'Nợ Cuối', dataIndex: 'NoCuoi', render: v=><Tag color="red">{v.toLocaleString()} ₫</Tag> }];

  // --- RENDER LOGIN ---
  if (!token) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <BookOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                    <Title level={3} style={{ marginTop: 10 }}>Bookstore Login</Title>
                    <Text type="secondary">Hệ thống quản lý nhà sách nội bộ</Text>
                </div>
                <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}><Input size="large" prefix={<UserOutlined />} placeholder="Tài khoản (admin)" /></Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}><Input.Password size="large" prefix={<LockOutlined />} placeholder="Mật khẩu" /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>Đăng Nhập</Button></Form.Item>
                </Form>
                <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>Tài khoản được cấp bởi Quản trị viên</div>
            </Card>
        </div>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 30px' }}>
         <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}><BookOutlined style={{ fontSize: 24 }} /> QUẢN LÝ NHÀ SÁCH</div>
         <Dropdown menu={{ items: [{ key: '1', label: 'Đăng Xuất', icon: <LogoutOutlined />, onClick: handleLogout }] }}>
            <div style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}><Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} /><span>{currentUser.hoTen}</span></div>
         </Dropdown>
      </Header>
      
      <Content style={{ padding: '20px 50px', background: '#f0f2f5' }}>
        <Card style={{ borderRadius: 10, minHeight: '80vh' }}>
          <Tabs defaultActiveKey="1" type="card" size="large" items={[
            {
              key: '1', label: <span><HomeOutlined /> QUẢN LÝ NGHIỆP VỤ</span>,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Input.Search placeholder="Tìm kiếm sách..." allowClear style={{ maxWidth: 400 }} onChange={e => setSearchText(e.target.value)} />
                    <Space>
                        <Button type="primary" style={{ background: '#722ed1', borderColor: '#722ed1' }} icon={<UserOutlined />} onClick={() => setIsCustomerModalOpen(true)}>+ Khách Hàng</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Nhập Sách</Button>
                        <Button style={{background: '#faad14', color: 'white'}} icon={<ShoppingCartOutlined />} onClick={() => setIsSellModalOpen(true)}>Bán Sách</Button>
                        <Button style={{background: '#52c41a', color: 'white'}} icon={<DollarOutlined />} onClick={() => setIsPayModalOpen(true)}>Thu Tiền</Button>
                    </Space>
                  </div>
                  <Table dataSource={books.filter(b => b.TenSach.toLowerCase().includes(searchText.toLowerCase()))} columns={columnsBook} rowKey="MaSach" loading={loading} bordered pagination={{ pageSize: 8 }} />
                </div>
              )
            },
            {
              key: '2', label: <span><BarChartOutlined /> BÁO CÁO</span>,
              children: (
                <div>
                  <Space style={{ marginBottom: 20 }}>
                     <b>Loại:</b> <Radio.Group value={reportType} onChange={e => { setReportData([]); setReportType(e.target.value); }} buttonStyle="solid"><Radio.Button value="ton">Tồn Kho</Radio.Button><Radio.Button value="congno">Công Nợ</Radio.Button></Radio.Group>
                     <b>Tháng:</b> <InputNumber min={1} max={12} value={month} onChange={setMonth} /> <b>Năm:</b> <InputNumber min={2020} value={year} onChange={setYear} /> <Button type="primary" onClick={fetchReport}>Xem</Button>
                  </Space>
                  <Table dataSource={reportData} columns={reportType === 'ton' ? columnsTon : columnsCongNo} rowKey={reportType === 'ton' ? "MaSach" : "MaKhachHang"} loading={loading} bordered />
                </div>
              )
            },
            {
              key: '3', label: <span><SettingOutlined /> QUY ĐỊNH</span>,
              children: (
                <Row justify="center"><Col span={12}><Card title="Cấu Hình Hệ Thống" bordered={false}><Form form={ruleForm} layout="horizontal" labelCol={{span: 14}} wrapperCol={{span: 10}} onFinish={handleSaveRules}>{rules.map(r => <Form.Item key={r.MaThamSo} name={r.MaThamSo} label={r.MoTa} rules={[{required: true}]}><InputNumber style={{width: '100%'}} /></Form.Item>)}<Button type="primary" htmlType="submit" block>Lưu Thay Đổi</Button></Form></Card></Col></Row>
              )
            }
          ]} />
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Bookstore System ©2024</Footer>

      {/* MODALS */}
      <Modal title="Nhập Sách" open={isModalOpen} onCancel={()=>setIsModalOpen(false)} onOk={()=>form.submit()}><Form form={form} layout="vertical" onFinish={handleNhapSach}><Form.Item name="maSach" label="Sách" rules={[{required:true}]}><Select showSearch optionFilterProp="children">{books.map(b=><Option key={b.MaSach} value={b.MaSach}>{b.TenSach}</Option>)}</Select></Form.Item><Form.Item name="soLuong" label="Số lượng" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}}/></Form.Item><Form.Item name="donGia" label="Đơn giá" rules={[{required:true}]}><InputNumber min={0} style={{width:'100%'}}/></Form.Item></Form></Modal>
      <Modal title="Bán Sách" open={isSellModalOpen} onCancel={()=>setIsSellModalOpen(false)} onOk={()=>sellForm.submit()}><Form form={sellForm} layout="vertical" onFinish={handleBanSach}><Form.Item name="maKhachHang" label="Khách" rules={[{required:true}]}><Select>{customers.map(c=><Option key={c.MaKhachHang} value={c.MaKhachHang}>{c.HoTen}</Option>)}</Select></Form.Item><Form.Item name="maSach" label="Sách" rules={[{required:true}]}><Select showSearch optionFilterProp="children">{books.map(b=><Option key={b.MaSach} value={b.MaSach}>{b.TenSach} (Tồn: {b.SoLuongTon})</Option>)}</Select></Form.Item><Form.Item name="soLuong" label="Số lượng" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}}/></Form.Item><Form.Item name="soTienTra" label="Trả trước" initialValue={0}><InputNumber style={{width:'100%'}}/></Form.Item></Form></Modal>
      <Modal title="Thu Tiền" open={isPayModalOpen} onCancel={()=>setIsPayModalOpen(false)} onOk={()=>payForm.submit()}><Form form={payForm} layout="vertical" onFinish={handleThuTien}><Form.Item name="maKhachHang" label="Khách" rules={[{required:true}]}><Select>{customers.map(c=><Option key={c.MaKhachHang} value={c.MaKhachHang}>{c.HoTen} (Nợ: {c.TienNoHienTai})</Option>)}</Select></Form.Item><Form.Item name="soTienThu" label="Số tiền thu" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}}/></Form.Item></Form></Modal>
      <Modal title="Thêm Khách Hàng Mới" open={isCustomerModalOpen} onCancel={() => setIsCustomerModalOpen(false)} onOk={() => customerForm.submit()}><Form form={customerForm} layout="vertical" onFinish={handleAddCustomer}><Form.Item name="hoTen" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập tên khách' }]}><Input placeholder="Ví dụ: Nguyễn Văn A" /></Form.Item><Form.Item name="soDienThoai" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}><Input placeholder="0909..." /></Form.Item><Form.Item name="diaChi" label="Địa Chỉ"><Input placeholder="Quận 1, TP.HCM" /></Form.Item><Form.Item name="email" label="Email"><Input placeholder="khachhang@gmail.com" /></Form.Item></Form></Modal>
    </Layout>
  );
}

export default App;