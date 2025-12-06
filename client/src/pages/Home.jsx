import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Input,
  Space,
  Button,
  Table,
  Row,
  Col,
  Form,
  InputNumber,
  Select,
  Modal,
  message,
} from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Option } = Select;

export default function Home() {
  const [books, setBooks] = useState([]);
  const [_customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sach");
      setBooks(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [booksRes, customersRes] = await Promise.all([
          api.get("/sach"),
          api.get("/khach-hang"),
        ]);
        if (!mounted) return;
        setBooks(booksRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNhapSach = async (v) => {
    try {
      await api.post("/nhap-sach", {
        danhSachSachNhap: [
          { maSach: v.maSach, soLuong: v.soLuong, donGia: v.donGia },
        ],
      });
      message.success("Nhập thành công");
      setIsModalOpen(false);
      fetchBooks();
    } catch (e) {
      console.error(e);
      message.error("Lỗi");
    }
  };

  const columnsBook = [
    { title: "Mã", dataIndex: "MaSach", render: (t) => <b>#{t}</b> },
    { title: "Tên Sách", dataIndex: "TenSach" },
    { title: "Tác Giả", dataIndex: "TacGia" },
    { title: "Tồn", dataIndex: "SoLuongTon" },
    { title: "Giá", dataIndex: "DonGiaNhapGanNhat" },
  ];

  return (
    <Card style={{ borderRadius: 10, minHeight: "80vh" }}>
      <Tabs defaultActiveKey="1" type="card" size="large">
        <Tabs.TabPane
          tab={
            <span>
              <HomeOutlined /> QUẢN LÝ NGHIỆP VỤ
            </span>
          }
          key="1"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Input.Search
              placeholder="Tìm kiếm sách..."
              allowClear
              style={{ maxWidth: 400 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Space>
              <Button
                type="primary"
                style={{ background: "#722ed1", borderColor: "#722ed1" }}
                icon={<UserOutlined />}
              >
                + Khách Hàng
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Nhập Sách
              </Button>
              <Button
                style={{ background: "#faad14", color: "white" }}
                icon={<ShoppingCartOutlined />}
              >
                Bán Sách
              </Button>
              <Button
                style={{ background: "#52c41a", color: "white" }}
                icon={<DollarOutlined />}
              >
                Thu Tiền
              </Button>
            </Space>
          </div>
          <Table
            dataSource={books.filter((b) =>
              b.TenSach.toLowerCase().includes(searchText.toLowerCase())
            )}
            columns={columnsBook}
            rowKey="MaSach"
            loading={loading}
            bordered
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined /> BÁO CÁO
            </span>
          }
          key="2"
        >
          Báo cáo
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <SettingOutlined /> QUY ĐỊNH
            </span>
          }
          key="3"
        >
          Quy định
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="Nhập Sách"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleNhapSach}>
          <Form.Item name="maSach" label="Sách" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {books.map((b) => (
                <Option key={b.MaSach} value={b.MaSach}>
                  {b.TenSach}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="soLuong"
            label="Số lượng"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="donGia" label="Đơn giá" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
