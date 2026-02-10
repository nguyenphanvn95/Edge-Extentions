# ⚡ Auto-Sync Quick Start

## Setup trong 3 Phút ⏱️

### ✅ Step 1: Cài Extension (30 giây)
Already installed? Skip to Step 2!

### ✅ Step 2: Setup GitHub (2 phút)
1. Tạo GitHub repo: https://github.com/new
   - Name: `highlights-sync`
   - Private ✅
   - Don't initialize with README

2. Tạo Token: https://github.com/settings/tokens/new
   - Note: "Highlighter Extension"
   - Expiration: No expiration
   - Scope: ✅ `repo`
   - **Copy token ngay!**

### ✅ Step 3: Enable Auto-Sync (30 giây)
1. Mở extension → Press `Alt+S`
2. Click **⚙️ Settings** (góc phải)
3. Điền:
   ```
   GitHub Token: ghp_xxxxx (token vừa copy)
   Repository: username/highlights-sync
   File path: highlights.json (giữ nguyên)
   ```
4. ✅ Check **"Enable Auto-Sync"**
5. Interval: **Every 5 minutes** ✅
6. Click **Save Settings**

## 🎉 Done! Auto-Sync Đã Chạy!

Bạn sẽ thấy trong header:
```
✅ Last sync: 10:05:32 AM
```

## 🚀 Cách Sử Dụng

### Trên Máy Thứ 2
1. Cài extension
2. Setup GitHub (cùng token/repo)
3. Enable Auto-Sync
4. **Tự động pull highlights từ máy 1!** 🎊

### Daily Workflow
```
Nothing! 😎

Just work normally:
- Highlight text
- Auto-sync handles the rest
- Check sync indicator occasionally
```

## 💡 Tips

### Check Sync Status
```
Sidepanel header → "Last sync: time"
✅ = Success
⚠️ = Error (check settings)
```

### Manual Sync (if needed)
```
Settings → Push/Pull buttons
Use if you want to force sync immediately
```

### View Backups
```
Settings → View Backups
See all auto-created backups
Restore if needed
```

## 🔧 Troubleshooting

### Auto-Sync Không Chạy?
```
1. Settings → Verify:
   - Token filled?
   - Repo name correct?
   - Auto-sync checked?

2. Try manual Push/Pull first
   If works → Auto-sync should work
   If fails → Fix settings first

3. Check console (F12)
   Look for sync logs
```

### Sync Indicator Shows Error?
```
- "Bad credentials" → Token wrong/expired
- "Not Found" → Repo name wrong
- "Network" → Check internet
```

## 📖 Learn More

- **Full Guide**: [AUTO_SYNC_GUIDE.md](AUTO_SYNC_GUIDE.md)
- **GitHub Setup**: [GITHUB_SYNC_GUIDE.md](GITHUB_SYNC_GUIDE.md)
- **README**: [README.md](README.md)

---

**That's it! Set once, forget forever! 🎉🔄**
