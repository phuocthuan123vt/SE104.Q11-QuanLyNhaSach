// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, Typography, Button, Modal, Form, InputNumber, Select, 
  message, Tabs, Radio, Input, Layout, Card, Space, Tag, Statistic, Row, Col, Badge 
} from 'antd';
import { 
  PlusOutlined, ShoppingCartOutlined, DollarOutlined, 
  SearchOutlined, BookOutlined, BarChartOutlined, SettingOutlined,
  UserOutlined, HomeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Header, Content, Footer } = Layout;

function App() {
  // --- STATE (GIỮ NGUYÊN KHÔNG ĐỔI) ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [form] = Form.useForm();
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false); 
  const [sellForm] = Form.useForm();

  const [isPayModalOpen, setIsPayModalOpen] = useState(false); 
  const [payForm] = Form.useForm();

  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('ton');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [searchText, setSearchText] = useState('');
  const [rules, setRules] = useState([]);
  const [ruleForm] = Form.useForm();

  // --- API CALLS (GIỮ NGUYÊN) ---
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/sach');
      setBooks(res.data);
    } catch (error) { console.log(error); }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/khach-hang');
      setCustomers(res.data);
    } catch (error) { console.log(error); }
  };

  const fetchRules = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/quy-dinh');
        setRules(res.data);
        const initVal = {};
        res.data.forEach(r => initVal[r.MaThamSo] = r.GiaTri);
        ruleForm.setFieldsValue(initVal);
    } catch (e) { console.log(e); }
  };

  const fetchReport = async () => {
    setLoading(true);
    const url = reportType === 'ton' 
        ? `http://localhost:5000/api/bao-cao/ton?thang=${month}&nam=${year}`
        : `http://localhost:5000/api/bao-cao/cong-no?thang=${month}&nam=${year}`;
    try {
        const res = await axios.get(url);
        setReportData(res.data);
        message.success(`Đã tải báo cáo tháng ${month}/${year}`);
    } catch (error) { message.error("Lỗi tải báo cáo"); }
    setLoading(false);
  };

  useEffect(() => { 
    fetchBooks(); fetchCustomers(); fetchRules(); 
  }, []);

  // --- HANDLERS (GIỮ NGUYÊN) ---
  const handleNhapSach = async (values) => {
    const payload = { danhSachSachNhap: [{ maSach: values.maSach, soLuong: values.soLuong, donGia: values.donGia }] };
    try {
        await axios.post('http://localhost:5000/api/nhap-sach', payload);
        message.success('Nhập sách thành công!');
        setIsModalOpen(false); form.resetFields(); fetchBooks();
    } catch (error) { message.error('Lỗi nhập sách'); }
  };

  const handleBanSach = async (values) => {
    const sachChon = books.find(b => b.MaSach === values.maSach);
    const payload = {
        maKhachHang: values.maKhachHang, soTienTra: values.soTienTra,
        danhSachSachBan: [{ maSach: values.maSach, soLuong: values.soLuong, donGiaNhapGanNhat: sachChon.DonGiaNhapGanNhat }]
    };
    try {
      await axios.post('http://localhost:5000/api/ban-sach', payload);
      message.success('Bán sách thành công!');
      setIsSellModalOpen(false); sellForm.resetFields(); fetchBooks(); fetchCustomers();
    } catch (error) { message.error(error.response?.data?.error || 'Lỗi bán sách'); }
  };

  const handleThuTien = async (values) => {
    try {
        await axios.post('http://localhost:5000/api/thu-tien', values);
        message.success('Đã thu tiền thành công!');
        setIsPayModalOpen(false); payForm.resetFields(); fetchCustomers();
    } catch (error) { message.error(error.response?.data?.error || 'Lỗi thu tiền'); }
  };

  const handleSaveRules = async (values) => {
    try {
        await axios.post('http://localhost:5000/api/quy-dinh', { quyDinh: values });
        message.success("Cập nhật quy định thành công!");
        fetchRules();
    } catch (e) { message.error("Lỗi cập nhật"); }
  };

  // --- COLUMN CONFIGURATION (NÂNG CẤP GIAO DIỆN) ---
  const columnsBook = [
    { 
      title: 'Mã Sách', dataIndex: 'MaSach', key: 'MaSach', width: 80, align: 'center',
      render: text => <Tag color="blue">#{text}</Tag> 
    },
    { 
      title: 'Tên Sách', dataIndex: 'TenSach', key: 'TenSach', 
      render: t => <b style={{ fontSize: 15 }}>{t}</b> 
    },
    { title: 'Tác Giả', dataIndex: 'TacGia', key: 'TacGia', render: t => <span style={{color: '#666'}}>{t}</span> },
    { 
      title: 'Tồn Kho', dataIndex: 'SoLuongTon', key: 'SoLuongTon', 
      render: v => (
        <Badge status={v < 20 ? "error" : "success"} text={<span style={{color: v<20?'red':'green', fontWeight: 'bold'}}>{v}</span>} />
      )
    },
    { 
      title: 'Giá Bán (Dự kiến)', dataIndex: 'DonGiaNhapGanNhat', 
      render: v => {
        const giaBan = v * (rules.find(r=>r.MaThamSo==='TiLeGiaBan')?.GiaTri || 105)/100;
        return <Tag color="gold" style={{fontSize: 14}}>{giaBan.toLocaleString()} ₫</Tag>
      }
    }
  ];

  const columnsTon = [
    { title: 'Sách', dataIndex: 'TenSach', render: t => <b>{t}</b> },
    { title: 'Tồn Đầu', dataIndex: 'TonDau', align: 'center' }, 
    { title: 'Nhập', dataIndex: 'PhatSinhNhap', align: 'center', render: v => v>0 ? <span style={{color:'green'}}>+{v}</span> : v }, 
    { title: 'Xuất', dataIndex: 'PhatSinhXuat', align: 'center', render: v => v>0 ? <span style={{color:'red'}}>-{v}</span> : v }, 
    { title: 'Tồn Cuối', dataIndex: 'TonCuoi', align: 'center', render: v => <b>{v}</b> }
  ];

  const columnsCongNo = [
    { title: 'Khách Hàng', dataIndex: 'HoTen', render: t => <b>{t}</b> },
    { title: 'Nợ Đầu', dataIndex: 'NoDau', render: v=>v.toLocaleString() }, 
    { title: 'Tăng (Mua nợ)', dataIndex: 'PhatSinhTang', render: v => v>0 ? <span style={{color:'red'}}>+{v.toLocaleString()}</span> : v }, 
    { title: 'Giảm (Trả)', dataIndex: 'PhatSinhGiam', render: v => v>0 ? <span style={{color:'green'}}>-{v.toLocaleString()}</span> : v }, 
    { title: 'Nợ Cuối', dataIndex: 'NoCuoi', render: v=><Tag color="red">{v.toLocaleString()} ₫</Tag> }
  ];

  // --- GIAO DIỆN CHÍNH (ĐƯỢC THIẾT KẾ LẠI) ---
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529', padding: '0 30px' }}>
         <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOutlined style={{ fontSize: 24 }} /> QUẢN LÝ NHÀ SÁCH
         </div>
      </Header>
      
      <Content style={{ padding: '20px 50px', background: '#f0f2f5' }}>
        <Card style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Tabs 
            defaultActiveKey="1" 
            type="card"
            size="large"
            items={[
            {
              key: '1',
              label: <span><HomeOutlined /> QUẢN LÝ NGHIỆP VỤ</span>,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <Input.Search 
                      placeholder="Tìm kiếm sách, tác giả..." 
                      allowClear 
                      enterButton={<Button icon={<SearchOutlined />} type="primary">Tìm</Button>}
                      size="large"
                      style={{ maxWidth: 400 }} 
                      onChange={e => setSearchText(e.target.value)} 
                    />
                    
                    <Space size="middle">
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Nhập Sách</Button>
                        <Button type="primary" size="large" danger icon={<ShoppingCartOutlined />} style={{background: '#faad14', borderColor: '#faad14'}} onClick={() => setIsSellModalOpen(true)}>Bán Sách</Button>
                        <Button type="primary" size="large" style={{background: '#52c41a', borderColor: '#52c41a'}} icon={<DollarOutlined />} onClick={() => setIsPayModalOpen(true)}>Thu Tiền</Button>
                    </Space>
                  </div>

                  <Table 
                    dataSource={books.filter(b => b.TenSach.toLowerCase().includes(searchText.toLowerCase()) || b.TacGia.toLowerCase().includes(searchText.toLowerCase()))} 
                    columns={columnsBook} 
                    rowKey="MaSach" 
                    loading={loading} 
                    bordered 
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              )
            },
            {
              key: '2',
              label: <span><BarChartOutlined /> BÁO CÁO THỐNG KÊ</span>,
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={24}>
                        <Card style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                            <Space size="large" style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                <span><BarChartOutlined /> <b>Bộ Lọc Báo Cáo:</b></span>
                                <Radio.Group value={reportType} onChange={e => { setReportData([]); setReportType(e.target.value); }} buttonStyle="solid">
                                    <Radio.Button value="ton">Tồn Kho</Radio.Button>
                                    <Radio.Button value="congno">Công Nợ</Radio.Button>
                                </Radio.Group>
                                <span>Tháng:</span> <InputNumber min={1} max={12} value={month} onChange={setMonth} />
                                <span>Năm:</span> <InputNumber min={2020} value={year} onChange={setYear} />
                                <Button type="primary" onClick={fetchReport}>Xem Báo Cáo</Button>
                            </Space>
                        </Card>
                    </Col>
                  </Row>

                  {/* Hiển thị tóm tắt nếu có dữ liệu */}
                  {reportData.length > 0 && (
                      <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col span={12}>
                            <Card>
                                <Statistic title={reportType === 'ton' ? "Tổng Số Sách" : "Tổng Khách Hàng"} value={reportData.length} prefix={reportType === 'ton' ? <BookOutlined /> : <UserOutlined />} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic 
                                    title={reportType === 'ton' ? "Tổng Tồn Cuối Kỳ" : "Tổng Nợ Cuối Kỳ"} 
                                    value={reportData.reduce((sum, item) => sum + (reportType === 'ton' ? item.TonCuoi : item.NoCuoi), 0)} 
                                    precision={0}
                                    valueStyle={{ color: reportType === 'ton' ? '#3f8600' : '#cf1322' }}
                                    suffix={reportType === 'ton' ? "" : "₫"}
                                />
                            </Card>
                        </Col>
                      </Row>
                  )}

                  <Table 
                    dataSource={reportData} 
                    columns={reportType === 'ton' ? columnsTon : columnsCongNo} 
                    rowKey={reportType === 'ton' ? "MaSach" : "MaKhachHang"} 
                    loading={loading} 
                    bordered 
                  />
                </div>
              )
            },
            {
              key: '3',
              label: <span><SettingOutlined /> THAY ĐỔI QUY ĐỊNH</span>,
              children: (
                <Row justify="center">
                    <Col span={12}>
                        <Card title="⚙️ Cấu Hình Tham Số Hệ Thống" bordered={false} style={{ background: '#fff' }}>
                            <Form form={ruleForm} layout="horizontal" labelCol={{span: 14}} wrapperCol={{span: 10}} onFinish={handleSaveRules}>
                                {rules.map(r => (
                                    <Form.Item key={r.MaThamSo} name={r.MaThamSo} label={r.MoTa} rules={[{required: true}]}>
                                        <InputNumber style={{width: '100%'}} />
                                    </Form.Item>
                                ))}
                                <Button type="primary" htmlType="submit" block size="large" icon={<SettingOutlined />}>Lưu Thay Đổi</Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
              )
            }
          ]} />
        </Card>
      </Content>
      
      <Footer style={{ textAlign: 'center', color: '#888' }}>
        Bookstore Management System ©2025 Created by Ly Phuoc Thuan & Nguyen Xuan Nhat Tan
      </Footer>

      {/* --- MODALS (GIỮ NGUYÊN) --- */}
      <Modal title="Lập Phiếu Nhập Sách" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleNhapSach}>
            <Form.Item name="maSach" label="Chọn Sách" rules={[{ required: true }]}><Select placeholder="Chọn sách" showSearch optionFilterProp="children">{books.map(b => <Option key={b.MaSach} value={b.MaSach}>{b.TenSach} (Tồn: {b.SoLuongTon})</Option>)}</Select></Form.Item>
            <Form.Item name="soLuong" label="Số Lượng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
            <Form.Item name="donGia" label="Đơn Giá Nhập" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Lập Hóa Đơn Bán Sách" open={isSellModalOpen} onCancel={() => setIsSellModalOpen(false)} onOk={() => sellForm.submit()}>
        <Form form={sellForm} layout="vertical" onFinish={handleBanSach}>
          <Form.Item name="maKhachHang" label="Khách Hàng" rules={[{ required: true }]}><Select placeholder="Chọn khách">{customers.map(c => <Option key={c.MaKhachHang} value={c.MaKhachHang}>{c.HoTen} (Nợ: {new Intl.NumberFormat('vi-VN').format(c.TienNoHienTai)})</Option>)}</Select></Form.Item>
          <Form.Item name="maSach" label="Chọn Sách" rules={[{ required: true }]}><Select placeholder="Chọn sách" showSearch optionFilterProp="children">{books.map(b => <Option key={b.MaSach} value={b.MaSach}>{b.TenSach} (Tồn: {b.SoLuongTon})</Option>)}</Select></Form.Item>
          <Form.Item name="soLuong" label="Số Lượng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
          <Form.Item name="soTienTra" label="Tiền Khách Trả" rules={[{ required: true }]} initialValue={0}><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
          <p style={{color: 'gray', fontSize: 12}}>* Giá bán sẽ tự động tính bằng 105% giá nhập (hoặc theo quy định)</p>
        </Form>
      </Modal>

      <Modal title="Lập Phiếu Thu Tiền" open={isPayModalOpen} onCancel={() => setIsPayModalOpen(false)} onOk={() => payForm.submit()}>
        <Form form={payForm} layout="vertical" onFinish={handleThuTien}>
          <Form.Item name="maKhachHang" label="Khách Hàng" rules={[{ required: true }]}><Select placeholder="Chọn khách">{customers.map(c => <Option key={c.MaKhachHang} value={c.MaKhachHang}>{c.HoTen} (Nợ: {new Intl.NumberFormat('vi-VN').format(c.TienNoHienTai)})</Option>)}</Select></Form.Item>
          <Form.Item name="soTienThu" label="Số Tiền Thu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;