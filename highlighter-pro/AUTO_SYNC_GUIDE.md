# 🔄 Auto-Sync Guide - Automatic GitHub Synchronization

## Tổng Quan

Auto-Sync tự động đồng bộ highlights của bạn với GitHub mỗi vài phút, đảm bảo:
- ✅ Không bao giờ mất dữ liệu
- ✅ Luôn đồng bộ giữa các máy
- ✅ Tự động backup trước khi pull
- ✅ Thông minh xử lý conflicts

## 🎯 Cách Hoạt Động

### Logic Auto-Sync

Auto-Sync sử dụng **timestamp-based synchronization**:

```
Every 5 minutes (configurable):
├── Check local highlights last modified time
├── Check GitHub file last modified time
├── Compare timestamps
└── Decision:
    ├── Local newer → Push to GitHub
    ├── GitHub newer → Backup local + Pull from GitHub
    └── Same → Skip (already synced)
```

### Timeline Example

```
9:00 AM - Máy A: Create highlight → Auto-sync push to GitHub
9:05 AM - Máy B: Auto-sync pull from GitHub → Synced!
9:10 AM - Máy B: Create new highlight → Auto-sync push
9:15 AM - Máy A: Auto-sync pull → Synced!
```

## ⚙️ Cấu Hình Auto-Sync

### Bước 1: Setup GitHub (Nếu Chưa Có)
Xem: [GITHUB_SYNC_GUIDE.md](GITHUB_SYNC_GUIDE.md)

### Bước 2: Enable Auto-Sync

1. Mở Sidepanel → Click **⚙️ Settings**
2. Trong "Sync Settings" modal:
   - ✅ Check **"Enable Auto-Sync"**
   - Chọn interval: **Every 5 minutes** (hoặc tùy chọn)
3. Click **Save Settings**

### Auto-Sync Intervals

| Interval | Use Case |
|----------|----------|
| 1 minute | Real-time collaboration (nhiều người cùng làm) |
| 5 minutes | Recommended - Balance giữa sync và battery |
| 10 minutes | Lighter sync, vẫn đủ nhanh |
| 15 minutes | Casual use |
| 30 minutes | Minimal battery impact |

## 🔐 Smart Conflict Resolution

### Scenario 1: Local Có Dữ Liệu Mới
```
You: Create highlight at 10:00 AM
Auto-sync (10:05 AM):
  → Check: Local timestamp > GitHub timestamp
  → Action: Push to GitHub
  → Result: ✅ GitHub updated
```

### Scenario 2: GitHub Có Dữ Liệu Mới
```
Other device: Create highlight at 10:00 AM, pushed to GitHub
Auto-sync on your device (10:05 AM):
  → Check: GitHub timestamp > Local timestamp
  → Action: 
     1. Backup local highlights
     2. Pull from GitHub
     3. Merge (avoid duplicates)
  → Result: ✅ Local updated + Backup saved
```

### Scenario 3: Already Synced
```
Auto-sync (10:05 AM):
  → Check: Local timestamp == GitHub timestamp
  → Action: Skip (already in sync)
  → Result: ✅ No unnecessary operations
```

## 💾 Automatic Backups

### Khi Nào Backup Được Tạo?

Auto-sync **tự động tạo backup** trước khi pull từ GitHub:

```
Before pulling from GitHub:
1. Save current highlights to local backup
2. Pull new data from GitHub
3. Merge intelligently
4. Keep last 5 backups automatically
```

### Xem Backups

1. Sidepanel → Settings
2. Trong Sync modal → Click **"View Backups"**
3. Bạn sẽ thấy list backups với:
   - Timestamp
   - Số lượng highlights
   - Actions: Restore / Delete

### Restore Backup

1. View Backups
2. Chọn backup muốn restore
3. Click **"Restore"**
4. Confirm
5. Current highlights sẽ được backup trước
6. Backup được restore

## 📊 Sync Status Indicator

Ở header của sidepanel, bạn sẽ thấy sync indicator:

```
✅ Last sync: 10:05:32 AM    (Success)
⚠️ Last sync: Error         (Failed)
```

### Success Messages
- ✅ "Last sync: 10:05 AM" - Everything synced
- ✅ "Already in sync" - No changes needed

### Error Messages
- ⚠️ "Error: Bad credentials" - GitHub token invalid
- ⚠️ "Error: Not Found" - Repository not found
- ⚠️ "Error: Network issue" - Check internet

## 🎛️ Managing Auto-Sync

### Enable/Disable

**Enable:**
1. Settings → Check "Enable Auto-Sync"
2. Save Settings
3. Auto-sync starts immediately

**Disable:**
1. Settings → Uncheck "Enable Auto-Sync"
2. Save Settings
3. Auto-sync stops

### Change Interval

1. Settings → Select new interval
2. Save Settings
3. Auto-sync restarts with new interval

### Manual Sync (Override Auto-Sync)

Even with auto-sync enabled, you can:
- Click **"Push to GitHub"** - Force push now
- Click **"Pull from GitHub"** - Force pull now

## 🔋 Performance & Battery

### Network Usage

- **Metadata check**: ~1 KB per sync
- **Push**: ~10-50 KB (depends on highlights)
- **Pull**: ~10-50 KB (depends on highlights)

**Example**: 100 highlights = ~30 KB per push/pull

### Battery Impact

