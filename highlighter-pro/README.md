# 🎨 Highlighter Pro - Advanced Web Highlighter Extension

**Phiên bản nâng cấp** của Web Highlighter với đầy đủ tính năng quản lý, sync và export.

## ✨ Tính Năng Chính

### 1. 📋 Side Panel Quản Lý Highlights
- **Danh sách highlights** theo trang/domain/toàn bộ
- **Tìm kiếm** trong nội dung, notes và tags
- **Lọc theo màu** highlight
- **Click để nhảy** tới vị trí highlight trên trang
- **Thống kê** tổng số highlights

### 2. 🏷️ Tags & Notes
- Mỗi highlight có thể có:
  - **Notes**: Ghi chú cá nhân
  - **Tags**: Phân loại và tìm kiếm nhanh
- Hover tool có nút **"Add Note/Tag"** để thêm nhanh
- Edit trực tiếp từ sidepanel

### 3. 📦 Export & Import
- **JSON**: Backup và sync đầy đủ metadata
- **CSV**: Import vào Excel/Google Sheets
- **Markdown**: Xuất sang Notion/Obsidian với format đẹp

### 4. ☁️ Sync Đa Thiết Bị (GitHub)
- Sync qua **GitHub repository**
- **Auto-Sync**: Tự động sync mỗi 5 phút (configurable)
- **Smart Conflict Resolution**: So sánh timestamps, tự động backup
- Push/Pull highlights giữa các máy
- Tự động merge, tránh duplicate
- **Local Backups**: Tự động backup trước khi pull (giữ 5 backups gần nhất)
- **Sync Indicator**: Hiển thị trạng thái sync real-time
- Bảo mật với Personal Access Token

### 5. ⌨️ Keyboard Shortcuts
| Phím | Chức năng |
|------|-----------|
| `Alt+H` | Highlight text đã chọn |
| `Alt+Shift+H` | Bật/tắt highlighter cursor |
| `Alt+1` | Đổi sang màu vàng (Yellow) |
| `Alt+2` | Đổi sang màu xanh dương (Cyan) |
| `Alt+3` | Đổi sang màu xanh lá (Lime) |
| `Alt+4` | Đổi sang màu hồng (Magenta) |
| `Alt+D` | Xóa highlight đang chọn |
| `Alt+S` | Mở sidepanel |
| `Ctrl/Cmd+F` | Focus vào search box (trong sidepanel) |
| `Esc` | Đóng modal hoặc clear search |

## 🚀 Cài Đặt

### Cài Extension
1. Download hoặc clone repository này
2. Mở Chrome/Edge → `chrome://extensions/`
3. Bật **Developer mode**
4. Click **Load unpacked** → Chọn thư mục `highlighter-pro`
5. Extension sẽ xuất hiện trên thanh công cụ

### Cấu Hình GitHub Sync (Tùy chọn)
1. Tạo GitHub repository mới (có thể private)
2. Tạo **Personal Access Token**:
   - Vào https://github.com/settings/tokens/new
   - Chọn scope: `repo` (Full control of private repositories)
   - Generate token và copy
3. Mở sidepanel → Click icon ⚙️ (Settings)
4. Nhập:
   - **GitHub Token**: Token vừa tạo
   - **Repository**: `username/repo-name`
   - **File path**: `highlights.json` (hoặc tùy chỉnh)
5. Click **Save Settings**

## 📖 Hướng Dẫn Sử Dụng

### Tạo Highlight
1. **Cách 1**: Select text → Click chuột phải → "Highlight"
2. **Cách 2**: Select text → Nhấn `Alt+H`
3. **Cách 3**: Click icon extension → Bật highlighter cursor → Click drag trên text

### Quản Lý Highlights
1. Click icon extension hoặc nhấn `Alt+S` để mở **sidepanel**
2. Chọn view mode:
   - **Current Page**: Chỉ highlights trên trang hiện tại
   - **Current Domain**: Tất cả highlights trên domain
   - **All Highlights**: Toàn bộ highlights
3. Dùng search box để tìm kiếm
4. Filter theo màu bằng các nút màu

### Thêm Note/Tag
1. **Hover** chuột lên highlight → Click icon 📝 (Note)
2. Hoặc mở sidepanel → Click icon ✏️ (Edit) trên highlight
3. Thêm:
   - **Note**: Ghi chú tự do
   - **Tags**: Nhập các tag cách nhau bởi dấu phẩy (VD: `important, research, todo`)

### Export Highlights
1. Mở sidepanel → Click icon ⬇️ (Export)
2. Chọn định dạng:
   - **JSON**: Đầy đủ metadata, dùng để backup/sync
   - **CSV**: Dùng trong Excel/Sheets để phân tích
   - **Markdown**: Đẹp, dễ đọc, dùng cho Notion/Obsidian
3. File sẽ được tải xuống

### Import Highlights
1. Mở sidepanel → Click icon ⬆️ (Import)
2. Chọn file JSON đã export trước đó
3. Click **Import**
4. Highlights sẽ được merge (tránh duplicate)

