# Changelog

All notable changes to TapToQR Enhanced will be documented in this file.

## [2.0.0] - 2024-02-10

### ✨ Added
- **Side Panel Support**: Full-featured side panel with tabs for Generate, History, and Favorites
- **History Tracking**: Automatically save all generated QR codes with timestamps
- **Favorites System**: Star and save frequently used QR codes
- **Custom QR Generator**: Advanced customization page with live preview
- **Color Customization**: Choose custom foreground and background colors with presets
- **Size Control**: Separate controls for preview and download sizes
- **Error Correction Levels**: Choose from Low, Medium, Quartile, or High
- **Margin Control**: Adjust QR code margins
- **Context Menu**: Right-click to generate QR from selected text or links
- **Keyboard Shortcuts**: Ctrl/Cmd+Enter to generate, Ctrl/Cmd+S to download
- **Live Preview**: Real-time preview as you customize
- **Toast Notifications**: Visual feedback for all actions
- **Info Display**: Show QR code details (size, content length, error correction)

### 🎨 Improved
- **Modern UI**: Clean, contemporary design with better UX
- **Better Organization**: Modular code structure for easier maintenance
- **Error Handling**: Comprehensive error handling and user feedback
- **Accessibility**: Better keyboard navigation and screen reader support
- **Mobile Responsive**: Works well on different screen sizes
- **Performance**: Optimized QR generation with debouncing

### 🛠️ Technical
- **Manifest V3**: Updated to latest Chrome Extension standard
- **ES Modules**: Modern JavaScript module system
- **Clean Architecture**: Separated concerns (utils, pages, styles)
- **Type Documentation**: JSDoc comments for better IDE support
- **Storage API**: Smart use of sync vs local storage
- **Side Panel API**: Leveraging Chrome's newest UI capabilities

### 📚 Documentation
- Comprehensive README with usage guide
- Development guide for contributors
- Dependencies documentation
- Code comments and JSDoc

## [1.3.3] - Original Version

### Features from Original Extension
- Basic QR code generation for current page
- Copy to clipboard
- Download as PNG
- Logo display option
- Size adjustment
- Settings page

---

## Migration from 1.x to 2.0

### What's New
1. **Side Panel** - New persistent UI for better workflow
2. **History** - Never lose a generated QR code
3. **Favorites** - Quick access to frequently used codes
4. **Advanced Customization** - More control over appearance
5. **Better UX** - Modern interface with visual feedback

### Breaking Changes
None - Settings from 1.x will be preserved and upgraded automatically.

### Upgrade Notes
- First install will open options page to review settings
- History starts fresh (old codes not migrated)
- All existing settings are preserved and enhanced
