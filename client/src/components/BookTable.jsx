import React from "react";
import { Table, Tag, Badge } from "antd";

export default function BookTable({ books, loading, searchText }) {
  const columns = [
    {
      title: "Mã",
      dataIndex: "maSach",
      width: 60,
      render: (t) => <Tag color="blue">#{t}</Tag>,
    },
    { title: "Tên Sách", dataIndex: "tenSach", render: (t) => <b>{t}</b> },
    { title: "Tác Giả", dataIndex: "tacGia" },
    {
      title: "Tồn",
      dataIndex: "soLuongTon",
      render: (v) => (
        <Badge
          status={v < 20 ? "error" : "success"}
          text={<b style={{ color: v < 20 ? "red" : "green" }}>{v}</b>}
        />
      ),
    },
  ];

  return (
    <Table
      dataSource={books.filter((b) =>
        b.tenSach.toLowerCase().includes(searchText.toLowerCase())
      )}
      columns={columns}
      rowKey="maSach"
      loading={loading}
      bordered
      pagination={{ pageSize: 8 }}
    />
  );
}
