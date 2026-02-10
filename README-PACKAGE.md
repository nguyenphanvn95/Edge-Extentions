# 🎉 Readlang Mock Server - Offline Mode Complete Package

Chúc mừng! Bạn đã có **mock server hoàn chỉnh** để chạy Readlang extension ở chế độ offline.

## 📦 Nội dung package

```
readlang-mock-server/
├── server.js                    # Server cơ bản (RAM only)
├── server-advanced.js           # Server nâng cao (persistent + API)
├── package.json                 # Dependencies
├── setup.sh                     # Script cài đặt nhanh
├── README.md                    # Hướng dẫn đầy đủ
├── QUICKSTART.md               # Hướng dẫn nhanh 5 phút
├── CHANGELOG.md                # Lịch sử phát triển
├── LICENSE                     # Giấy phép MIT
├── .gitignore                  # Git ignore file
└── readlang-extension-local/   # Extension đã patch (sẵn sàng dùng)
    ├── manifest.json
    ├── src/
    │   ├── background.js       # ✅ Đã đổi environment = "local"
    │   ├── build/
    │   └── ...
    └── content/
```

## 🚀 Bắt đầu ngay (3 bước)

### 1. Giải nén và cài đặt
```bash
tar -xzf readlang-mock-server.tar.gz
cd readlang-mock-server
chmod +x setup.sh
./setup.sh
```

Hoặc thủ công:
```bash
npm install
```

### 2. Chạy server
```bash
# Chọn 1 trong 2:

# Server cơ bản
npm start

# Server nâng cao (khuyên dùng)
npm start:advanced
```

### 3. Load extension vào Chrome
1. Mở Chrome: **chrome://extensions/**
2. Bật **"Developer mode"** (góc trên phải)
3. Click **"Load unpacked"**
4. Chọn thư mục: **readlang-mock-server/readlang-extension-local/**
5. ✅ Xong!

## ✨ Sử dụng

1. Mở bất kỳ trang web nào (ví dụ: Wikipedia, BBC News, ...)
2. Click vào **icon Readlang** trên thanh công cụ
3. Web Reader sẽ xuất hiện
4. Click vào từ để dịch
5. Từ được tự động lưu vào danh sách của bạn

## 🎯 Tính năng

### ✅ Hoạt động đầy đủ offline:

- **Dịch từ/cụm từ**: Click để dịch ngay lập tức
- **Lưu từ vựng**: Tự động lưu và quản lý
- **Flashcards**: Ôn tập từ đã học
- **Import văn bản**: Import từ bất kỳ trang web nào
- **16+ ngôn ngữ**: English, Vietnamese, Spanish, French, German, ...
- **Context menu**: Right-click để import nhanh

### 🔧 2 phiên bản server:

#### Server Cơ Bản (`npm start`)
- ✅ Đơn giản, nhanh
- ✅ Hoàn toàn offline
- ⚠️ Dữ liệu mất khi tắt
- ⚠️ Từ điển nhỏ (~100 từ)

#### Server Nâng Cao (`npm start:advanced`) - **KHUYÊN DÙNG**
- ✅ Dịch thuật chính xác (MyMemory API)
- ✅ Lưu dữ liệu vĩnh viễn (file JSON)
- ✅ Từ điển lớn (1000+ từ)
- ✅ Auto-save mỗi 30 giây
- ✅ Graceful shutdown

## 📚 Tài liệu

- **QUICKSTART.md**: Hướng dẫn nhanh 5 phút
- **README.md**: Hướng dẫn chi tiết đầy đủ
- **CHANGELOG.md**: Lịch sử phiên bản

## 🔍 Kiểm tra server

Mở trình duyệt và thử:
- http://localhost:3000/api/languages
- http://localhost:3000/api/translate?q=hello&from=en&to=vi

Thấy dữ liệu JSON = Server OK ✅

## 💡 Tips hữu ích

### Thêm từ vào từ điển
1. Mở file `server-advanced.js`
2. Tìm `translationDict`
3. Thêm:
```javascript
'từ tiếng việt': 'english translation',
'english word': 'dịch tiếng việt',
```

### Xem dữ liệu đã lưu
- File: `data.json` (tự động tạo khi dùng server nâng cao)
- Xem/sửa bằng text editor

### Reset tất cả
```bash
# Server cơ bản: Restart
npm start

# Server nâng cao: Xóa data.json và restart
rm data.json
npm start:advanced
```

## 🐛 Troubleshooting

### Extension không kết nối?
1. ✅ Server có đang chạy?
2. ✅ Thử: http://localhost:3000/api/languages
3. ✅ Check Chrome DevTools → Console

### Không dịch được?
1. Server nâng cao: Kiểm tra internet
2. Server cơ bản: Thêm từ vào dictionary
3. Xem console log để debug

### Không lưu được từ?
1. Restart extension
2. Clear browser cache
3. Xem console log

## 🌟 Mở rộng

### Tích hợp Google Translate
```javascript
// Thay thế trong server-advanced.js
async function translateWithAPI(text, from, to) {
  // Your Google Translate API code here
}
```

### Thêm database
```bash
npm install better-sqlite3
```

Xem chi tiết trong **README.md**

## ⚠️ Lưu ý quan trọng

- Đây là **mock server** cho mục đích học tập
- **KHÔNG** sử dụng cho mục đích thương mại
- Readlang® là thương hiệu của chủ sở hữu
- Project này **không liên kết** với Readlang chính thức

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón!
- Báo lỗi: Tạo issue
- Thêm tính năng: Tạo pull request
- Cải thiện docs: Edit và submit

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Đọc **QUICKSTART.md**
2. Đọc **README.md** section Troubleshooting
3. Check CHANGELOG.md Known Issues
4. Tạo issue với log chi tiết

## 📝 License

MIT License - Xem file LICENSE

---

## 🎊 Chúc bạn học tốt!

Với mock server này, bạn có thể:
- ✅ Học ngoại ngữ hoàn toàn offline
- ✅ Kiểm soát hoàn toàn dữ liệu
- ✅ Tùy chỉnh theo ý muốn
- ✅ Không cần tài khoản Readlang

**Happy Learning! 📚🌍**

---

Created with ❤️ for language learners
