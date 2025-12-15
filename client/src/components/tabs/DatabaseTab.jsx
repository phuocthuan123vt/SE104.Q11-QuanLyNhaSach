import React from "react";
import { Tabs, Button, Table, Space, Tag, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { COLORS, API_URL } from "../../constants";
import { formatMoney, handleError } from "../../utils";

const DatabaseTab = () => {
  const {
    books,
    customers,
    categories,
    users,
    isAdmin,
    toggleModal,
    setEditingItem,
    bookForm,
    custForm,
    catForm,
    userForm,
    fetchBooks,
    fetchCustomers,
    fetchCategories,
    fetchUsers,
  } = useApp();

  const deleteItem = async (endpoint, id, refetch, name) => {
    try {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      message.success(`Đã xóa ${name}`);
      refetch();
    } catch (e) {
      handleError(e, "Xóa");
    }
  };

  const items = [
    {
      key: "2-1",
      label: "Sách",
      children: (
        <div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ marginBottom: 10, borderRadius: 15, color: COLORS.BLUE }}
            block
            onClick={() => {
              setEditingItem(null);
              bookForm.resetFields();
              toggleModal("book", true);
            }}
          >
            Thêm Sách Mới
          </Button>
          <Table
            dataSource={books}
            rowKey="MaSach"
            pagination={{ pageSize: 6 }}
            columns={[
              { title: "Tên Sách", dataIndex: "TenSach" },
              { title: "Thể Loại", dataIndex: "TenTheLoai" },
              {
                title: "Thao tác",
                width: 100,
                render: (_, r) => (
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: COLORS.BLUE }} />}
                      onClick={() => {
                        setEditingItem(r);
                        bookForm.setFieldsValue(r);
                        toggleModal("book", true);
                      }}
                    />
                    {isAdmin && (
                      <Popconfirm
                        title="Xóa?"
                        onConfirm={() =>
                          deleteItem("sach", r.MaSach, fetchBooks, "sách")
                        }
                      >
                        <Button
                          type="text"
                          icon={
                            <DeleteOutlined style={{ color: COLORS.RED }} />
                          }
                        />
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "2-2",
      label: "Khách Hàng",
      children: (
        <div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ marginBottom: 10, borderRadius: 15, color: COLORS.BLUE }}
            block
            onClick={() => {
              setEditingItem(null);
              custForm.resetFields();
              toggleModal("customer", true);
            }}
          >
            Thêm Khách
          </Button>
          <Table
            dataSource={customers}
            rowKey="MaKhachHang"
            pagination={{ pageSize: 6 }}
            columns={[
              { title: "Họ Tên", dataIndex: "HoTen" },
              { title: "SĐT", dataIndex: "SoDienThoai" },
              {
                title: "Nợ",
                dataIndex: "TienNoHienTai",
                render: (v) => formatMoney(v),
              },
              {
                title: "Thao tác",
                width: 100,
                render: (_, r) => (
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: COLORS.BLUE }} />}
                      onClick={() => {
                        setEditingItem(r);
                        custForm.setFieldsValue(r);
                        toggleModal("customer", true);
                      }}
                    />
                    {isAdmin && (
                      <Popconfirm
                        title="Xóa?"
                        onConfirm={() =>
                          deleteItem(
                            "khach-hang",
                            r.MaKhachHang,
                            fetchCustomers,
                            "khách"
                          )
                        }
                      >
                        <Button
                          type="text"
                          icon={
                            <DeleteOutlined style={{ color: COLORS.RED }} />
                          }
                        />
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "2-3",
      label: "Thể Loại",
      children: (
        <div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ marginBottom: 10, borderRadius: 15, color: COLORS.BLUE }}
            block
            onClick={() => {
              setEditingItem(null);
              catForm.resetFields();
              toggleModal("category", true);
            }}
          >
            Thêm Thể Loại
          </Button>
          <Table
            dataSource={categories}
            rowKey="MaTheLoai"
            pagination={{ pageSize: 6 }}
            columns={[
              { title: "Tên", dataIndex: "TenTheLoai" },
              {
                title: "Thao tác",
                width: 100,
                render: (_, r) => (
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: COLORS.BLUE }} />}
                      onClick={() => {
                        setEditingItem(r);
                        catForm.setFieldsValue({ tenTheLoai: r.TenTheLoai });
                        toggleModal("category", true);
                      }}
                    />
                    {isAdmin && (
                      <Popconfirm
                        title="Xóa?"
                        onConfirm={() =>
                          deleteItem(
                            "the-loai",
                            r.MaTheLoai,
                            fetchCategories,
                            "thể loại"
                          )
                        }
                      >
                        <Button
                          type="text"
                          icon={
                            <DeleteOutlined style={{ color: COLORS.RED }} />
                          }
                        />
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  if (isAdmin) {
    items.push({
      key: "2-4",
      label: "Nhân Viên",
      children: (
        <div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ marginBottom: 10, borderRadius: 15, color: COLORS.BLUE }}
            block
            onClick={() => {
              userForm.resetFields();
              toggleModal("user", true);
            }}
          >
            Thêm Nhân Viên
          </Button>
          <Table
            dataSource={users}
            rowKey="Id"
            pagination={{ pageSize: 6 }}
            columns={[
              { title: "Username", dataIndex: "TenDangNhap" },
              { title: "Họ Tên", dataIndex: "HoTen" },
              {
                title: "Vai Trò",
                dataIndex: "Quyen",
                render: (v) =>
                  v === 1 ? (
                    <Tag color="red">Admin</Tag>
                  ) : (
                    <Tag color="blue">Nhân Viên</Tag>
                  ),
              },
              {
                title: "Xóa",
                width: 60,
                render: (_, r) =>
                  r.TenDangNhap !== "admin" && (
                    <Popconfirm
                      title="Xóa?"
                      onConfirm={() =>
                        deleteItem("tai-khoan", r.Id, fetchUsers, "user")
                      }
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: COLORS.RED }} />}
                      />
                    </Popconfirm>
                  ),
              },
            ]}
          />
        </div>
      ),
    });
  }

  return <Tabs defaultActiveKey="2-1" tabPosition="left" items={items} />;
};

export default DatabaseTab;