| Interval | Network Calls/Hour | Battery Impact |
|----------|-------------------|----------------|
| 1 min | 60 | Medium |
| 5 min | 12 | ✅ Low (Recommended) |
| 10 min | 6 | Very Low |
| 30 min | 2 | Minimal |

**Recommendation**: 5 minutes là sweet spot

## 🚨 Troubleshooting

### Auto-Sync Không Hoạt Động

**Check 1**: Verify Settings
```
Sidepanel → Settings → Sync modal:
- GitHub token filled?
- Repository name correct?
- "Enable Auto-Sync" checked?
```

**Check 2**: Check Console
```
F12 → Console tab
Look for:
  🔄 Auto-sync started: every 5 minutes
  ✅ Auto-sync: Already in sync
```

**Check 3**: Test Manual Sync
```
Click "Push to GitHub" or "Pull from GitHub"
If manual works → Auto-sync should work
If manual fails → Fix GitHub settings first
```

### Sync Indicator Shows Error

**"Bad credentials":**
- GitHub token expired or wrong
- Solution: Create new token, update settings

**"Not Found":**
- Repository name wrong (should be `username/repo`)
- Solution: Check repository exists, fix name

**"Network issue":**
- No internet connection
- Solution: Check internet, auto-sync will retry

### Backups Not Created

Backups only created when:
- Auto-sync pulls from GitHub
- Manual pull from GitHub

They're NOT created when:
- Pushing to GitHub
- Syncing shows "Already in sync"

## 💡 Best Practices

### 1. Trust the Auto-Sync
```
✅ DO: Let auto-sync run in background
❌ DON'T: Manually sync every time
```

### 2. Check Sync Indicator Occasionally
```
✅ DO: Glance at "Last sync" time
❌ DON'T: Worry if it's a few minutes old
```

### 3. Keep Backups
```
✅ DO: Keep last 2-3 backups
❌ DON'T: Delete all backups (you never know!)
```

### 4. Multiple Devices
```
✅ DO: Same GitHub repo, different tokens (security)
❌ DON'T: Share tokens between devices
```

### 5. Interval Selection
```
✅ DO: 5 minutes for normal use
✅ DO: 1 minute for team collaboration
❌ DON'T: 1 minute if working alone (battery waste)
```

## 🎓 Advanced Tips

### Multi-Device Workflow

**Setup:**
```
Device A: Enable auto-sync (5 min)
Device B: Enable auto-sync (5 min)
Device C: Enable auto-sync (5 min)
All use same GitHub repo
```

**Result:**
- Work on any device
- Auto-sync every 5 min
- All devices stay synced
- No manual intervention needed!

### Team Collaboration

**Setup:**
```
1. Create shared GitHub repo (private)
2. Add team members as collaborators
3. Each person creates their own token
4. Everyone enables auto-sync
```

**Result:**
- Shared knowledge base
- Real-time collaboration
- Everyone's highlights synced

### Backup Strategy

**3-2-1 Rule:**
- 3 copies: Local + GitHub + Export
- 2 formats: Browser storage + JSON file
- 1 offsite: GitHub cloud

**Implementation:**
```
Auto-sync: Handle GitHub backup ✅
Weekly: Export JSON to Dropbox/Google Drive ✅
Monthly: Export Markdown to Notion/Obsidian ✅
```

## 📈 Monitoring Auto-Sync

### Console Logs

Open console (F12) to see auto-sync activity:

```
🔄 Auto-sync started: every 5 minutes
✅ Auto-sync: Checking for updates...
📤 Auto-sync: Local is newer, pushing to GitHub
✅ Auto-sync: Already in sync
📥 Auto-sync: Remote is newer, backing up local and pulling
💾 Backup created: 2/7/2026, 10:05:32 AM
```

### Sync History (via GitHub)

Visit your GitHub repo:
1. Go to: `https://github.com/username/repo-name`
2. Click on `highlights.json`
3. Click **History**
4. See all sync commits with timestamps

Example:
```
[Auto-sync] Update highlights - 2026-02-07T10:05:32.123Z
[Auto-sync] Update highlights - 2026-02-07T10:00:15.456Z
[Auto-sync] Update highlights - 2026-02-07T09:55:08.789Z
```

## ❓ FAQ

**Q: Auto-sync làm chậm browser không?**
A: Không. Chạy background, không ảnh hưởng browsing.

**Q: Nếu tắt máy khi đang sync?**
A: Không sao. Next sync sẽ hoàn thành transaction.

**Q: Có thể dùng auto-sync với manual sync không?**
A: Có! Manual sync không ảnh hưởng auto-sync.

**Q: Backups lưu ở đâu?**
A: Local browser storage (chrome.storage.local).

**Q: Giới hạn số lượng backups?**
A: Tự động giữ 5 backups mới nhất.

**Q: Token bị revoke thì sao?**
A: Auto-sync dừng. Tạo token mới và update settings.

**Q: Có thể sync nhiều repos không?**
A: Không (hiện tại). Một extension = một repo.

**Q: Rate limit của GitHub API?**
A: 5000 requests/hour (rất nhiều cho auto-sync).

---

## 🎉 Kết Luận

Auto-Sync giúp bạn:
- ✅ Không cần nghĩ về việc backup
- ✅ Luôn đồng bộ giữa các máy
- ✅ Tự động xử lý conflicts
- ✅ Safe với automatic backups
- ✅ Set-and-forget experience!

**Setup một lần → Forget about it → Enjoy synced highlights! 🚀**

---

*Last updated: v2.1.0 - Auto-Sync Feature*
