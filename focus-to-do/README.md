# Focus Timer - Offline Version

## Giới thiệu
Đây là phiên bản offline hoàn toàn của Focus Timer / Pomodoro Extension. Tất cả dữ liệu được lưu trữ 100% offline trên máy tính của bạn.

## Các thay đổi so với bản gốc

### Đã loại bỏ:
- ✗ Tính năng đăng nhập/đăng ký user
- ✗ Đồng bộ dữ liệu qua cloud
- ✗ Tính năng premium/thanh toán
- ✗ Các API calls đến server
- ✗ Tính năng reset password
- ✗ Tính năng chia sẻ/nhóm (group features)
- ✗ Tính năng ranking/leaderboard online

### Giữ nguyên:
- ✓ Pomodoro Timer với các chế độ Focus/Break
- ✓ Task management (Quản lý công việc)
- ✓ Project management (Quản lý dự án)
- ✓ Tags (Nhãn)
- ✓ Statistics & Reports (Thống kê & Báo cáo)
- ✓ White noise & Background sounds
- ✓ Reminders & Notifications
- ✓ Customizable themes
- ✓ Multiple languages support
- ✓ All settings & preferences
- ✓ History tracking

### Lưu trữ dữ liệu:
- Tất cả dữ liệu được lưu trong Chrome Local Storage
- Không cần kết nối internet
- Dữ liệu không được đồng bộ giữa các thiết bị
- An toàn và riêng tư 100%

## Cài đặt

### Cài đặt Extension:
1. Mở Chrome và truy cập: `chrome://extensions/`
2. Bật "Developer mode" ở góc trên bên phải
3. Click "Load unpacked"
4. Chọn thư mục `offline_version`

### Sử dụng:
- Click vào icon extension trên thanh công cụ để mở ứng dụng
- Tất cả dữ liệu sẽ được lưu tự động trong local storage

## Tính năng chính

### 1. Pomodoro Timer
- Focus session (25 phút mặc định)
- Short break (5 phút)
- Long break (15 phút)
- Tùy chỉnh thời gian
- White noise & background sounds

### 2. Task Management
- Tạo, sửa, xóa tasks
- Set priority (Low, Medium, High)
- Add notes & subtasks
- Set deadlines
- Pomodoro estimation

### 3. Project & Folder
- Tổ chức tasks theo projects
- Folders để nhóm projects
- Color coding
- Custom icons

### 4. Tags
- Tag tasks với labels
- Filter by tags
- Manage tag list

### 5. Statistics
- Focus time tracking
- Completed tasks count
- Daily/Weekly/Monthly reports
- Charts & visualizations

### 6. Forest Feature
- Grow virtual trees while focusing
- Track your focus forest
- Gamification element

### 7. Settings
- Theme customization
- Sound settings
- Timer preferences
- Language selection
- General settings

## Dữ liệu được lưu

Tất cả dữ liệu sau được lưu trong Chrome Local Storage:

```javascript
{
  // Tasks data
  tasks: [],
  
  // Projects & Folders
  projects: [],
  folders: [],
  
  // Tags
  tags: [],
  
  // History
  pomoHistory: [],
  taskHistory: [],
  
  // Statistics
  stats: {
    totalFocusTime: 0,
    completedTasks: 0,
    trees: []
  },
  
  // Settings
  settings: {
    theme: 'light',
    sounds: {...},
    timer: {...},
    language: 'en'
  },
  
  // Window state
  windowSize: {width: 1000, height: 598}
}
```

## Backup & Restore

### Xuất dữ liệu:
Bạn có thể xuất dữ liệu bằng cách:
1. Mở Chrome DevTools (F12)
2. Vào tab Console
3. Chạy lệnh:
```javascript
chrome.storage.local.get(null, function(data) {
  console.log(JSON.stringify(data));
  // Copy và lưu kết quả
});
```

### Nhập dữ liệu:
1. Mở Chrome DevTools (F12)
2. Vào tab Console
3. Chạy lệnh:
```javascript
let backupData = {/* paste your backup data here */};
chrome.storage.local.set(backupData, function() {
  console.log('Data restored!');
  location.reload();
});
```

## Lưu ý quan trọng

1. **Không đồng bộ**: Dữ liệu chỉ lưu trên máy tính này
2. **Backup thường xuyên**: Nên xuất dữ liệu định kỳ để backup
3. **Xóa extension**: Nếu xóa extension, dữ liệu sẽ bị mất
4. **Reset browser**: Reset Chrome sẽ xóa dữ liệu

## Hỗ trợ & Phát triển

Phiên bản này được tạo ra để:
- Hoạt động hoàn toàn offline
- Bảo vệ quyền riêng tư
- Không cần tài khoản
- Miễn phí 100%

## Phím tắt (Coming soon)
- `Alt+S`: Start/Stop timer
- `Alt+P`: Pause/Resume
- `Alt+N`: New task
- `Alt+R`: Open reports

## Changelog

### Version 7.1.1-offline
- ✓ Loại bỏ tất cả tính năng liên quan đến user/server
- ✓ 100% offline functionality
- ✓ Tối ưu localStorage
- ✓ Giữ nguyên tất cả tính năng core
- ✓ Vietnamese README

---

**Made with ❤️ for productivity**
**Offline version - No tracking, No account needed**
