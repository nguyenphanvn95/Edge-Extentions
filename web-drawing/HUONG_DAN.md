# Hướng Dẫn Cài Đặt Extension Vẽ Trên Web - Phiên Bản Nâng Cấp

## 🎯 Tính Năng Mới

Extension đã được nâng cấp với các tính năng:

### ✨ Điểm Mới
- **Lưu theo từng trang**: Mỗi URL có thể lưu riêng bản vẽ của nó
- **Tự động tải lại**: Khi quay lại trang đã vẽ, bản vẽ tự động hiển thị
- **Quản lý bản vẽ**: Xem danh sách tất cả bản vẽ đã lưu
- **Thông báo**: Hiển thị thông báo khi lưu/tải/xóa thành công

## 📥 Cài Đặt

### Bước 1: Chuẩn bị
1. Giải nén file `upgraded-extension.zip` (nếu có)
2. Hoặc sử dụng thư mục `upgraded-extension` đã tạo

### Bước 2: Cài vào Chrome/Edge

#### Trên Chrome:
1. Mở Chrome và vào `chrome://extensions/`
2. Bật "**Developer mode**" (Chế độ nhà phát triển) ở góc trên bên phải
3. Nhấn "**Load unpacked**" (Tải tiện ích đã giải nén)
4. Chọn thư mục `upgraded-extension`
5. Extension sẽ xuất hiện trong danh sách

#### Trên Edge:
1. Mở Edge và vào `edge://extensions/`
2. Bật "**Developer mode**" ở góc trái
3. Nhấn "**Load unpacked**"
4. Chọn thư mục `upgraded-extension`

## 🎨 Cách Sử Dụng

### Bắt Đầu Vẽ

1. **Mở extension**: Nhấn vào icon extension trên thanh công cụ
2. **Control panel** sẽ xuất hiện với các công cụ vẽ

### Công Cụ Vẽ Cơ Bản

- 🖱️ **Cursor** - Con trỏ để tương tác với trang web
- ✏️ **Pen** - Bút vẽ tự do
- 🧽 **Eraser** - Tẩy xóa phần vẽ
- ⬜ **Shapes** - Vẽ hình (chữ nhật, tròn, đường thẳng)
- 🔤 **Text** - Thêm chữ
- 🎨 **Fill** - Tô màu vùng
- 💧 **Color Picker** - Chọn màu từ trang web

### Tính Năng Lưu Trữ Mới

#### 4 Nút Mới Trên Panel:

1. **💾 Save** (Lưu)
   - Lưu bản vẽ hiện tại cho trang này
   - Nhấn khi muốn lưu lại công việc

2. **📂 Load** (Tải)
   - Tải bản vẽ đã lưu của trang này
   - Hữu ích khi muốn khôi phục bản vẽ cũ

3. **🗑️ Delete** (Xóa)
   - Xóa bản vẽ đã lưu của trang này
   - Sẽ có xác nhận trước khi xóa

4. **📋 List All** (Danh sách)
   - Xem tất cả bản vẽ đã lưu
   - Hiển thị URL và thời gian lưu

### Tự Động Tải Lại

- Extension tự động lưu và tải lại theo URL
- Khi bạn:
  1. Vẽ gì đó trên trang A
  2. Nhấn **Save**
  3. Đóng tab hoặc chuyển sang trang khác
  4. Quay lại trang A
  → Bản vẽ sẽ **TỰ ĐỘNG** hiển thị!

## 🔧 Cài Đặt Nâng Cao

### Bật Auto-Save (Tự động lưu)

Nếu muốn tự động lưu mỗi 30 giây:

1. Mở file `scripts/storageHelper.js`
2. Tìm dòng (gần cuối file):
   ```javascript
   // StorageHelper.enableAutoSave();
   ```
3. Bỏ dấu `//` để bật:
   ```javascript
   StorageHelper.enableAutoSave();
   ```
4. Reload extension

## 💡 Mẹo Sử Dụng

### Làm Việc Hiệu Quả

1. **Vẽ chú thích**: Dùng để highlight hoặc chú thích trên trang web
2. **Lưu thường xuyên**: Nhấn Save để không mất công
3. **Quản lý storage**: Dùng "List All" để xem và xóa bản vẽ cũ

### Phím Tắt

- **Ctrl+Z** (hoặc Cmd+Z): Undo
- **Ctrl+Y** (hoặc Cmd+Y): Redo
- **Delete**: Xóa bản vẽ hoàn toàn

## 🔍 Cách Hoạt Động

### URL Matching

Extension lưu theo URL chuẩn hóa:
- Lấy `origin` + `pathname`
- Bỏ qua query parameters và hash

**Ví dụ:**
```
URL đầy đủ: https://example.com/page?id=123#section
URL lưu:    https://example.com/page
```

Nghĩa là:
- `example.com/page?id=1` 
- `example.com/page?id=2`
- `example.com/page#abc`

→ Sẽ **CÙNG** một bản vẽ!

### Lưu Trữ

- Mỗi bản vẽ được lưu dưới dạng PNG (base64)
- Giới hạn: ~5MB (Chrome storage limit)
- Metadata: URL, timestamp

## ❗ Xử Lý Lỗi

### Bản vẽ không tự động tải?

**Nguyên nhân thường gặp:**
1. Extension chưa được inject vào trang
2. Chưa lưu bản vẽ trước đó
3. URL đã thay đổi

**Giải pháp:**
1. Reload lại trang (F5)
2. Kiểm tra xem đã Save chưa
3. Thử nhấn nút **Load** thủ công

### Storage đầy?

**Dấu hiệu:**
- Không lưu được
- Báo lỗi "Quota exceeded"

**Giải pháp:**
1. Nhấn **List All**
2. Xem danh sách bản vẽ
3. Xóa các bản vẽ cũ không cần

### Extension không hoạt động?

**Kiểm tra:**
1. Extension đã được bật? (`chrome://extensions/`)
2. Icon extension có màu xám không?
3. Console có báo lỗi không? (F12 → Console)

**Thử:**
1. Reload extension
2. Reload trang web
3. Cài đặt lại extension

## 📋 Checklist Sau Khi Cài

- [ ] Extension hiển thị trong thanh công cụ
- [ ] Nhấn icon, control panel xuất hiện
- [ ] Vẽ được trên trang
- [ ] Nhấn Save, có thông báo thành công
- [ ] Reload trang, bản vẽ tự động hiển thị
- [ ] 4 nút mới (Save, Load, Delete, List) hoạt động

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Xem phần **Xử Lý Lỗi** ở trên
2. Kiểm tra Console log (F12)
3. Đọc file `README.md` (tiếng Anh) để biết chi tiết kỹ thuật

## 🎓 Video Hướng Dẫn

### Cài Đặt:
1. Mở `chrome://extensions/`
2. Bật Developer mode
3. Load unpacked → chọn thư mục

### Sử Dụng:
1. Nhấn icon extension
2. Vẽ gì đó
3. Nhấn 💾 Save
4. Reload trang → bản vẽ tự động hiện

## 📝 Ghi Chú Quan Trọng

⚠️ **Lưu ý:**
- Bản vẽ chỉ lưu **local** trên máy bạn
- Không đồng bộ giữa các thiết bị
- Xóa extension = mất tất cả bản vẽ
- Nên export/backup định kỳ

✅ **Khuyến nghị:**
- Lưu thường xuyên
- Xóa bản vẽ cũ không cần
- Kiểm tra storage định kỳ

---

**Phiên bản:** 2.0.0  
**Ngày cập nhật:** 2026-02-10
