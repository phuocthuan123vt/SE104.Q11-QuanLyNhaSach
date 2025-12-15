import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Table,
  Tag,
  Badge,
  Card,
  Typography,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { COLORS } from "../../constants";
import { formatMoney } from "../../utils";

const { Title } = Typography;

const TransactionTab = () => {
  const {
    books,
    loading,
    getRule,
    toggleModal,
    historyInvoices,
    historyImports,
    historyReceipts,
    fetchDetail,
  } = useApp();
  const [searchText, setSearchText] = useState("");

  const columns = [
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
      render: (t) => <b style={{ color: COLORS.BLUE, fontSize: 15 }}>{t}</b>,
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
            backgroundColor: v < 20 ? COLORS.RED : "#52c41a",
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
          style={{ borderRadius: 10, fontSize: 14, fontWeight: "bold" }}
        >
          {formatMoney(v * (getRule("TiLeGiaBan", 105) / 100))}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col flex="auto">
          <Input.Search
            placeholder="Tìm bảo bối..."
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
            style={{ borderRadius: 20, background: COLORS.BLUE }}
            onClick={() => toggleModal("import", true)}
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
              background: COLORS.YELLOW,
              borderColor: COLORS.YELLOW,
              color: "black",
            }}
            onClick={() => toggleModal("sell", true)}
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
            onClick={() => toggleModal("pay", true)}
          >
            Thu Tiền
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={books.filter((b) =>
          b.TenSach.toLowerCase().includes(searchText.toLowerCase())
        )}
        rowKey="MaSach"
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
        columns={columns}
      />

      {/* HISTORY SECTION */}
      <Card
        style={{
          marginTop: 30,
          borderRadius: 20,
          border: `2px dashed ${COLORS.BLUE}`,
          background: "#f9fcff",
        }}
      >
        <Title level={4} style={{ color: COLORS.BLUE }}>
          <EyeOutlined /> Lịch Sử
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
                    { title: "ID", dataIndex: "MaHoaDon", width: 60 },
                    {
                      title: "Ngày",
                      dataIndex: "NgayLap",
                      render: (t) => new Date(t).toLocaleString("vi-VN"),
                    },
                    { title: "Khách", dataIndex: "HoTen" },
                    {
                      title: "Tổng",
                      dataIndex: "TongTien",
                      render: (v) => (
                        <b style={{ color: COLORS.BLUE }}>{formatMoney(v)}</b>
                      ),
                    },
                    {
                      title: "Xem",
                      align: "center",
                      render: (_, r) => (
                        <Button
                          shape="circle"
                          icon={<EyeOutlined />}
                          onClick={() => fetchDetail(r.MaHoaDon, "hoadon")}
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
                    { title: "ID", dataIndex: "MaPhieuNhap", width: 60 },
                    {
                      title: "Ngày",
                      dataIndex: "NgayNhap",
                      render: (t) => new Date(t).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Tổng",
                      dataIndex: "TongTien",
                      render: (v) => (
                        <b style={{ color: COLORS.RED }}>{formatMoney(v)}</b>
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
                            fetchDetail(r.MaPhieuNhap, "phieunhap")
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
                    { title: "ID", dataIndex: "MaPhieuThu", width: 60 },
                    {
                      title: "Ngày",
                      dataIndex: "NgayThu",
                      render: (t) => new Date(t).toLocaleString("vi-VN"),
                    },
                    { title: "Khách", dataIndex: "HoTen" },
                    {
                      title: "Thu",
                      dataIndex: "SoTienThu",
                      render: (v) => <Tag color="green">{formatMoney(v)}</Tag>,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default TransactionTab;
