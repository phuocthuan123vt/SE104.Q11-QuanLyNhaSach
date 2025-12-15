import React, { useState } from "react";
import {
  Modal,
  Select,
  Divider,
  Button,
  Form,
  InputNumber,
  Table,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { API_URL, COLORS } from "../../constants";
import { formatMoney, handleError } from "../../utils";

const { Option } = Select;

const SellModal = () => {
  const {
    modals,
    toggleModal,
    customers,
    books,
    getRule,
    fetchBooks,
    fetchCustomers,
    fetchHistory,
    custForm,
    setEditingItem,
  } = useApp();
  const [saleItems, setSaleItems] = useState([]);
  const [tempSaleForm] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const addSaleItem = (v) => {
    const b = books.find((i) => i.MaSach === v.maSach);
    if (b.SoLuongTon - v.soLuong < getRule("MinTonSauBan", 20))
      return message.error(`Tồn kho không đủ (Quy định tối thiểu)!`);
    if (saleItems.find((i) => i.maSach === v.maSach))
      return message.warning("Đã có trong giỏ hàng");
    const gia = b.DonGiaNhapGanNhat * (getRule("TiLeGiaBan", 105) / 100);
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
    setSelectedBookId(null);
  };

  const submitSale = async () => {
    if (!selectedCustomer || saleItems.length === 0)
      return message.error("Thiếu thông tin");
    try {
      await axios.post(`${API_URL}/ban-sach`, {
        maKhachHang: selectedCustomer,
        soTienTra: paymentAmount,
        danhSachSachBan: saleItems,
      });
      message.success("Giao dịch thành công! (Kiểm tra lịch sử)");
      toggleModal("sell", false);
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

  return (
    <Modal
      title="Lập Hóa Đơn Bán"
      open={modals.sell}
      onCancel={() => {
        toggleModal("sell", false);
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
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <Button
                type="text"
                icon={<PlusOutlined />}
                block
                onClick={() => {
                  toggleModal("customer", true);
                  setEditingItem(null);
                  custForm.resetFields();
                }}
              >
                Thêm khách hàng
              </Button>
            </>
          )}
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
            extra={
              selectedBookId &&
              `Min tồn sau bán: ${getRule("MinTonSauBan", 20)}`
            }
          >
            <Select
              placeholder="Chọn sách bán"
              showSearch
              optionFilterProp="children"
              onChange={(val) => setSelectedBookId(val)}
            >
              {books.map((b) => (
                <Option key={b.MaSach} value={b.MaSach}>
                  <div style={{ whiteSpace: "normal" }}>
                    {b.TenSach} (Giá:{" "}
                    {formatMoney(
                      b.DonGiaNhapGanNhat * (getRule("TiLeGiaBan", 105) / 100)
                    )}
                    ) - Tồn: {b.SoLuongTon}
                  </div>
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
              style={{ background: COLORS.YELLOW, borderColor: COLORS.YELLOW }}
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
            render: (v) => formatMoney(v),
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
  );
};

export default SellModal;
