import React from "react";
import { Layout, Dropdown, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { COLORS, IMAGES } from "../../constants";

const { Header: AntHeader } = Layout;

const Header = () => {
  const { currentUser, handleLogout } = useApp();

  return (
    <AntHeader
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: COLORS.BLUE,
        padding: "0 30px",
        height: 70,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div
          style={{
            background: "white",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${COLORS.RED}`,
          }}
        >
          <img src={IMAGES.LOGO_BELL} style={{ width: 25 }} alt="Logo" />
        </div>
        <span
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "Nunito",
          }}
        >
          DORAEMON BOOKSTORE
        </span>
      </div>
      <Dropdown
        menu={{
          items: [
            {
              key: "1",
              label: <span style={{ fontWeight: "bold" }}>Đăng Xuất</span>,
              icon: <LogoutOutlined />,
              onClick: handleLogout,
            },
          ],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            background: "rgba(255,255,255,0.2)",
            padding: "5px 15px",
            borderRadius: 30,
          }}
        >
          <Avatar
            size="large"
            src={IMAGES.AVATAR_DEFAULT}
            style={{ background: "transparent" }}
          />
          <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>
            {currentUser.hoTen}
          </span>
        </div>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
