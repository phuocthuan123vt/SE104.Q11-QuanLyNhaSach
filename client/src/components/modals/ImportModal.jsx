import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Divider,
  InputNumber,
  Table,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { API_URL } from "../../constants";
import { formatMoney, handleError } from "../../utils";

const { Option } = Select;

const ImportModal = () => {
  const {
    modals,
    toggleModal,
    books,
    getRule,
    fetchBooks,
    fetchHistory,
    setEditingItem,
    bookForm,
  } = useApp();
  const [importItems, setImportItems] = useState([]);
  const [tempImportForm] = Form.useForm();
  const [selectedBookId, setSelectedBookId] = useState(null);

  const addImportItem = (v) => {
    const b = books.find((i) => i.MaSach === v.maSach);
    const minNhap = getRule("MinNhap", 150);
    const minTon = getRule("MinTonTruocNhap", 300);
    if (v.soLuong < minNhap)
      return message.error(`Số lượng nhập phải >= ${minNhap}`);
    if (b.SoLuongTon > minTon)
      return message.error(`Tồn kho > ${minTon}, không được nhập!`);
    if (importItems.find((i) => i.maSach === v.maSach))
      return message.warning("Đã có trong danh sách!");
    setImportItems([
      ...importItems,
      { ...v, tenSach: b.TenSach, thanhTien: v.soLuong * v.donGia },
    ]);
    tempImportForm.resetFields();
    setSelectedBookId(null);
  };

  const submitImport = async () => {
    if (importItems.length === 0) return message.error("Trống");
    try {
      await axios.post(`${API_URL}/nhap-sach`, {
        danhSachSachNhap: importItems,
      });
      message.success("Thành công");
      toggleModal("import", false);
      setImportItems([]);
      fetchBooks();
      fetchHistory();
    } catch (e) {
      handleError(e, "Nhập sách");
    }
  };

  return (
    <Modal
      title="Nhập Sách Vào Kho"
      open={modals.import}
      onCancel={() => {
        toggleModal("import", false);
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
              onChange={(val) => setSelectedBookId(val)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => {
                      toggleModal("book", true);
                      setEditingItem(null);
                      bookForm.resetFields();
                    }}
                  >
                    Thêm sách mới
                  </Button>
                </>
              )}
            >
              {books.map((b) => {
                const isViPham = b.SoLuongTon > getRule("MinTonTruocNhap", 300);
                return (
                  <Option key={b.MaSach} value={b.MaSach} disabled={false}>
                    <div
                      style={{
                        whiteSpace: "normal",
                        height: "auto",
                        color: isViPham ? "red" : "black",
                      }}
                    >
                      {b.TenSach} (Tồn: {b.SoLuongTon})
                    </div>
                  </Option>
                );
              })}
            </Select>
            {selectedBookId &&
              books.find((b) => b.MaSach === selectedBookId)?.SoLuongTon >
                getRule("MinTonTruocNhap", 300) && (
                <div style={{ color: "red", fontSize: 11 }}>
                  Không thoả lượng tồn tối thiểu trước nhập
                </div>
              )}
          </Form.Item>
          <Form.Item
            name="soLuong"
            rules={[{ required: true }]}
            style={{ width: 100 }}
            extra={`Min: ${getRule("MinNhap", 150)}`}
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
  );
};

export default ImportModal;
