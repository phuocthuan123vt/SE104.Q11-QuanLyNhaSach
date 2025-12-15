import React from "react";
import { Table, Row, Col } from "antd";
import { useApp } from "../../context/AppContext";
import { formatNumber } from "../../utils";

const PrintTemplate = () => {
  const { printContent, detailType, currentUser } = useApp();

  if (!printContent) return null;

  const getPrintColumns = () => {
    if (printContent?.type === "invoice")
      return [
        { title: "Sách", dataIndex: "TenSach" },
        {
          title: "SL",
          dataIndex: detailType === "hoadon" ? "SoLuong" : "SoLuongNhap",
        },
        {
          title: "Đơn Giá",
          dataIndex: detailType === "hoadon" ? "DonGiaBan" : "DonGiaNhap",
          render: (v) => formatNumber(v),
        },
        {
          title: "Thành Tiền",
          dataIndex: "ThanhTien",
          render: (v) => formatNumber(v),
        },
      ];
    return printContent?.savedReportType === "ton"
      ? [
          { title: "STT", render: (t, r, i) => i + 1, width: 50 },
          { title: "Sách", dataIndex: "TenSach" },
          { title: "Tồn Đầu", dataIndex: "TonDau" },
          { title: "Nhập", dataIndex: "PhatSinhNhap" },
          { title: "Xuất", dataIndex: "PhatSinhXuat" },
          { title: "Tồn Cuối", dataIndex: "TonCuoi" },
        ]
      : [
          { title: "STT", render: (t, r, i) => i + 1, width: 50 },
          { title: "Khách Hàng", dataIndex: "HoTen" },
          {
            title: "Nợ Đầu",
            dataIndex: "NoDau",
            render: (v) => formatNumber(v),
          },
          {
            title: "Tăng",
            dataIndex: "PhatSinhTang",
            render: (v) => formatNumber(v),
          },
          {
            title: "Giảm",
            dataIndex: "PhatSinhGiam",
            render: (v) => formatNumber(v),
          },
          {
            title: "Nợ Cuối",
            dataIndex: "NoCuoi",
            render: (v) => formatNumber(v),
          },
        ];
  };

  return (
    <div id="print-area">
      <div style={{ padding: 40, fontFamily: "Times New Roman" }}>
        <h1 style={{ textAlign: "center" }}>NHÀ SÁCH DORAEMON</h1>
        <p style={{ textAlign: "center" }}>Ngày in: {printContent.date}</p>
        <Table
          dataSource={printContent.data}
          pagination={false}
          bordered
          size="small"
          columns={getPrintColumns()}
        />
        <br />
        <Row>
          <Col span={12} style={{ textAlign: "center" }}>
            Người lập
            <br />
            <br />
            {currentUser.hoTen}
          </Col>
          <Col span={12} style={{ textAlign: "center" }}>
            Xác nhận
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PrintTemplate;
