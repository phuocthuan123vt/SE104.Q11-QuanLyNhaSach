@echo off
echo ==========================================
echo DANG KHOI DONG DU AN QUAN LY NHA SACH...
echo ==========================================

:: 1. Chạy Backend trong một cửa sổ riêng
start "Backend Server (NodeJS)" cmd /k "cd server && npm run dev"

:: 2. Chạy Frontend trong một cửa sổ riêng
start "Frontend Client (ReactJS)" cmd /k "cd client && npm run dev"

echo Da kich hoat xong! Vui long khong tat 2 cua so den vua hien ra.
exit