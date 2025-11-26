// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Button, Modal, Form, InputNumber, Select, message, Tabs, Radio, Input } from 'antd'; // Thêm Input

const { Title } = Typography;
const { Option } = Select;

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  // --- State Nghiệp vụ ---
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [form] = Form.useForm();
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false); 
  const [sellForm] = Form.useForm();

  const [isPayModalOpen, setIsPayModalOpen] = useState(false); 
  const [payForm] = Form.useForm();

  // --- State Báo cáo ---
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('ton');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // --- [MỚI] State Tra cứu & Quy định ---
  const [searchText, setSearchText] = useState('');
  const [rules, setRules] = useState([]);
  const [ruleForm] = Form.useForm();

  // --- API Calls ---
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

  // --- Handlers ---
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

  // --- Columns ---
  const columnsBook = [
    { title: 'Mã', dataIndex: 'MaSach', key: 'MaSach' },
    { title: 'Tên Sách', dataIndex: 'TenSach', key: 'TenSach', render: t => <b>{t}</b> },
    { title: 'Tác Giả', dataIndex: 'TacGia', key: 'TacGia' },
    { title: 'Tồn Kho', dataIndex: 'SoLuongTon', key: 'SoLuongTon', render: v => <span style={{color: v<20?'red':'green'}}>{v}</span> },
    { title: 'Giá Bán (Dự kiến)', dataIndex: 'DonGiaNhapGanNhat', render: v => (v * (rules.find(r=>r.MaThamSo==='TiLeGiaBan')?.GiaTri || 105)/100).toLocaleString() }
  ];

  const columnsTon = [
    { title: 'Sách', dataIndex: 'TenSach' },
    { title: 'Tồn Đầu', dataIndex: 'TonDau' }, { title: 'Nhập', dataIndex: 'PhatSinhNhap' }, { title: 'Xuất', dataIndex: 'PhatSinhXuat' }, { title: 'Tồn Cuối', dataIndex: 'TonCuoi' }
  ];
  const columnsCongNo = [
    { title: 'Khách Hàng', dataIndex: 'HoTen' },
    { title: 'Nợ Đầu', dataIndex: 'NoDau', render: v=>v.toLocaleString() }, { title: 'Tăng', dataIndex: 'PhatSinhTang', render: v=>v.toLocaleString() }, { title: 'Giảm', dataIndex: 'PhatSinhGiam', render: v=>v.toLocaleString() }, { title: 'Nợ Cuối', dataIndex: 'NoCuoi', render: v=>v.toLocaleString() }
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <Title level={2}>📚 Quản Lý Nhà Sách</Title>

      <Tabs defaultActiveKey="1" items={[
        {
          key: '1',
          label: 'QUẢN LÝ NGHIỆP VỤ',
          children: (
            <>
              <div style={{ gap: 10, display: 'flex', marginBottom: 20, justifyContent: 'space-between' }}>
                <div style={{display:'flex', gap: 10}}>
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>+ Nhập Sách</Button>
                    <Button style={{background: 'orange', color: 'white'}} onClick={() => setIsSellModalOpen(true)}>💲 Bán Sách</Button>
                    <Button style={{background: 'green', color: 'white'}} onClick={() => setIsPayModalOpen(true)}>💰 Thu Tiền</Button>
                </div>
                {/* [MỚI] Thanh tìm kiếm sách */}
                <Input.Search placeholder="Tìm tên sách, tác giả..." style={{ width: 300 }} allowClear onChange={e => setSearchText(e.target.value)} />
              </div>
              <Table 
                dataSource={books.filter(b => b.TenSach.toLowerCase().includes(searchText.toLowerCase()) || b.TacGia.toLowerCase().includes(searchText.toLowerCase()))} 
                columns={columnsBook} rowKey="MaSach" loading={loading} bordered pagination={{ pageSize: 6 }}
              />
            </>
          )
        },
        {
          key: '2',
          label: 'BÁO CÁO THỐNG KÊ',
          children: (
            <div>
              <div style={{ marginBottom: 20, display: 'flex', gap: 15, alignItems: 'center', background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
                 <strong>Loại:</strong>
                 <Radio.Group value={reportType} onChange={e => { setReportData([]); setReportType(e.target.value); }}>
                    <Radio.Button value="ton">Tồn Kho</Radio.Button>
                    <Radio.Button value="congno">Công Nợ</Radio.Button>
                 </Radio.Group>
                 <strong>Tháng:</strong><InputNumber min={1} max={12} value={month} onChange={setMonth} />
                 <strong>Năm:</strong><InputNumber min={2020} value={year} onChange={setYear} />
                 <Button type="primary" onClick={fetchReport}>Xem Báo Cáo</Button>
              </div>
              <Table dataSource={reportData} columns={reportType === 'ton' ? columnsTon : columnsCongNo} rowKey={reportType === 'ton' ? "MaSach" : "MaKhachHang"} loading={loading} bordered />
            </div>
          )
        },
        {
          key: '3',
          label: 'THAY ĐỔI QUY ĐỊNH',
          children: (
            <div style={{ maxWidth: 600, margin: '20px auto', border: '1px solid #eee', padding: 30, borderRadius: 10 }}>
                <h3 style={{textAlign: 'center'}}>⚙️ Cấu Hình Tham Số Hệ Thống</h3>
                <Form form={ruleForm} layout="horizontal" labelCol={{span: 16}} wrapperCol={{span: 8}} onFinish={handleSaveRules}>
                    {rules.map(r => (
                        <Form.Item key={r.MaThamSo} name={r.MaThamSo} label={r.MoTa} rules={[{required: true}]}>
                            <InputNumber style={{width: '100%'}} />
                        </Form.Item>
                    ))}
                    <Button type="primary" htmlType="submit" block size="large">Lưu Thay Đổi</Button>
                </Form>
            </div>
          )
        }
      ]} />

      {/* --- CÁC MODAL --- */}
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
        </Form>
      </Modal>

      <Modal title="Lập Phiếu Thu Tiền" open={isPayModalOpen} onCancel={() => setIsPayModalOpen(false)} onOk={() => payForm.submit()}>
        <Form form={payForm} layout="vertical" onFinish={handleThuTien}>
          <Form.Item name="maKhachHang" label="Khách Hàng" rules={[{ required: true }]}><Select placeholder="Chọn khách">{customers.map(c => <Option key={c.MaKhachHang} value={c.MaKhachHang}>{c.HoTen} (Nợ: {new Intl.NumberFormat('vi-VN').format(c.TienNoHienTai)})</Option>)}</Select></Form.Item>
          <Form.Item name="soTienThu" label="Số Tiền Thu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;