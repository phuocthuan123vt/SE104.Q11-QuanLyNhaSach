import React from "react";
import { Card, Row, Col, Typography, Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { IMAGES, COLORS } from "../../constants";

const { Title, Text } = Typography;

const Login = () => {
  const { handleLogin } = useApp();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)",
      }}
    >
      <Card
        style={{
          width: 800,
          borderRadius: 25,
          boxShadow: "0 20px 50px rgba(0,150,255,0.15)",
          overflow: "hidden",
          border: "none",
          padding: 0,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row>
          <Col
            span={10}
            style={{
              background: COLORS.BLUE,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 30,
            }}
          >
            <img
              src={IMAGES.LOGIN_DORA}
              style={{ width: "100%", maxWidth: 200 }}
              alt="Doraemon"
            />
            <Title
              level={3}
              style={{
                color: "white",
                marginTop: 20,
                fontFamily: "Nunito",
                fontWeight: 800,
              }}
            >
              XIN CHÀO!
            </Title>
          </Col>
          <Col
            span={14}
            style={{
              padding: "40px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Title level={2} style={{ color: COLORS.BLUE, fontWeight: 800 }}>
                ĐĂNG NHẬP
              </Title>
              <Text type="secondary">Hệ thống quản lý nội bộ</Text>
            </div>
            <Form layout="vertical" size="large" onFinish={handleLogin}>
              <Form.Item name="username" rules={[{ required: true }]}>
                <Input
                  prefix={<UserOutlined style={{ color: COLORS.BLUE }} />}
                  placeholder="Tài khoản"
                />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password
                  prefix={<LockOutlined style={{ color: COLORS.BLUE }} />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{
                    height: 50,
                    fontSize: 16,
                    fontWeight: "bold",
                    borderRadius: 25,
                    background: COLORS.BLUE,
                  }}
                >
                  MỞ CỬA THẦN KỲ
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Login;
