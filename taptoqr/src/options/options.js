import { getSettings, saveSettings, resetSettings, DEFAULT_SETTINGS } from '../utils/storage.js';
import { generateQRCode } from '../utils/qrcode.js';

// DOM elements
const qrCodeSize = document.getElementById('qrCodeSize');
const qrCodeSizeValue = document.getElementById('qrCodeSizeValue');
const qrCodeDownloadSize = document.getElementById('qrCodeDownloadSize');
const qrCodeDownloadSizeValue = document.getElementById('qrCodeDownloadSizeValue');
const displayLogo = document.getElementById('displayLogo');
const errorCorrectionLevel = document.getElementById('errorCorrectionLevel');
const foregroundColor = document.getElementById('foregroundColor');
const foregroundColorText = document.getElementById('foregroundColorText');
const backgroundColor = document.getElementById('backgroundColor');
const backgroundColorText = document.getElementById('backgroundColorText');
const previewQR = document.getElementById('previewQR');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

let previewTimeout = null;

/**
 * Initialize settings page
 */
async function init() {
  try {
    const settings = await getSettings();
    loadSettingsToForm(settings);
    await updatePreview();
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

/**
 * Load settings into form
 */
function loadSettingsToForm(settings) {
  qrCodeSize.value = settings.qrCodeSize;
  qrCodeSizeValue.textContent = settings.qrCodeSize;
  
  qrCodeDownloadSize.value = settings.qrCodeDownloadSize;
  qrCodeDownloadSizeValue.textContent = settings.qrCodeDownloadSize;
  
  displayLogo.checked = settings.displayLogo;
  errorCorrectionLevel.value = settings.errorCorrectionLevel;
  
  foregroundColor.value = settings.foregroundColor;
  foregroundColorText.value = settings.foregroundColor;
  
  backgroundColor.value = settings.backgroundColor;
  backgroundColorText.value = settings.backgroundColor;
}

/**
 * Get current form settings
 */
function getFormSettings() {
  return {
    qrCodeSize: parseInt(qrCodeSize.value),
    qrCodeDownloadSize: parseInt(qrCodeDownloadSize.value),
    displayLogo: displayLogo.checked,
    errorCorrectionLevel: errorCorrectionLevel.value,
    foregroundColor: foregroundColor.value,
    backgroundColor: backgroundColor.value
  };
}

/**
 * Update preview with debounce
 */
function schedulePreviewUpdate() {
  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }
  
  previewTimeout = setTimeout(async () => {
    await updatePreview();
  }, 300);
}

/**
 * Update QR code preview
 */
async function updatePreview() {
  try {
    previewQR.innerHTML = '<div class="spinner"></div>';
    
    const settings = getFormSettings();
    const sampleText = 'https://github.com/taptoqr';
    
    const qrData = await generateQRCode(sampleText, {
      size: 250,
      errorCorrectionLevel: settings.errorCorrectionLevel,
      foregroundColor: settings.foregroundColor,
      backgroundColor: settings.backgroundColor,
      displayLogo: settings.displayLogo
    });
    
    previewQR.innerHTML = `<img src="${qrData}" alt="QR Preview">`;
  } catch (error) {
    console.error('Error updating preview:', error);
    previewQR.innerHTML = '<p class="text-muted">Preview failed</p>';
  }
}

/**
 * Save settings
 */
async function handleSave() {
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    const settings = getFormSettings();
    await saveSettings(settings);
    
    showToast('Settings saved successfully', 'success');
    
    saveBtn.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      Saved!
    `;
    
    setTimeout(() => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        Save Settings
      `;
    }, 2000);
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Failed to save settings', 'error');
    saveBtn.disabled = false;
  }
}

/**
 * Reset to defaults
 */
async function handleReset() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }
  
  try {
    await resetSettings();
    loadSettingsToForm(DEFAULT_SETTINGS);
    await updatePreview();
    showToast('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showToast('Failed to reset settings', 'error');
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

// Event listeners
qrCodeSize?.addEventListener('input', (e) => {
  qrCodeSizeValue.textContent = e.target.value;
  schedulePreviewUpdate();
});

qrCodeDownloadSize?.addEventListener('input', (e) => {
  qrCodeDownloadSizeValue.textContent = e.target.value;
});

displayLogo?.addEventListener('change', schedulePreviewUpdate);

errorCorrectionLevel?.addEventListener('change', schedulePreviewUpdate);

foregroundColor?.addEventListener('input', (e) => {
  foregroundColorText.value = e.target.value;
  schedulePreviewUpdate();
});

backgroundColor?.addEventListener('input', (e) => {
  backgroundColorText.value = e.target.value;
  schedulePreviewUpdate();
});

saveBtn?.addEventListener('click', handleSave);
resetBtn?.addEventListener('click', handleReset);

// Initialize
init();
