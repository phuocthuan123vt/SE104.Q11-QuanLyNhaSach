import React, { useEffect } from "react";
import { Row, Col, Card, Form, InputNumber, Button, message } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { API_URL } from "../../constants";
import { handleError } from "../../utils";

const SettingsTab = () => {
  const { rules, fetchRules } = useApp();
  const [ruleForm] = Form.useForm();

  useEffect(() => {
    ruleForm.setFieldsValue(
      rules.reduce((a, c) => ({ ...a, [c.MaThamSo]: c.GiaTri }), {})
    );
  }, [rules, ruleForm]);

  const handleRules = async (v) => {
    try {
      await axios.post(`${API_URL}/quy-dinh`, { quyDinh: v });
      message.success("Thành công");
      fetchRules();
    } catch (e) {
      handleError(e, "Cập nhật quy định");
    }
  };

  return (
    <Row justify="center">
      <Col span={12}>
        <Card
          title="Tham Số"
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          }}
        >
          <Form
            form={ruleForm}
            layout="horizontal"
            labelCol={{ span: 14 }}
            wrapperCol={{ span: 10 }}
            onFinish={handleRules}
          >
            {rules.map((r) => (
              <Form.Item
                key={r.MaThamSo}
                name={r.MaThamSo}
                label={r.MoTa}
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%", borderRadius: 10 }} />
              </Form.Item>
            ))}
            <Button
              type="primary"
              htmlType="submit"
              block
              shape="round"
              size="large"
            >
              Lưu Thay Đổi
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default SettingsTab;
