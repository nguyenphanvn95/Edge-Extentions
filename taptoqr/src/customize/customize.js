import { generateQRCode, downloadQRCode, copyQRToClipboard, getCurrentTabInfo } from '../utils/qrcode.js';
import { addToHistory } from '../utils/storage.js';

// DOM Elements
const qrText = document.getElementById('qrText');
const qrSize = document.getElementById('qrSize');
const qrSizeInput = document.getElementById('qrSizeInput');
const fgColor = document.getElementById('fgColor');
const fgColorText = document.getElementById('fgColorText');
const bgColor = document.getElementById('bgColor');
const bgColorText = document.getElementById('bgColorText');
const errorLevel = document.getElementById('errorLevel');
const margin = document.getElementById('margin');
const marginValue = document.getElementById('marginValue');
const includeLogo = document.getElementById('includeLogo');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qrPreview = document.getElementById('qrPreview');
const qrInfo = document.getElementById('qrInfo');
const infoSize = document.getElementById('infoSize');
const infoLength = document.getElementById('infoLength');
const infoError = document.getElementById('infoError');

let currentQRData = null;
let generateTimeout = null;

/**
 * Initialize customize page
 */
async function init() {
  // Load current tab URL
  const tabInfo = await getCurrentTabInfo();
  if (qrText && tabInfo.url) {
    qrText.value = tabInfo.url;
  }

  // Setup color presets
  setupColorPresets();

  // Auto-generate on load if there's text
  if (qrText.value.trim()) {
    await handleGenerate();
  }
}

/**
 * Setup color preset buttons
 */
function setupColorPresets() {
  const fgPresets = document.querySelectorAll('.color-preset-group:first-child .color-preset');
  const bgPresets = document.querySelectorAll('.color-preset-group:last-child .color-preset');

  fgPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      fgColor.value = color;
      fgColorText.value = color;
      scheduleGenerate();
      updatePresetActive(fgPresets, preset);
    });
  });

  bgPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      bgColor.value = color;
      bgColorText.value = color;
      scheduleGenerate();
      updatePresetActive(bgPresets, preset);
    });
  });
}

/**
 * Update active preset button
 */
function updatePresetActive(presets, activePreset) {
  presets.forEach(p => p.classList.remove('active'));
  activePreset.classList.add('active');
}

/**
 * Schedule QR generation with debounce
 */
function scheduleGenerate() {
  if (generateTimeout) {
    clearTimeout(generateTimeout);
  }

  generateTimeout = setTimeout(() => {
    handleGenerate();
  }, 500);
}

/**
 * Generate QR code
 */
async function handleGenerate() {
  const text = qrText.value.trim();

  if (!text) {
    showEmptyState();
    return;
  }

  try {
    // Show loading
    qrPreview.innerHTML = '<div class="spinner"></div>';
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    // Get settings
    const settings = {
      size: parseInt(qrSize.value),
      errorCorrectionLevel: errorLevel.value,
      foregroundColor: fgColor.value,
      backgroundColor: bgColor.value,
      margin: parseInt(margin.value),
      displayLogo: includeLogo.checked
    };

    // Generate QR code
    currentQRData = await generateQRCode(text, settings);

    // Display QR code
    qrPreview.innerHTML = `<img src="${currentQRData}" alt="Generated QR Code">`;

    // Update info
    updateInfo(text, settings);

    // Enable buttons
    copyBtn.disabled = false;
    downloadBtn.disabled = false;

    // Add to history
    await addToHistory({
      url: text,
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      settings: settings
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    showError('Failed to generate QR code. Please check your input.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm15 0h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/>
      </svg>
      Generate QR Code
    `;
  }
}

/**
 * Show empty state
 */
function showEmptyState() {
  qrPreview.innerHTML = `
    <div class="empty-preview">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm15 0h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/>
      </svg>
      <p>Enter text and click Generate to create QR code</p>
    </div>
  `;
  qrInfo.style.display = 'none';
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
  currentQRData = null;
}

/**
 * Show error message
 */
function showError(message) {
  qrPreview.innerHTML = `
    <div class="empty-preview">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p style="color: var(--danger-color);">${message}</p>
    </div>
  `;
  qrInfo.style.display = 'none';
}

/**
 * Update info display
 */
function updateInfo(text, settings) {
  qrInfo.style.display = 'block';
  infoSize.textContent = `${settings.size} × ${settings.size} px`;
  infoLength.textContent = `${text.length} characters`;
  
  const errorLevels = {
    'L': 'Low (7%)',
    'M': 'Medium (15%)',
    'Q': 'Quartile (25%)',
    'H': 'High (30%)'
  };
  infoError.textContent = errorLevels[settings.errorCorrectionLevel];
}

/**
 * Copy QR to clipboard
 */
async function handleCopy() {
  if (!currentQRData) return;

  try {
    copyBtn.disabled = true;
    const originalHTML = copyBtn.innerHTML;
    
    copyBtn.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      Copied!
    `;

    await copyQRToClipboard(currentQRData);
    showToast('Copied to clipboard', 'success');

    setTimeout(() => {
      copyBtn.disabled = false;
      copyBtn.innerHTML = originalHTML;
    }, 2000);
  } catch (error) {
    console.error('Error copying:', error);
    showToast('Failed to copy', 'error');
    copyBtn.disabled = false;
  }
}

/**
 * Download QR code
 */
async function handleDownload() {
  if (!currentQRData) return;

  try {
    const text = qrText.value.trim();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `qrcode_${timestamp}.png`;

    await downloadQRCode(currentQRData, filename);
    showToast('QR code downloaded', 'success');
  } catch (error) {
    console.error('Error downloading:', error);
    showToast('Failed to download', 'error');
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event Listeners

// Text input
qrText?.addEventListener('input', () => {
  if (qrText.value.trim()) {
    scheduleGenerate();
  } else {
    showEmptyState();
  }
});

// Size slider and input
qrSize?.addEventListener('input', (e) => {
  qrSizeInput.value = e.target.value;
  scheduleGenerate();
});

qrSizeInput?.addEventListener('input', (e) => {
  const value = Math.max(200, Math.min(1000, parseInt(e.target.value) || 400));
  qrSizeInput.value = value;
  qrSize.value = value;
  scheduleGenerate();
});

// Colors
fgColor?.addEventListener('input', (e) => {
  fgColorText.value = e.target.value;
  scheduleGenerate();
});

bgColor?.addEventListener('input', (e) => {
  bgColorText.value = e.target.value;
  scheduleGenerate();
});

// Error level
errorLevel?.addEventListener('change', scheduleGenerate);

// Margin
margin?.addEventListener('input', (e) => {
  marginValue.textContent = e.target.value;
  scheduleGenerate();
});

// Logo
includeLogo?.addEventListener('change', scheduleGenerate);

// Buttons
generateBtn?.addEventListener('click', handleGenerate);
copyBtn?.addEventListener('click', handleCopy);
downloadBtn?.addEventListener('click', handleDownload);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
  
  // Ctrl/Cmd + S to download
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (!downloadBtn.disabled) {
      handleDownload();
    }
  }
  
  // Ctrl/Cmd + C when not in input to copy
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement !== qrText) {
    if (!copyBtn.disabled && currentQRData) {
      e.preventDefault();
      handleCopy();
    }
  }
});

// Initialize
init();
