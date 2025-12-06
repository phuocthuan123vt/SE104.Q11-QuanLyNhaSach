import React from "react";
import { Modal, Form, Select, InputNumber } from "antd";

const { Option } = Select;

export default function HomeModals({
  books,
  isModalOpen,
  setIsModalOpen,
  form,
  onSubmitNhap,
}) {
  return (
    <>
      <Modal
        title="Nhập Sách"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onSubmitNhap}>
          <Form.Item name="maSach" label="Sách" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {books.map((b) => (
                <Option key={b.maSach} value={b.maSach}>
                  {b.tenSach}
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
    </>
  );
}
