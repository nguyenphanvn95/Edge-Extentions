# Web Drawing Extension - Upgraded Version 2.0

## Tính năng nâng cấp

Extension này đã được nâng cấp với các tính năng mới:

### 🎨 Tính năng chính

1. **Lưu drawings theo URL** - Mỗi trang web có thể lưu riêng drawing của nó
2. **Tự động load lại** - Khi quay lại trang đã vẽ, drawing sẽ tự động hiển thị
3. **Quản lý drawings** - Xem danh sách tất cả drawings đã lưu
4. **Auto-save** (tùy chọn) - Tự động lưu mỗi 30 giây

### 📦 Cài đặt

1. Mở Chrome/Edge và vào `chrome://extensions/` hoặc `edge://extensions/`
2. Bật "Developer mode" ở góc trên bên phải
3. Nhấn "Load unpacked"
4. Chọn thư mục `upgraded-extension`

### 🎯 Cách sử dụng

#### Vẽ và chú thích trên trang web

1. Nhấn vào icon extension trên toolbar
2. Sử dụng các công cụ vẽ:
   - Pen (bút vẽ)
   - Eraser (tẩy)
   - Shapes (hình)
   - Text (chữ)
   - Fill (tô màu)

#### Lưu và Load drawings

**Các nút mới trên control panel:**

- 💾 **Save** - Lưu drawing hiện tại cho trang này
- 📂 **Load** - Load drawing đã lưu (nếu có)
- 🗑️ **Delete** - Xóa drawing đã lưu của trang này
- 📋 **List All** - Xem tất cả drawings đã lưu

#### Tự động load

- Khi bạn quay lại một trang đã vẽ, drawing sẽ tự động hiển thị
- Extension sử dụng URL (origin + pathname) để nhận diện trang
- Query parameters và hash được bỏ qua để đảm bảo drawing load đúng

### 🔧 Kỹ thuật

#### Cách lưu trữ

- Drawing được lưu dưới dạng base64 image data
- Storage key: `drawing_<base64_encoded_url>`
- Metadata bao gồm: URL, imageData, timestamp

#### URL Normalization

Extension chuẩn hóa URL bằng cách:
- Lấy `origin` + `pathname`
- Bỏ qua query string (`?param=value`)
- Bỏ qua hash (`#section`)

Ví dụ:
- `https://example.com/page?id=123#section`
- Normalized: `https://example.com/page`

#### Auto-save (Tùy chọn)

Để bật auto-save, uncomment dòng này trong `storageHelper.js`:
```javascript
// StorageHelper.enableAutoSave();
```

### 📝 API Messages

Extension hỗ trợ các message sau:

```javascript
// Lưu drawing
chrome.runtime.sendMessage({
  method: 'save_drawing',
  url: currentUrl,
  imageData: base64ImageData
});

// Load drawing
chrome.runtime.sendMessage({
  method: 'load_drawing',
  url: currentUrl
});

// Xóa drawing
chrome.runtime.sendMessage({
  method: 'delete_drawing',
  url: currentUrl
});

// Liệt kê drawings
chrome.runtime.sendMessage({
  method: 'list_drawings'
});
```

### 🔐 Permissions

Extension yêu cầu các quyền sau:
- `storage` - Lưu trữ drawings
- `activeTab` - Tương tác với tab hiện tại
- `scripting` - Inject scripts
- `tabs` - Theo dõi tab updates để auto-load

### 🐛 Troubleshooting

**Drawing không tự động load?**
- Kiểm tra console log xem có lỗi không
- Đảm bảo extension đã được inject vào trang
- Thử reload lại trang

**Storage đầy?**
- Chrome extension storage có giới hạn ~5MB
- Xóa các drawings cũ không cần thiết
- Sử dụng nút "List All" để quản lý

### 📊 Version History

**v2.0.0** (Current)
- ✅ Lưu drawings theo URL
- ✅ Auto-load khi quay lại trang
- ✅ Quản lý danh sách drawings
- ✅ UI buttons mới (Save, Load, Delete, List)
- ✅ Notification system
- ✅ Auto-save option

**v1.0.3** (Original)
- Basic drawing tools
- Screenshot feature
- No storage per URL

### 🙏 Credits

Based on the original Web Drawing extension, upgraded with URL-based storage functionality.
