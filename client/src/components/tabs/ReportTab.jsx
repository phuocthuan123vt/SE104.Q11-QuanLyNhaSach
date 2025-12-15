import React from "react";
import { Space, Radio, InputNumber, Button, Table, Tag } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { formatMoney } from "../../utils";

const ReportTab = () => {
  const {
    reportData,
    reportType,
    setReportType,
    month,
    setMonth,
    year,
    setYear,
    fetchReport,
    loading,
    handlePrint,
  } = useApp();

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <b>Loại:</b>
        <Radio.Group
          value={reportType}
          onChange={(e) => {
            // Lưu ý: setReportData([]) không có trong context, nhưng effect sẽ tự fetch lại
            setReportType(e.target.value);
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="ton">Tồn Kho</Radio.Button>
          <Radio.Button value="congno">Công Nợ</Radio.Button>
        </Radio.Group>
        <b>Tháng:</b>
        <InputNumber
          min={1}
          max={12}
          value={month}
          onChange={setMonth}
          style={{ borderRadius: 10 }}
        />
        <b>Năm:</b>
        <InputNumber
          value={year}
          onChange={setYear}
          style={{ borderRadius: 10 }}
        />
        <Button type="primary" shape="round" onClick={fetchReport}>
          Xem
        </Button>
        {reportData.length > 0 && (
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint("report", reportData)}
          >
            In Báo Cáo
          </Button>
        )}
      </Space>
      <Table
        dataSource={reportData}
        columns={
          reportType === "ton"
            ? [
                {
                  title: "STT",
                  render: (t, r, i) => i + 1,
                  width: 50,
                },
                { title: "Sách", dataIndex: "TenSach" },
                {
                  title: "Tồn Đầu",
                  dataIndex: "TonDau",
                  align: "center",
                },
                {
                  title: "Nhập",
                  dataIndex: "PhatSinhNhap",
                  align: "center",
                  render: (v) =>
                    v > 0 ? <span style={{ color: "green" }}>+{v}</span> : v,
                },
                {
                  title: "Xuất",
                  dataIndex: "PhatSinhXuat",
                  align: "center",
                  render: (v) =>
                    v > 0 ? <span style={{ color: "red" }}>-{v}</span> : v,
                },
                {
                  title: "Tồn Cuối",
                  dataIndex: "TonCuoi",
                  align: "center",
                  render: (v) => <b>{v}</b>,
                },
              ]
            : [
                {
                  title: "STT",
                  render: (t, r, i) => i + 1,
                  width: 50,
                },
                { title: "Khách", dataIndex: "HoTen" },
                {
                  title: "Nợ Đầu",
                  dataIndex: "NoDau",
                  align: "right",
                  render: (v) => formatMoney(v),
                },
                {
                  title: "Tăng",
                  dataIndex: "PhatSinhTang",
                  align: "right",
                  render: (v) =>
                    v > 0 ? (
                      <span style={{ color: "red" }}>+{formatMoney(v)}</span>
                    ) : (
                      v
                    ),
                },
                {
                  title: "Giảm",
                  dataIndex: "PhatSinhGiam",
                  align: "right",
                  render: (v) =>
                    v > 0 ? (
                      <span style={{ color: "green" }}>-{formatMoney(v)}</span>
                    ) : (
                      v
                    ),
                },
                {
                  title: "Nợ Cuối",
                  dataIndex: "NoCuoi",
                  align: "right",
                  render: (v) => <Tag color="red">{formatMoney(v)}</Tag>,
                },
              ]
        }
        rowKey={reportType === "ton" ? "MaSach" : "MaKhachHang"}
        loading={loading}
        bordered
      />
    </div>
  );
};

export default ReportTab;
