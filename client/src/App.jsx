import React from "react";
import { Layout, Card, Tabs, Typography } from "antd";
import {
  BookOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AppProvider, useApp } from "./context/AppContext";
import Login from "./components/auth/Login";
import Header from "./components/layout/Header";
import PrintTemplate from "./components/layout/PrintTemplate";

// Tabs Components
import TransactionTab from "./components/tabs/TransactionTab";
import DatabaseTab from "./components/tabs/DatabaseTab";
import ReportTab from "./components/tabs/ReportTab";
import SettingsTab from "./components/tabs/SettingsTab";

// Modals
import ImportModal from "./components/modals/ImportModal";
import SellModal from "./components/modals/SellModal";
import DetailModal from "./components/modals/DetailModal";
import {
  PayModal,
  CustomerModal,
  BookModal,
  CategoryModal,
  UserModal,
} from "./components/modals/CrudModals";

import { COLORS } from "./constants";

const { Content, Footer } = Layout;

// Component con để sử dụng useApp hook
const MainContent = () => {
  const { token, isAdmin, fetchReport } = useApp();

  if (!token) return <Login />;

  const tabsItems = [
    {
      key: "1",
      label: (
        <span style={{ fontSize: 16, fontWeight: "bold" }}>
          <BookOutlined /> QUẦY GIAO DỊCH
        </span>
      ),
      children: <TransactionTab />,
    },
    {
      key: "2",
      label: (
        <span style={{ fontSize: 16, fontWeight: "bold" }}>
          <DatabaseOutlined /> KHO DỮ LIỆU
        </span>
      ),
      children: <DatabaseTab />,
    },
    {
      key: "3",
      label: (
        <span style={{ fontSize: 16, fontWeight: "bold" }}>
          <BarChartOutlined /> BÁO CÁO
        </span>
      ),
      children: <ReportTab />,
    },
    isAdmin
      ? {
          key: "4",
          label: (
            <span style={{ fontSize: 16, fontWeight: "bold" }}>
              <SettingOutlined /> CẤU HÌNH
            </span>
          ),
          children: <SettingsTab />,
        }
      : null,
  ].filter(Boolean);

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <PrintTemplate />
      <Header />
      <Content style={{ padding: "30px 50px" }}>
        <Card
          style={{
            borderRadius: 30,
            minHeight: "80vh",
            boxShadow: "0 10px 30px rgba(0,150,255,0.1)",
            border: "none",
          }}
          bodyStyle={{ padding: 25 }}
        >
          <Tabs
            defaultActiveKey="1"
            type="card"
            size="large"
            onChange={(k) => {
              if (k === "3") fetchReport();
            }}
            items={tabsItems}
          />
        </Card>
      </Content>
      <Footer
        style={{ textAlign: "center", color: COLORS.BLUE, fontWeight: "bold" }}
      >
        Made by TuTi team ©2025
      </Footer>

      {/* Include All Modals */}
      <ImportModal />
      <SellModal />
      <PayModal />
      <CustomerModal />
      <BookModal />
      <CategoryModal />
      <UserModal />
      <DetailModal />
    </Layout>
  );
};

// Root App Component
function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
