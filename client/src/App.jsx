// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Button, Modal, Form, InputNumber, Select, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho Modal nhập sách
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm(); // Hook quản lý form

  // Hàm lấy danh sách sách (dùng lại)
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/sach');
      setBooks(res.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  // Hàm xử lý khi bấm nút OK trên Modal
  const handleNhapSach = async (values) => {
    // values trả về dạng: { maSach: 1, soLuong: 50, donGia: 20000 }
    // API đang cần mảng, nên ta bọc nó lại thành mảng 1 phần tử (để đơn giản hóa demo)
    const payload = {
        danhSachSachNhap: [
            {
                maSach: values.maSach,
                soLuong: values.soLuong,
                donGia: values.donGia
            }
        ]
    };

    try {
        await axios.post('http://localhost:5000/api/nhap-sach', payload);
        message.success('Nhập sách thành công!');
        setIsModalOpen(false); // Đóng modal
        form.resetFields(); // Xóa dữ liệu cũ trên form
        fetchBooks(); // Tải lại bảng để thấy tồn kho tăng lên
    } catch (error) {
        message.error('Lỗi nhập sách');
        console.log(error);
    }
  };

  const columns = [
    { title: 'Mã', dataIndex: 'MaSach', key: 'MaSach' },
    { title: 'Tên Sách', dataIndex: 'TenSach', key: 'TenSach', render: t => <b>{t}</b> },
    { title: 'Tác Giả', dataIndex: 'TacGia', key: 'TacGia' },
    { title: 'Tồn Kho', dataIndex: 'SoLuongTon', key: 'SoLuongTon', render: v => <span style={{color: v<20?'red':'green'}}>{v}</span> },
    { title: 'Giá Bán', dataIndex: 'DonGiaBan', key: 'DonGiaBan', render: v => v?.toLocaleString() }
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>📚 Quản Lý Nhà Sách</Title>
        <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>
            + Nhập Sách Mới
        </Button>
      </div>

      <Table dataSource={books} columns={columns} rowKey="MaSach" loading={loading} bordered />

      {/* --- MODAL NHẬP SÁCH --- */}
      <Modal 
        title="Lập Phiếu Nhập Sách" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()} // Bấm OK thì kích hoạt submit form
      >
        <Form form={form} layout="vertical" onFinish={handleNhapSach}>
            <Form.Item name="maSach" label="Chọn Sách" rules={[{ required: true }]}>
                <Select placeholder="Chọn sách cần nhập" showSearch optionFilterProp="children">
                    {books.map(b => (
                        <Option key={b.MaSach} value={b.MaSach}>
                            {b.TenSach} - (Tồn: {b.SoLuongTon})
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="soLuong" label="Số Lượng Nhập" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>

            <Form.Item name="donGia" label="Đơn Giá Nhập" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;