# Development Guide

## Getting Started

### Prerequisites

- Chrome Browser 114+ (for Side Panel API)
- Basic knowledge of JavaScript, HTML, CSS
- Familiarity with Chrome Extension APIs

### Setup

1. Clone or download the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension is now ready for development

## Architecture

### Project Structure

```
src/
├── popup/              # Extension popup (quick QR generation)
├── sidepanel/          # Side panel (history, favorites, custom)
├── options/            # Settings page
├── customize/          # Advanced QR customization page
├── background/         # Service worker
├── utils/              # Shared utilities
│   ├── storage.js      # Storage operations
│   └── qrcode.js       # QR code generation
└── styles/             # Shared CSS
```

### Key Concepts

**Popup**: Quick access to generate QR for current page
**Side Panel**: Persistent UI for extended features
**Options**: Settings and preferences
**Customize**: Advanced QR creation tool

## Code Style

### JavaScript

- Use ES6+ features (arrow functions, async/await, destructuring)
- Use modules with import/export
- Prefer `const` over `let`, avoid `var`
- Use JSDoc comments for functions
- Handle errors with try-catch

Example:
```javascript
/**
 * Generate QR code from text
 * @param {string} text - Text to encode
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Data URL of QR code
 */
export async function generateQRCode(text, options = {}) {
  try {
    // Implementation
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### CSS

- Use CSS custom properties for theming
- Follow BEM-like naming for clarity
- Mobile-first responsive design
- Use flexbox/grid for layouts

### HTML

- Semantic HTML5 elements
- Accessibility attributes (aria-labels, roles)
- Clear ID and class names

## Chrome APIs Used

### Storage API

```javascript
// Sync storage (settings, synced across devices)
await chrome.storage.sync.set({ key: value });
const data = await chrome.storage.sync.get('key');

// Local storage (history, device-specific)
await chrome.storage.local.set({ key: value });
const data = await chrome.storage.local.get('key');
```

### Tabs API

```javascript
// Get current tab
const [tab] = await chrome.tabs.query({ 
  active: true, 
  currentWindow: true 
});
```

### Side Panel API

```javascript
// Open side panel
await chrome.sidePanel.open({ tabId: tab.id });

// Set behavior
await chrome.sidePanel.setPanelBehavior({ 
  openPanelOnActionClick: true 
});
```

### Runtime API

```javascript
// Send messages
chrome.runtime.sendMessage({ action: 'doSomething' });

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message
  sendResponse({ success: true });
  return true; // Keep channel open for async
});
```

## Storage Schema

### Settings (chrome.storage.sync)

```javascript
{
  qrCodeSize: 300,                    // Preview size in pixels
  qrCodeDownloadSize: 400,            // Download size in pixels
  displayLogo: false,                 // Show logo in center
  errorCorrectionLevel: 'M',          // L, M, Q, H
  foregroundColor: '#000000',         // QR code color
  backgroundColor: '#ffffff',         // Background color
  cornerStyle: 'square',              // Future: corner style
  dotStyle: 'square'                  // Future: dot style
}
```

### History (chrome.storage.local)

```javascript
[
  {
    id: 1234567890123,                // Timestamp
    url: 'https://example.com',       // Encoded URL
    title: 'Example Site',            // Page title
    timestamp: '2024-01-01T12:00:00Z',// ISO timestamp
    settings: { /* QR settings */ }   // Settings used
  }
]
```

### Favorites (chrome.storage.local)

```javascript
[
  {
    id: 1234567890123,                // Timestamp
    url: 'https://example.com',       // Encoded URL
    title: 'Example Site',            // Custom title
    timestamp: '2024-01-01T12:00:00Z',// ISO timestamp
    qrData: 'data:image/png...'       // QR code data URL
  }
]
```

## Adding New Features

### Adding a new setting

1. **Update DEFAULT_SETTINGS** in `src/utils/storage.js`
```javascript
export const DEFAULT_SETTINGS = {
  // ... existing settings
  newSetting: defaultValue
};
```

2. **Add UI** in `src/options/options.html`
```html
<div class="form-group">
  <label for="newSetting">New Setting</label>
  <input type="text" id="newSetting" class="form-input">
