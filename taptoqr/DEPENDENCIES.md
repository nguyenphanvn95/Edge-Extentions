# Dependencies

## QRCode.js Library

This extension uses the QRCode.js library for generating QR codes. The library is loaded via CDN in the modules.

### Import Method

```javascript
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';
```

### Why CDN?

- **No Build Step**: Extension works directly without compilation
- **Always Updated**: Get the latest stable version
- **Smaller Package**: No need to bundle large libraries
- **Fast Loading**: CDN caching benefits

### Alternative: Local Installation

If you prefer to include the library locally:

1. Download QRCode.js from npm:
```bash
npm install qrcode
```

2. Copy the browser build to your extension:
```bash
cp node_modules/qrcode/build/qrcode.min.js src/libs/
```

3. Update imports in `src/utils/qrcode.js`:
```javascript
// Change from:
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';

// To:
import QRCode from '../libs/qrcode.min.js';
```

4. Update manifest.json to include the library as a web accessible resource if needed.

## No Other Dependencies

This extension is built with vanilla JavaScript and uses only Chrome's built-in APIs:
- Chrome Storage API
- Chrome Tabs API
- Chrome Side Panel API
- Chrome Context Menus API
- Native Clipboard API
- Native File Download

## Browser Compatibility

- Chrome 114+ (for Side Panel API)
- Edge 114+ (Chromium-based)
- Opera 100+ (Chromium-based)

For older browsers, the side panel feature will not work, but the main popup functionality will still function.
