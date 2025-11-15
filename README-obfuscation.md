# Project Obfuscation Guide

## Cách sử dụng file obfuscate.bat

### Bước 1: Chuẩn bị môi trường
Đảm bảo bạn đã cài đặt Node.js trên máy tính:
- Tải từ: https://nodejs.org/
- Kiểm tra bằng lệnh: `node --version`

### Bước 2: Chạy obfuscation
1. Double-click vào file `obfuscate.bat` hoặc chạy trong Command Prompt:
   ```
   obfuscate.bat
   ```

2. Script sẽ tự động:
   - Tạo thư mục `obfus`
   - Copy toàn bộ thư mục `assets` vào `obfus/assets`
   - Copy file `config.js` vào `obfus` (không bị obfuscate)
   - Obfuscate file `script.js` và lưu vào `obfus/script.js`
   - Copy các file còn lại (`index.html`, `styles.css`, `tailwind-input.css`, `vercel.json`)

### Bước 3: Kiểm tra kết quả
Sau khi chạy xong, thư mục `obfus` sẽ chứa:
```
obfus/
├── assets/          # Toàn bộ thư mục assets gốc
├── config.js        # File config không bị obfuscate
├── index.html       # File HTML gốc
├── script.js        # File JavaScript đã obfuscate
├── styles.css       # File CSS gốc
├── tailwind-input.css
└── vercel.json
```

### Bước 4: Test ứng dụng
Mở file `obfus/index.html` trong trình duyệt để kiểm tra xem ứng dụng có hoạt động bình thường không.

## Lưu ý quan trọng

- **File `config.js` không bị obfuscate** để đảm bảo các cấu hình Telegram vẫn hoạt động
- **Tất cả đường dẫn relative vẫn hoạt động** vì cấu trúc thư mục được giữ nguyên
- **JavaScript được obfuscate với mức độ cao** để bảo vệ code
- Nếu gặp lỗi, đảm bảo Node.js đã được cài đặt đúng cách

## Khôi phục từ bản obfuscated

Nếu cần khôi phục về bản gốc:
1. Xóa thư mục `obfus`
2. Làm việc trực tiếp với các file gốc trong thư mục gốc

## Troubleshooting

### Lỗi "Node.js is not installed"
- Cài đặt Node.js từ https://nodejs.org/
- Khởi động lại Command Prompt và thử lại

### Lỗi "javascript-obfuscator not found"
- Script sẽ tự động cài đặt, nhưng nếu thất bại, chạy thủ công:
  ```
  npm install -g javascript-obfuscator
  ```

### File obfuscated không hoạt động
- Kiểm tra console browser để xem lỗi
- Đảm bảo tất cả file đã được copy đúng cách vào thư mục `obfus`
