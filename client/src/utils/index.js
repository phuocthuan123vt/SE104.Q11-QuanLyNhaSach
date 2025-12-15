import { message } from "antd";

export const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return "0 ₫";
  return parseInt(amount).toLocaleString("vi-VN") + " ₫";
};

export const formatNumber = (num) => parseInt(num || 0).toLocaleString("vi-VN");

export const handleError = (e, action) => {
  console.error(e);
  message.error(`${action} thất bại: ${e.response?.data?.error || e.message}`);
};
