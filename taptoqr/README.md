# TapToQR Enhanced

A modern, feature-rich Chrome extension for generating QR codes with history tracking, favorites, and extensive customization options.

## ✨ Features

### Core Features
- **Instant QR Generation**: Generate QR codes for any webpage with a single click
- **Side Panel Support**: Full-featured side panel for better workflow
- **History Tracking**: Automatically saves all generated QR codes
- **Favorites System**: Star and save your frequently used QR codes
- **Custom QR Codes**: Generate QR codes from any text or URL

### Customization Options
- **Size Control**: Adjust preview and download sizes
- **Color Customization**: Choose custom foreground and background colors
- **Error Correction**: Select from 4 levels (Low, Medium, Quartile, High)
- **Logo Support**: Optional logo in QR code center
- **Live Preview**: See changes in real-time

### User Experience
- Clean, modern interface
- Fast and responsive
- Keyboard shortcuts support
- Context menu integration
- Toast notifications
- Mobile-friendly design

## 🚀 Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `taptoqr-enhanced` folder

### Building (if needed)

This extension uses vanilla JavaScript with ES modules, so no build step is required. However, if you want to package it:

```bash
# Zip the extension
zip -r taptoqr-enhanced.zip taptoqr-enhanced/ -x "*.git*" "*.DS_Store"
```

## 📖 Usage

### Quick Start

1. **Click the extension icon** to generate a QR code for the current page
2. **Copy or download** the QR code using the action buttons
3. **Customize** by clicking the settings icon

### Side Panel

1. **Click the panel icon** in the popup to open the side panel
2. **Generate tab**: Create QR codes from custom text
3. **History tab**: View and regenerate past QR codes
4. **Favorites tab**: Access your starred QR codes

### Settings

Access settings by:
- Clicking the settings icon in the popup
- Right-clicking the extension icon → Options
- Navigating to `chrome://extensions/` and clicking "Extension options"

## 🛠️ Development

### Project Structure

```
taptoqr-enhanced/
├── manifest.json           # Extension manifest
├── src/
│   ├── popup/             # Popup interface
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── sidepanel/         # Side panel interface
│   │   ├── sidepanel.html
│   │   ├── sidepanel.css
│   │   └── sidepanel.js
│   ├── options/           # Settings page
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── background/        # Background service worker
│   │   └── background.js
│   ├── utils/             # Shared utilities
│   │   ├── storage.js     # Storage management
│   │   └── qrcode.js      # QR code generation
│   └── styles/            # Shared styles
│       └── common.css
└── public/
    └── icons/             # Extension icons
```

### Key Technologies

- **Manifest V3**: Latest Chrome extension API
- **ES Modules**: Modern JavaScript modules
- **QRCode.js**: QR code generation library
- **Chrome Storage API**: Data persistence
- **Chrome Side Panel API**: Modern UI pattern

### Code Quality Features

- **Clean Architecture**: Separation of concerns
- **Modular Design**: Reusable components
- **Type Safety**: JSDoc comments for better IDE support
- **Error Handling**: Comprehensive try-catch blocks
- **User Feedback**: Toast notifications for all actions

## 🎨 Customization Guide

### QR Code Options

**Error Correction Levels**:
- **L (Low)**: 7% - Best for simple URLs
- **M (Medium)**: 15% - Recommended default
- **Q (Quartile)**: 25% - Good for complex data
- **H (High)**: 30% - Maximum damage resistance

**Size Guidelines**:
- **Preview**: 200-500px (optimal: 300px)
- **Download**: 200-1000px (optimal: 400-600px)
- Larger sizes = better scanning but bigger files

**Color Tips**:
- Maintain high contrast for best scanning
- Dark foreground + light background works best
- Test QR codes after color changes

## 🔧 API Reference

### Storage API

```javascript
import { 
  getSettings, 
  saveSettings, 
  getHistory, 
  addToHistory,
  getFavorites,
  toggleFavorite 
} from './utils/storage.js';

// Get current settings
const settings = await getSettings();

// Save settings
await saveSettings(settings);

// Add to history
await addToHistory({
  url: 'https://example.com',
  title: 'Example',
  settings: settings
});
```

### QR Code API

```javascript
import { 
  generateQRCode, 
  downloadQRCode, 
  copyQRToClipboard 
} from './utils/qrcode.js';

// Generate QR code
const dataUrl = await generateQRCode('https://example.com', {
  size: 300,
  errorCorrectionLevel: 'M',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff'
});

// Download QR code
await downloadQRCode(dataUrl, 'qrcode.png');

// Copy to clipboard
await copyQRToClipboard(dataUrl);
```

## 🐛 Troubleshooting

### Common Issues

**QR code not generating**:
- Check console for errors
- Ensure valid URL format
- Try refreshing the page

**Side panel not opening**:
- Chrome version must be 114+
- Check extension permissions
- Try reloading extension

**Settings not saving**:
- Check chrome.storage quota
- Clear extension data and retry

**History not showing**:
- Check local storage permissions
- Items limited to 100 (configurable)

## 📝 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Credits

- Original TapToQR extension by Moritz Reis
- QRCode.js library
- Icons from Material Design

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed reproduction steps

## 🔄 Changelog

### Version 2.0.0
- Complete rewrite with modern architecture
- Added side panel support
- Implemented history tracking
- Added favorites system
- Enhanced customization options
- Improved error handling
- Better mobile support
- Toast notifications
- Context menu integration

---

**Enjoy generating QR codes! ⚡**
