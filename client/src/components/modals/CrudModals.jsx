import React from "react";
import { Modal, Form, Input, Select, InputNumber, message } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { API_URL } from "../../constants";
import { handleError, formatMoney } from "../../utils";

const { Option } = Select;

// --- PAY MODAL ---
export const PayModal = () => {
  const {
    modals,
    toggleModal,
    payForm,
    customers,
    fetchCustomers,
    fetchHistory,
  } = useApp();

  const handleThu = async (v) => {
    try {
      await axios.post(`${API_URL}/thu-tien`, v);
      message.success("Thành công");
      toggleModal("pay", false);
      payForm.resetFields();
      fetchCustomers();
      fetchHistory();
    } catch (e) {
      handleError(e, "Thu tiền");
    }
  };

  return (
    <Modal
      title="Thu Tiền Nợ"
      open={modals.pay}
      onCancel={() => toggleModal("pay", false)}
      onOk={() => payForm.submit()}
    >
      <Form form={payForm} layout="vertical" onFinish={handleThu}>
        <Form.Item
          name="maKhachHang"
          label="Khách Hàng"
          rules={[{ required: true }]}
        >
          <Select>
            {customers.map((c) => (
              <Option key={c.MaKhachHang} value={c.MaKhachHang}>
                {c.HoTen} (Nợ: {formatMoney(c.TienNoHienTai)})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="soTienThu"
          label="Số Tiền Thu"
          rules={[{ required: true }]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// --- CUSTOMER MODAL ---
export const CustomerModal = () => {
  const { modals, toggleModal, custForm, editingItem, fetchCustomers } =
    useApp();

  const saveCustomer = async (v) => {
    try {
      if (editingItem)
        await axios.put(`${API_URL}/khach-hang/${editingItem.MaKhachHang}`, v);
      else await axios.post(`${API_URL}/khach-hang`, v);
      message.success("Thành công");
      toggleModal("customer", false);
      fetchCustomers();
    } catch (e) {
      handleError(e, "Lưu khách");
    }
  };

  return (
    <Modal
      title={editingItem ? "Sửa Khách" : "Thêm Khách Mới"}
      open={modals.customer}
      onCancel={() => toggleModal("customer", false)}
      onOk={() => custForm.submit()}
    >
      <Form form={custForm} layout="vertical" onFinish={saveCustomer}>
        <Form.Item name="HoTen" label="Họ Tên" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="SoDienThoai"
          label="Số Điện Thoại"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="DiaChi" label="Địa Chỉ">
          <Input />
        </Form.Item>
        <Form.Item name="Email" label="Email">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// --- CATEGORY MODAL ---
export const CategoryModal = () => {
  const { modals, toggleModal, catForm, editingItem, fetchCategories } =
    useApp();

  const saveCategory = async (v) => {
    try {
      if (editingItem)
        await axios.put(`${API_URL}/the-loai/${editingItem.MaTheLoai}`, v);
      else await axios.post(`${API_URL}/the-loai`, v);
      message.success("Thành công");
      toggleModal("category", false);
      fetchCategories();
    } catch (e) {
      handleError(e, "Lưu thể loại");
    }
  };

  return (
    <Modal
      title={editingItem ? "Sửa Thể Loại" : "Thêm Thể Loại"}
      open={modals.category}
      onCancel={() => toggleModal("category", false)}
      onOk={() => catForm.submit()}
    >
      <Form form={catForm} layout="vertical" onFinish={saveCategory}>
        <Form.Item
          name="tenTheLoai"
          label="Tên Thể Loại"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// --- BOOK MODAL ---
export const BookModal = () => {
  const { modals, toggleModal, bookForm, editingItem, fetchBooks, categories } =
    useApp();

  const saveBook = async (v) => {
    try {
      if (editingItem)
        await axios.put(`${API_URL}/sach/${editingItem.MaSach}`, v);
      else await axios.post(`${API_URL}/sach`, v);
      message.success("Thành công");
      toggleModal("book", false);
      fetchBooks();
    } catch (e) {
      handleError(e, "Lưu sách");
    }
  };

  return (
    <Modal
      title={editingItem ? "Cập Nhật Sách" : "Thêm Sách Mới"}
      open={modals.book}
      onCancel={() => toggleModal("book", false)}
      onOk={() => bookForm.submit()}
    >
      <Form form={bookForm} layout="vertical" onFinish={saveBook}>
        <Form.Item name="TenSach" label="Tên Sách" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="MaTheLoai"
          label="Thể Loại"
          rules={[{ required: true }]}
        >
          <Select>
            {categories.map((c) => (
              <Option key={c.MaTheLoai} value={c.MaTheLoai}>
                {c.TenTheLoai}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="TacGia" label="Tác Giả">
          <Input />
        </Form.Item>
        {!editingItem && (
          <Form.Item
            name="DonGiaNhapGanNhat"
            label="Đơn Giá Nhập (Gốc)"
            help="Để tính giá bán ban đầu"
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

// --- USER MODAL ---
export const UserModal = () => {
  const { modals, toggleModal, userForm, fetchUsers } = useApp();

  const saveUser = async (v) => {
    try {
      await axios.post(`${API_URL}/tai-khoan`, v);
      message.success("Thành công");
      toggleModal("user", false);
      fetchUsers();
    } catch (e) {
      handleError(e, "Tạo user");
    }
  };

  return (
    <Modal
      title="Cấp Tài Khoản Mới"
      open={modals.user}
      onCancel={() => toggleModal("user", false)}
      onOk={() => userForm.submit()}
    >
      <Form form={userForm} layout="vertical" onFinish={saveUser}>
        <Form.Item
          name="tenDangNhap"
          label="Tên Đăng Nhập"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="matKhau" label="Mật Khẩu" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="hoTen"
          label="Họ Tên Nhân Viên"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="quyen" label="Chức Vụ" initialValue={2}>
          <Select>
            <Option value={1}>Quản Trị Viên (Admin)</Option>
            <Option value={2}>Nhân Viên</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
