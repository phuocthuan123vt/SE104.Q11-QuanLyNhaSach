import React from "react";
import { Layout, Avatar, Dropdown } from "antd";
import { UserOutlined, BookOutlined, LogoutOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth";

const { Header } = Layout;

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#001529",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <BookOutlined style={{ fontSize: 20 }} />
        QUẢN LÝ NHÀ SÁCH
      </div>

      <Dropdown
        menu={{
          items: [
            {
              key: "logout",
              label: "Đăng Xuất",
              icon: <LogoutOutlined />,
              onClick: logout,
            },
          ],
        }}
      >
        <div
          style={{
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Avatar
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          />
          <span style={{ color: "white" }}>{user?.hoTen}</span>
        </div>
      </Dropdown>
    </Header>
  );
}
