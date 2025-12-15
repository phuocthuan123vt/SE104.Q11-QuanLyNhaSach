import React from "react";
import { Modal, Table, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { formatMoney } from "../../utils";

const DetailModal = () => {
  const { modals, toggleModal, detailData, detailType, handlePrint } = useApp();

  return (
    <Modal
      title="Chi Tiết Giao Dịch"
      open={modals.detail}
      onCancel={() => toggleModal("detail", false)}
      footer={
        <Button
          icon={<PrinterOutlined />}
          onClick={() => handlePrint("invoice", detailData)}
        >
          In Phiếu
        </Button>
      }
      width={700}
    >
      <Table
        dataSource={detailData}
        rowKey={detailType === "hoadon" ? "MaCTHD" : "MaCTPN"}
        columns={[
          { title: "Sách", dataIndex: "TenSach" },
          {
            title: "Số Lượng",
            dataIndex: detailType === "hoadon" ? "SoLuong" : "SoLuongNhap",
          },
          {
            title: "Đơn Giá",
            dataIndex: detailType === "hoadon" ? "DonGiaBan" : "DonGiaNhap",
            render: (v) => formatMoney(v),
          },
          {
            title: "Thành Tiền",
            dataIndex: "ThanhTien",
            render: (v) => <b>{formatMoney(v)}</b>,
          },
        ]}
        pagination={false}
        bordered
        summary={(pageData) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3} align="right">
              <b>Tổng Cộng:</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <b>
                {formatMoney(pageData.reduce((s, c) => s + c.ThanhTien, 0))}
              </b>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Modal>
  );
};

export default DetailModal;