### Sync với GitHub
#### Push (Đẩy lên GitHub)
1. Mở sidepanel → Click icon 🔄 (Sync)
2. Click **Push to GitHub**
3. Tất cả highlights được đẩy lên repository

#### Pull (Kéo về từ GitHub)
1. Trên máy khác, sau khi cài extension
2. Cấu hình cùng GitHub token/repo
3. Click **Pull from GitHub**
4. Highlights từ GitHub sẽ được merge vào local

#### Auto-Sync (Khuyên Dùng!)
1. Trong Sync Settings modal
2. ✅ Check **"Enable Auto-Sync"**
3. Chọn interval: **Every 5 minutes** (hoặc tùy chọn)
4. Click **Save Settings**
5. Extension sẽ tự động sync:
   - **Local mới hơn** → Auto-push to GitHub
   - **GitHub mới hơn** → Auto-backup local + Pull from GitHub
   - **Đã sync** → Skip (không làm gì)

📖 Chi tiết: Xem [AUTO_SYNC_GUIDE.md](AUTO_SYNC_GUIDE.md)

### Quản Lý Backups
Auto-sync tự động tạo backup trước khi pull. Để xem:
1. Sync Settings → **View Backups**
2. Restore hoặc Delete backups cũ
3. Tự động giữ 5 backups gần nhất

## 🎨 Màu Highlight

Extension hỗ trợ 5 màu mặc định:
- 🟡 **Yellow** (Vàng) - Alt+1
- 🔵 **Cyan** (Xanh dương) - Alt+2
- 🟢 **Lime** (Xanh lá) - Alt+3
- 🔴 **Magenta** (Hồng) - Alt+4
- ⚫ **Dark** (Đen)

## 📂 Cấu Trúc Dữ Liệu

### Highlight Object
```json
{
  "uuid": "unique-id",
  "string": "Highlighted text content",
  "url": "https://example.com/page",
  "color": "yellow",
  "textColor": "#000000",
  "note": "My personal note",
  "tags": ["important", "research"],
  "createdAt": 1707280000000,
  "updatedAt": 1707280100000,
  "container": "CSS selector",
  "anchorNode": "CSS selector",
  "anchorOffset": 0,
  "focusNode": "CSS selector", 
  "focusOffset": 10
}
```

## 🔧 Troubleshooting

### Highlights không hiển thị
- Refresh lại trang
- Kiểm tra xem trang có block JavaScript không
- Một số trang động (SPA) có thể cần thời gian load

### Sync GitHub lỗi
- Kiểm tra token còn hiệu lực
- Kiểm tra repository name đúng format: `username/repo`
- Đảm bảo repository tồn tại và token có quyền truy cập

### Import lỗi
- Chỉ import file JSON được export từ extension này
- Kiểm tra file không bị corrupt

## 🛠️ Development

### Cấu trúc thư mục
```
highlighter-pro/
├── manifest.json           # Extension config
├── background.js          # Service worker
├── contentScript.js       # Content script entry
├── src/
│   ├── background/        # Background scripts
│   ├── contentScripts/    # Content scripts
│   ├── popup/             # Popup UI
│   └── sidepanel/         # Sidepanel UI (NEW)
│       ├── index.html     # Sidepanel HTML
│       ├── index.css      # Sidepanel styles
│       └── index.js       # Sidepanel logic
├── images/                # Icons
└── lib/                   # Libraries (jQuery)
```

### Build từ source
```bash
# Clone repository
git clone [repo-url]
cd highlighter-pro

# Load vào Chrome
# Chrome > Extensions > Developer mode > Load unpacked
```

## 📝 Changelog

### v2.1.0 (Current - Auto-Sync Update)
- ✨ **Auto-Sync**: Tự động sync mỗi 5 phút (configurable: 1-30 min)
- 🧠 **Smart Conflict Resolution**: Timestamp-based sync decisions
- 💾 **Automatic Backups**: Backup trước khi pull, giữ 5 backups gần nhất
- 📊 **Sync Status Indicator**: Real-time sync status trong header
- 🔧 **Backup Management**: View, restore, delete backups
- ⚙️ **Configurable Intervals**: 1/5/10/15/30 minutes
- 🎯 **Set-and-Forget**: Enable một lần, tự động sync mãi mãi

### v2.0.0 (Major Release)
- ✨ Thêm Side Panel quản lý highlights
- 🏷️ Hỗ trợ Tags & Notes
- 📦 Export CSV, JSON, Markdown
- 📥 Import từ JSON
- ☁️ Sync với GitHub
- ⌨️ Keyboard shortcuts mới (1/2/3/4, Alt+D, Alt+S)
- 🎯 Click để jump tới highlight
- 🔍 Search trong highlights
- 🎨 Filter theo màu
- 📊 Thống kê highlights

### v1.2.2 (Original)
- Basic highlighting
- Color change
- Copy/Delete
- Context menu

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Nâng cấp từ Web Highlighter extension gốc với các tính năng enterprise-level.

---

**Happy Highlighting! 🎨📚**
