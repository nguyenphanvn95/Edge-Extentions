# Changelog

All notable changes to Highlighter Pro will be documented in this file.

## [2.1.0] - 2026-02-07

### 🔄 Auto-Sync Major Update

This release introduces intelligent automatic synchronization with GitHub.

### ✨ Added

#### Auto-Sync System
- **Automatic Synchronization**: Syncs highlights every 5 minutes (configurable)
- **Smart Conflict Resolution**: Timestamp-based decision making
  - Local newer → Auto-push to GitHub
  - GitHub newer → Auto-backup local + Pull from GitHub
  - Already synced → Skip unnecessary operations
- **Configurable Intervals**: 1, 5, 10, 15, or 30 minutes
- **Sync Status Indicator**: Real-time status display in sidepanel header
- **Enable/Disable Toggle**: Easy control of auto-sync

#### Automatic Backup System
- **Pre-Pull Backups**: Automatically backup before pulling from GitHub
- **Smart Retention**: Keep last 5 backups automatically
- **Backup Viewer**: Modal to view all local backups
- **Restore Function**: One-click restore from any backup
- **Backup Management**: Delete old backups manually

#### UI Improvements
- Sync indicator in header showing last sync time
- Auto-sync settings in sync modal
- Backup section with "View Backups" button
- Backup modal with restore/delete actions
- Visual feedback for sync status (success/error)

### 🔄 Changed
- Sync settings modal now includes auto-sync configuration
- Enhanced sync status messages with more detail
- Better error handling for sync operations
- Improved performance for large highlight sets

### 🐛 Fixed
- Better handling of network interruptions during sync
- Fixed race conditions in concurrent sync operations
- Improved UUID-based deduplication
- Better timestamp comparison logic

### 📚 Documentation
- New **AUTO_SYNC_GUIDE.md** with comprehensive auto-sync documentation
- Updated README with auto-sync section
- Added troubleshooting guide for auto-sync issues
- Performance and battery impact information

---

## [2.0.0] - 2026-02-07

### 🎉 Major Release - Complete Rewrite

This is a major upgrade from the original Web Highlighter extension with enterprise-level features.

### ✨ Added

#### Side Panel Management
- **New Side Panel UI** for managing all highlights
- View modes: Current Page / Current Domain / All Highlights
- Real-time search across highlight content, notes, and tags
- Color filtering with visual color buttons
- Statistics display (total and filtered counts)
- Click on highlight to jump to its location on page
- Beautiful gradient header with modern design

#### Tags & Notes System
- **Tags**: Add multiple tags to each highlight for categorization
- **Notes**: Personal notes for each highlight
- **Quick Edit**: Hover tool now has "Add Note/Tag" button
- Edit modal for quick updates
- Tag-based search functionality
- Visual tag chips in highlight cards

#### Export & Import
- **JSON Export**: Full backup with all metadata
- **CSV Export**: Compatible with Excel/Google Sheets
- **Markdown Export**: Beautiful formatting for Notion/Obsidian
  - Organized by domain
  - Includes notes and tags
  - Clickable source links
- **Import JSON**: Restore highlights from backup
- Smart merge to avoid duplicates (UUID-based)

#### GitHub Sync
- **Cloud Backup**: Sync highlights to GitHub repository
- **Multi-Device Sync**: Work seamlessly across computers
- **Push to GitHub**: Upload all highlights
- **Pull from GitHub**: Download and merge highlights
- Automatic conflict resolution
- Support for both public and private repositories
- Secure authentication via Personal Access Token

#### Keyboard Shortcuts
- `Alt+1/2/3/4`: Quick color change (Yellow/Cyan/Lime/Magenta)
- `Alt+D`: Delete selected highlight
- `Alt+S`: Open sidepanel
- `Alt+Shift+H`: Toggle highlighter cursor (updated from original)
- `Ctrl/Cmd+F`: Focus search in sidepanel
- `Esc`: Close modal or clear search

#### UI/UX Improvements
- Modern, gradient-based design
- Responsive layout
- Smooth animations and transitions
- Better color scheme
- Icons for all actions
- Modal dialogs for complex actions
- Empty states with helpful messages
- Loading indicators for async operations

### 🔄 Changed

#### Storage Enhancements
- Added `tags` array to highlight object
- Added `note` string to highlight object
- Added `uuid` for unique identification
- Better timestamp management (`createdAt`, `updatedAt`)

#### Hover Tools
- Increased toolbar width to accommodate 4 buttons
- Added "Note" button with edit icon
- Updated button spacing

#### Manifest Updates
- Version bumped to 2.0.0
- Added `sidePanel` permission
- Added `tabs` and `activeTab` permissions
- Renamed keyboard shortcuts for clarity
- Added new shortcuts for quick color switching

### 🐛 Fixed
- Better error handling for storage operations
- Improved highlight preservation across dynamic pages
- Fixed toolbar positioning on scroll

### 🔧 Technical Improvements
- Modular code structure
- Better separation of concerns
- Enhanced error handling
- Improved performance for large datasets
- GitHub API integration
- Base64 encoding/decoding for file content

### 📚 Documentation
- Comprehensive README with feature overview
- Detailed GitHub sync setup guide
- Keyboard shortcuts reference table
- Troubleshooting section
- Data structure documentation

---

## [1.2.2] - 2024-05-21 (Original Version)

### Features from Original Extension
- Basic text highlighting
- 5 color options (Yellow, Cyan, Lime, Magenta, Dark)
- Hover toolbar with Copy, Change Color, Delete
- Context menu integration
- Keyboard shortcut for highlighting (Alt+H)
- Highlighter cursor mode
- Local storage of highlights
- Popup UI for settings
- Analytics tracking

---

## Future Roadmap

### [2.1.0] - Planned
- [ ] Highlight collections/folders
- [ ] Shared highlights with team members
- [ ] Browser extension for Firefox
- [ ] Safari extension
- [ ] Mobile app companion

### [2.2.0] - Planned
- [ ] AI-powered highlight suggestions
- [ ] Automatic tagging based on content
- [ ] Export to PDF with highlights
- [ ] Integration with note-taking apps (Evernote, OneNote)
- [ ] Voice notes for highlights

### [3.0.0] - Vision
- [ ] Real-time collaboration
- [ ] Public highlight sharing platform
- [ ] Browser reading mode with highlights
- [ ] Cross-browser sync
- [ ] API for developers

---

## Version History

- **v2.0.0** (2026-02-07): Major upgrade with Side Panel, Tags, Notes, Export, and GitHub Sync
- **v1.2.2** (2024-05-21): Original Web Highlighter extension

---

**Note**: This extension is built upon the excellent work of the original Web Highlighter extension, enhanced with professional-grade features for power users and teams.