</div>
```

3. **Wire up** in `src/options/options.js`
```javascript
const newSetting = document.getElementById('newSetting');

function loadSettingsToForm(settings) {
  // ... existing code
  newSetting.value = settings.newSetting;
}

function getFormSettings() {
  return {
    // ... existing code
    newSetting: newSetting.value
  };
}
```

### Adding a new page

1. **Create folder** in `src/` (e.g., `src/newpage/`)
2. **Create files**: `newpage.html`, `newpage.css`, `newpage.js`
3. **Update manifest.json** if needed (for background/content scripts)
4. **Add navigation** from existing pages

## Testing

### Manual Testing Checklist

- [ ] Generate QR from current page URL
- [ ] Generate QR from custom text
- [ ] Copy QR to clipboard
- [ ] Download QR as PNG
- [ ] Change colors and verify preview
- [ ] Change size and verify
- [ ] Toggle logo display
- [ ] Check history saves correctly
- [ ] Check favorites work
- [ ] Test on different URLs (http, https, special chars)
- [ ] Test side panel opens
- [ ] Test settings persist
- [ ] Test context menu items

### Browser Testing

Test on:
- Chrome (latest)
- Edge (Chromium)
- Brave (if targeting)

### Performance

- QR generation should be < 500ms
- History load should be < 200ms
- UI should remain responsive during generation

## Debugging

### Console Logs

Each module logs errors with context:
```javascript
console.error('Error in generateQRCode:', error);
```

### Chrome DevTools

- **Popup**: Right-click extension icon → "Inspect popup"
- **Side Panel**: Right-click in side panel → "Inspect"
- **Options**: Right-click in options → "Inspect"
- **Background**: chrome://extensions → "Service worker"

### Storage Inspector

View extension storage:
1. Go to chrome://extensions
2. Click "Service worker" under extension
3. Go to Application → Storage → Extension Storage

## Common Issues

### QR not generating
- Check console for errors
- Verify QRCode.js CDN is accessible
- Check text input is valid

### Settings not saving
- Check storage quota
- Verify chrome.storage permissions
- Check for sync conflicts

### Side panel not opening
- Chrome version must be 114+
- Check sidePanel permission in manifest
- Verify panel behavior is set

## Performance Optimization

### Debouncing

Use debouncing for expensive operations:
```javascript
let timeout;
function scheduleUpdate() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Do expensive work
  }, 300);
}
```

### Lazy Loading

Load heavy resources only when needed:
```javascript
// Don't load QRCode.js until actually generating
const QRCode = await import('qrcode-library');
```

### Caching

Cache frequently accessed data:
```javascript
let cachedSettings = null;
async function getSettings() {
  if (!cachedSettings) {
    cachedSettings = await chrome.storage.sync.get('settings');
  }
  return cachedSettings;
}
```

## Security Considerations

### Input Validation

Always validate user input:
```javascript
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return null;
  }
}
```

### XSS Prevention

Use textContent, not innerHTML for user data:
```javascript
// Good
element.textContent = userInput;

// Bad
element.innerHTML = userInput;
```

### CSP Compliance

Follow Content Security Policy:
- No inline scripts
- No eval()
- External resources via HTTPS only

## Deployment

### Before Release

1. **Version bump** in manifest.json
2. **Test thoroughly** on clean install
3. **Update CHANGELOG**
4. **Check all permissions** are necessary
5. **Optimize assets** (compress images)
6. **Remove console.logs** in production code

### Creating Release Package

```bash
# Zip extension
zip -r taptoqr-enhanced-v2.0.0.zip taptoqr-enhanced/ \
  -x "*.git*" "*.DS_Store" "*node_modules*"
```

### Chrome Web Store

1. Create developer account
2. Prepare store assets (screenshots, description)
3. Upload zip file
4. Submit for review

## Contributing

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with clear commits
4. Test thoroughly
5. Update documentation
6. Submit PR with description

### Code Review Checklist

- Code follows style guide
- No console errors/warnings
- Functions have JSDoc comments
- New features have tests
- UI is responsive
- Accessibility is maintained

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [QRCode.js Documentation](https://github.com/soldair/node-qrcode)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

For questions or issues:
1. Check existing issues on GitHub
2. Read this documentation
3. Create new issue with details
