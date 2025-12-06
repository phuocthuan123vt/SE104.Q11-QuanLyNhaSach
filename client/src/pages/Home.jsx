import React, { useEffect, useState } from "react";
import { Card, Tabs, Input, Space, Button, Form, message } from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AppHeader from "../components/AppHeader";
import BookTable from "../components/BookTable";
import HomeModals from "../components/HomeModals";
import { getBooks, importBooks } from "../services/bookService";
import { getCustomers } from "../services/customerService";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [_customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [booksList, customersList] = await Promise.all([
          getBooks(),
          getCustomers(),
        ]);
        if (!mounted) return;
        setBooks(booksList);
        setCustomers(customersList);
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
      await importBooks([
        { maSach: v.maSach, soLuong: v.soLuong, donGia: v.donGia },
      ]);
      message.success("Nhập thành công");
      setIsModalOpen(false);
      const updated = await getBooks();
      setBooks(updated);
    } catch (e) {
      console.error(e);
      message.error("Lỗi");
    }
  };

  return (
    <div>
      <AppHeader />
      <Card style={{ borderRadius: 10, minHeight: "80vh", margin: 20 }}>
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
            <BookTable
              books={books}
              loading={loading}
              searchText={searchText}
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
      </Card>

      <HomeModals
        books={books}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        onSubmitNhap={handleNhapSach}
      />
    </div>
  );
}
