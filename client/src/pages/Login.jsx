import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, BookOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth";

const { Title, Text } = Typography;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      await login(values);
      message.success("Đăng nhập thành công");
      navigate("/");
    } catch (e) {
      message.error(e.response?.data?.error || "Lỗi đăng nhập");
    }
  };

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <BookOutlined style={{ fontSize: 40, color: "#1890ff" }} />
          <Title level={3} style={{ marginTop: 10 }}>
            Bookstore Login
          </Title>
          <Text type="secondary">Hệ thống quản lý nhà sách nội bộ</Text>
        </div>
        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Tài khoản (admin)"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{ marginTop: 10 }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", color: "#888", fontSize: 12 }}>
          Tài khoản được cấp bởi Quản trị viên
        </div>
      </Card>
    </div>
  );
}
