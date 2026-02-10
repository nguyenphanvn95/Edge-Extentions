# 🔄 Hướng Dẫn Sync Highlights Qua GitHub

## Tổng Quan
Tính năng GitHub Sync cho phép bạn:
- 💾 Backup highlights lên cloud (miễn phí)
- 🔄 Sync giữa nhiều máy tính
- 👥 Chia sẻ highlights với team (nếu dùng public repo)
- 📜 Version control cho highlights

## Bước 1: Tạo GitHub Repository

### 1.1. Tạo Repository Mới
1. Đăng nhập vào https://github.com
2. Click nút **"+"** góc phải > **"New repository"**
3. Điền thông tin:
   - **Repository name**: `highlights-sync` (hoặc tên khác)
   - **Description**: "My web highlights backup"
   - **Visibility**: 
     - ✅ **Private** (khuyến nghị - chỉ bạn thấy)
     - hoặc **Public** (nếu muốn share)
   - ❌ **KHÔNG** check "Initialize with README"
4. Click **"Create repository"**

### 1.2. Copy Repository URL
Sau khi tạo xong, bạn sẽ thấy repository name dạng:
```
username/highlights-sync
```
Ví dụ: `john_doe/highlights-sync`

## Bước 2: Tạo Personal Access Token

### 2.1. Tạo Token
1. Vào https://github.com/settings/tokens
2. Click **"Generate new token"** > **"Generate new token (classic)"**
3. Điền thông tin:
   - **Note**: "Highlighter Extension Sync"
   - **Expiration**: 
     - No expiration (không giới hạn)
     - hoặc chọn thời hạn (90 days, 1 year...)
   - **Select scopes**: 
     - ✅ Check **`repo`** (Full control of private repositories)
     - Tất cả các sub-options sẽ tự động check
4. Scroll xuống > Click **"Generate token"**

### 2.2. Copy Token
⚠️ **QUAN TRỌNG**: 
- Token chỉ hiển thị **MỘT LẦN DUY NHẤT**
- Copy ngay và lưu vào nơi an toàn
- Token có dạng: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

💡 **Mẹo**: Dán token vào file text và save tạm, bạn sẽ dùng ở bước sau.

## Bước 3: Cấu Hình Extension

### 3.1. Mở Settings
1. Mở extension → Click vào **sidepanel** (hoặc nhấn `Alt+S`)
2. Click icon **⚙️ Settings** (góc phải trên)

### 3.2. Nhập Thông Tin
Điền vào form:

**GitHub Personal Access Token:**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(Token bạn vừa copy ở Bước 2.2)

**Repository (username/repo):**
```
username/highlights-sync
```
(Thay `username` bằng tên GitHub của bạn)

**File path:**
```
highlights.json
```
(Giữ nguyên, hoặc đổi tên nếu muốn)

### 3.3. Lưu Cấu Hình
1. Click **"Save Settings"**
2. Nếu thành công, bạn sẽ thấy thông báo: ✅ "Settings saved successfully!"
3. Các nút **Push to GitHub** và **Pull from GitHub** sẽ được kích hoạt

## Bước 4: Sử Dụng Sync

### 4.1. Push Highlights Lên GitHub (Lần Đầu)
1. Click nút **"Push to GitHub"**
2. Extension sẽ:
   - Lấy tất cả highlights trong máy
   - Convert sang JSON
   - Upload lên GitHub repo
3. Nếu thành công: ✅ "Successfully pushed X highlights to GitHub!"
4. Kiểm tra: Vào GitHub repo, bạn sẽ thấy file `highlights.json`

### 4.2. Pull Highlights Từ GitHub (Máy Khác)
Trên máy tính khác:
1. Cài extension
2. Cấu hình GitHub sync (cùng token + repo)
3. Click **"Pull from GitHub"**
4. Extension sẽ:
   - Download file từ GitHub
   - Merge vào highlights local (tránh duplicate)
5. Thành công: ✅ "Successfully pulled and merged X new highlights from GitHub!"

## Workflow Thường Ngày

