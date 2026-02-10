# Hướng Dẫn Cài Đặt Focus Timer - Phiên Bản Offline

## Yêu Cầu Hệ Thống
- Trình duyệt Google Chrome hoặc Microsoft Edge (Chromium)
- Không cần kết nối Internet sau khi cài đặt

## Bước 1: Cài Đặt Extension

### Trên Chrome:
1. Mở Chrome và nhập vào thanh địa chỉ: `chrome://extensions/`
2. Bật "Chế độ nhà phát triển" (Developer mode) ở góc trên bên phải
3. Click nút "Tải tiện ích đã giải nén" (Load unpacked)
4. Chọn thư mục `offline_version` 
5. Extension sẽ xuất hiện trong danh sách với icon Focus Timer

### Trên Microsoft Edge:
1. Mở Edge và nhập vào thanh địa chỉ: `edge://extensions/`
2. Bật "Chế độ nhà phát triển" (Developer mode) ở góc dưới bên trái
3. Click nút "Tải tiện ích đã giải nén" (Load unpacked)
4. Chọn thư mục `offline_version`
5. Extension sẽ xuất hiện trong danh sách

## Bước 2: Sử Dụng

1. Click vào icon Focus Timer trên thanh công cụ trình duyệt
2. Cửa sổ ứng dụng sẽ mở ra
3. Bạn có thể bắt đầu sử dụng ngay lập tức

## Tính Năng Chính

### 🍅 Pomodoro Timer
- Thời gian tập trung: 25 phút (có thể tùy chỉnh)
- Nghỉ ngắn: 5 phút
- Nghỉ dài: 15 phút
- Âm thanh white noise và nhạc nền

### ✅ Quản Lý Công Việc
- Tạo, sửa, xóa tasks
- Đặt mức độ ưu tiên (Thấp, Trung bình, Cao)
- Thêm ghi chú và công việc con
- Đặt deadline
- Ước tính số Pomodoro

### 📁 Projects & Folders
- Tổ chức tasks theo dự án
- Nhóm projects vào folders
- Phân loại theo màu sắc
- Icon tùy chỉnh

### 🏷️ Tags (Nhãn)
- Gắn tags cho tasks
- Lọc theo tags
- Quản lý danh sách tags

### 📊 Thống Kê
- Theo dõi thời gian tập trung
- Đếm số tasks hoàn thành
- Báo cáo theo ngày/tuần/tháng
- Biểu đồ trực quan

### 🌲 Forest Feature
- Trồng cây ảo khi tập trung
- Theo dõi khu rừng của bạn
- Yếu tố gamification

### ⚙️ Cài Đặt
- Tùy chỉnh giao diện
- Cài đặt âm thanh
- Tùy chọn timer
- Chọn ngôn ngữ
- Cài đặt chung

## Lưu Trữ Dữ Liệu

✅ Tất cả dữ liệu được lưu 100% offline trên máy tính của bạn
✅ Không cần tài khoản, không cần đăng nhập
✅ Hoàn toàn miễn phí, không giới hạn
✅ Bảo mật tuyệt đối, không ai có thể truy cập dữ liệu của bạn

## Sao Lưu & Khôi Phục Dữ Liệu

### Xuất Dữ Liệu (Export):
1. Mở ứng dụng Focus Timer
2. Nhấn `F12` để mở DevTools
3. Chuyển sang tab "Console"
4. Gõ lệnh: `OfflineBackup.export()`
5. File backup sẽ được tải xuống tự động

### Nhập Dữ Liệu (Import):
1. Mở ứng dụng Focus Timer
2. Nhấn `F12` để mở DevTools
3. Chuyển sang tab "Console"
4. Gõ lệnh:
```javascript
// Đọc file backup của bạn, sau đó:
OfflineBackup.import(/* paste JSON data here */)
```

### Xóa Tất Cả Dữ Liệu:
```javascript
OfflineBackup.clear()
```

## Xem Dữ Liệu Đã Lưu

Để xem tất cả dữ liệu đang được lưu trữ:

```javascript
OfflineStorage.get(null).then(data => console.log(data))
```

## Khắc Phục Sự Cố

### Extension không hiển thị:
1. Kiểm tra xem extension đã được bật chưa trong `chrome://extensions/`
2. Thử reload extension
3. Restart Chrome/Edge

### Dữ liệu bị mất:
1. Kiểm tra file backup nếu có
2. Dữ liệu có thể bị xóa nếu:
   - Extension bị gỡ cài đặt
   - Chrome bị reset
   - Xóa dữ liệu browsing data

### Timer không hoạt động:
1. Kiểm tra notifications đã được cho phép chưa
2. Kiểm tra sound settings
3. Thử reload ứng dụng

### Không thể mở cửa sổ:
1. Đóng tất cả cửa sổ Focus Timer hiện có
2. Click lại icon extension

## Lời Khuyên

### ⚠️ Quan Trọng:
- **Sao lưu dữ liệu thường xuyên** để tránh mất dữ liệu
- Nên export dữ liệu ít nhất 1 tuần/lần
- Lưu file backup ở nơi an toàn (Google Drive, Dropbox, v.v.)

### 💡 Mẹo Sử Dụng:
- Đặt mục tiêu rõ ràng cho mỗi Pomodoro session
- Sử dụng white noise để tập trung tốt hơn
- Review thống kê hàng tuần để cải thiện hiệu suất
- Chia nhỏ công việc lớn thành các tasks nhỏ
- Sử dụng tags để tổ chức tốt hơn

## Hỗ Trợ

Nếu gặp vấn đề, bạn có thể:
1. Kiểm tra phần "Khắc Phục Sự Cố" ở trên
2. Xem console log bằng cách nhấn `F12`
3. Export dữ liệu và thử cài đặt lại extension

## Giấy Phép

Phiên bản offline này được tạo ra cho mục đích:
- Sử dụng cá nhân
- Hoạt động hoàn toàn offline
- Không thu thập dữ liệu
- Miễn phí 100%

---

**Chúc bạn làm việc hiệu quả! 🚀**

Made with ❤️ for productivity
Offline version - No tracking, No ads, No limits
