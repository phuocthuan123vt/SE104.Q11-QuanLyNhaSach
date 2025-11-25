// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography } from 'antd'; // Dùng thư viện giao diện cho nhanh

const { Title } = Typography;

function App() {
  const [books, setBooks] = useState([]); // Chứa danh sách sách
  const [loading, setLoading] = useState(false); // Trạng thái đang tải

  // Hàm gọi API lấy sách
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/sach');
      setBooks(res.data); // Lưu dữ liệu vào state
    } catch (error) {
      console.log("Lỗi gọi API:", error);
    }
    setLoading(false);
  };

  // Gọi hàm này 1 lần khi trang vừa load
  useEffect(() => {
    fetchBooks();
  }, []);

  // Cấu hình các cột cho bảng (Table)
  const columns = [
    {
      title: 'Mã Sách',
      dataIndex: 'MaSach',
      key: 'MaSach',
    },
    {
      title: 'Tên Sách',
      dataIndex: 'TenSach',
      key: 'TenSach',
      render: (text) => <b>{text}</b>, // In đậm tên sách
    },
    {
      title: 'Tác Giả',
      dataIndex: 'TacGia',
      key: 'TacGia',
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'SoLuongTon',
      key: 'SoLuongTon',
      render: (soLuong) => (
        <span style={{ color: soLuong < 20 ? 'red' : 'green' }}>
          {soLuong}
        </span>
      ), // Tồn ít thì hiện màu đỏ
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'DonGiaBan',
      key: 'DonGiaBan',
      render: (gia) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia || 0)
    }
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <Title level={2}>📚 Quản Lý Nhà Sách</Title>
      
      <Table 
        dataSource={books} 
        columns={columns} 
        rowKey="MaSach"
        loading={loading}
        bordered
      />
    </div>
  );
}

export default App;