### Kịch Bản 1: Làm Việc Trên 1 Máy
- Highlight bình thường
- Cuối ngày: Click **Push to GitHub** để backup

### Kịch Bản 2: Làm Việc Trên Nhiều Máy
**Trên máy A (sáng):**
1. Pull from GitHub (đồng bộ highlights từ hôm qua)
2. Làm việc, highlight bình thường
3. Push to GitHub (trước khi tắt máy)

**Trên máy B (chiều):**
1. Pull from GitHub (lấy highlights từ máy A)
2. Làm việc, highlight bình thường  
3. Push to GitHub (trước khi tắt máy)

**Trên máy A (tối):**
1. Pull from GitHub (lấy highlights từ máy B)
2. Highlights đã sync hoàn toàn!

## Xử Lý Xung Đột

### Merge Logic
Extension tự động merge dựa trên **UUID**:
- Nếu highlight đã tồn tại (cùng UUID) → Bỏ qua
- Nếu highlight mới (UUID chưa có) → Thêm vào

⚠️ **Lưu ý**: 
- Nếu bạn edit note/tags của cùng 1 highlight trên 2 máy
- Máy nào Push sau sẽ ghi đè
- → **Khuyến nghị**: Luôn Pull trước khi làm việc

## Troubleshooting

### ❌ "Error: File not found on GitHub"
**Nguyên nhân**: Chưa có file trên GitHub
**Giải pháp**: Click **Push to GitHub** trước

### ❌ "Error: Bad credentials"
**Nguyên nhân**: Token sai hoặc hết hạn
**Giải pháp**: 
1. Tạo token mới (Bước 2)
2. Update lại trong Settings

### ❌ "Error: Not Found"
**Nguyên nhân**: Repository name sai
**Giải pháp**: Kiểm tra lại format `username/repo-name`

### ❌ Push thành công nhưng không thấy file
**Nguyên nhân**: Có thể đang xem sai branch
**Giải pháp**: 
1. Vào GitHub repo
2. Đảm bảo đang ở branch **main** (hoặc **master**)

## Bảo Mật

### ✅ Best Practices
- ✅ Dùng **Private repository**
- ✅ Token chỉ cấp quyền **repo** (không cần thêm)
- ✅ Đặt expiration cho token (1 year)
- ✅ KHÔNG share token với ai
- ✅ KHÔNG commit token vào code

### ⚠️ Nếu Token Bị Lộ
1. Vào https://github.com/settings/tokens
2. Xóa token cũ
3. Tạo token mới
4. Update lại trong extension

## Advanced Tips

### Backup Tự Động
Bạn có thể tạo script để tự động push mỗi ngày:
1. Tạo GitHub Action (nếu biết coding)
2. Hoặc dùng IFTTT/Zapier (nếu có)

### Export Ra File Ngoài
1. Pull from GitHub
2. Export JSON → Save vào Dropbox/Google Drive
3. Double backup! 🎉

### Chia Sẻ Với Team
1. Tạo **public repository**
2. Share repository link với team
3. Họ cấu hình cùng repo (dùng token riêng)
4. Tất cả cùng sync highlights!

---

## Câu Hỏi Thường Gặp

**Q: Có giới hạn số lượng highlights không?**
A: GitHub free cho phép file tối đa 100MB. Với text highlights, bạn có thể lưu hàng triệu highlights.

**Q: Có tốn tiền không?**
A: Hoàn toàn miễn phí nếu dùng GitHub Free (private repo unlimited).

**Q: Có thể dùng GitLab/Bitbucket không?**
A: Hiện tại chỉ hỗ trợ GitHub. Các platform khác sẽ được thêm sau.

**Q: Nếu quên không push có sao không?**
A: Highlights vẫn lưu local trong máy, chỉ không sync thôi. Bạn vẫn có thể push sau.

**Q: Có thể xem lịch sử thay đổi không?**
A: Có! Vào GitHub repo > Click vào file > Xem **History** → Full version control!

---

**Chúc bạn sync thành công! 🎉**
