import { getSettings } from '../utils/storage.js';
import { generateQRCode, getCurrentTabInfo, downloadQRCode, copyQRToClipboard } from '../utils/qrcode.js';
import { addToHistory } from '../utils/storage.js';

// DOM elements
const qrDisplay = document.getElementById('qrDisplay');
const currentUrlEl = document.getElementById('currentUrl');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const customBtn = document.getElementById('customBtn');
const historyBtn = document.getElementById('historyBtn');
const settingsBtn = document.getElementById('settingsBtn');
const openSidePanelBtn = document.getElementById('openSidePanel');

let currentQRData = null;
let currentTabInfo = null;

/**
 * Initialize popup
 */
async function init() {
  try {
    // Get current tab info
    currentTabInfo = await getCurrentTabInfo();
    
    // Display URL
    if (currentUrlEl && currentTabInfo.url) {
      currentUrlEl.textContent = currentTabInfo.url;
    }

    // Get settings
    const settings = await getSettings();

    // Generate QR code
    await generateAndDisplayQR(currentTabInfo.url, settings);

    // Add to history
    await addToHistory({
      url: currentTabInfo.url,
      title: currentTabInfo.title,
      settings: settings
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to generate QR code');
  }
}

/**
 * Generate and display QR code
 */
async function generateAndDisplayQR(text, settings) {
  try {
    // Show loading
    qrDisplay.innerHTML = '<div class="spinner"></div>';

    // Generate QR code
    currentQRData = await generateQRCode(text, {
      size: settings.qrCodeSize,
      errorCorrectionLevel: settings.errorCorrectionLevel,
      foregroundColor: settings.foregroundColor,
      backgroundColor: settings.backgroundColor,
      displayLogo: settings.displayLogo
    });

    // Display QR code
    qrDisplay.innerHTML = `<img src="${currentQRData}" alt="QR Code">`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    qrDisplay.innerHTML = '<p class="text-muted">Failed to generate QR code</p>';
    throw error;
  }
}

/**
 * Copy QR code to clipboard
 */
async function handleCopy() {
  try {
    if (!currentQRData) return;

    copyBtn.disabled = true;
    copyBtn.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      Copied!
    `;

    await copyQRToClipboard(currentQRData);

    setTimeout(() => {
      copyBtn.disabled = false;
      copyBtn.innerHTML = `
        <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        Copy
      `;
    }, 2000);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    showError('Failed to copy to clipboard');
    copyBtn.disabled = false;
  }
}

/**
 * Download QR code
 */
async function handleDownload() {
  try {
    if (!currentQRData) return;

    const settings = await getSettings();
    const filename = `qrcode_${Date.now()}.png`;

    // Generate high-res version for download
    const downloadData = await generateQRCode(currentTabInfo.url, {
      size: settings.qrCodeDownloadSize,
      errorCorrectionLevel: settings.errorCorrectionLevel,
      foregroundColor: settings.foregroundColor,
      backgroundColor: settings.backgroundColor,
      displayLogo: settings.displayLogo
    });

    await downloadQRCode(downloadData, filename);
    showSuccess('QR code downloaded');
  } catch (error) {
    console.error('Error downloading QR code:', error);
    showError('Failed to download QR code');
  }
}

/**
 * Open customization page
 */
function handleCustomize() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('src/customize/customize.html')
  });
}

/**
 * Open side panel
 */
async function handleOpenSidePanel() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  } catch (error) {
    console.error('Error opening side panel:', error);
    showError('Failed to open side panel');
  }
}

/**
 * Open history in side panel
 */
async function handleHistory() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.storage.local.set({
      pendingSidePanelTab: tab.id,
      pendingSidePanelAction: 'history'
    });
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  } catch (error) {
    console.error('Error opening history:', error);
  }
}

/**
 * Open settings
 */
function handleSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Show success toast
 */
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Show error toast
 */
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast error';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event listeners
copyBtn?.addEventListener('click', handleCopy);
downloadBtn?.addEventListener('click', handleDownload);
customBtn?.addEventListener('click', handleCustomize);
historyBtn?.addEventListener('click', handleHistory);
settingsBtn?.addEventListener('click', handleSettings);
openSidePanelBtn?.addEventListener('click', handleOpenSidePanel);

// Initialize
init();
