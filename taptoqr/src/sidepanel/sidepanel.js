import { getSettings, getHistory, getFavorites, deleteHistoryItem, clearHistory, toggleFavorite } from '../utils/storage.js';
import { generateQRCode, downloadQRCode, copyQRToClipboard, getCurrentTabInfo } from '../utils/qrcode.js';
import { addToHistory } from '../utils/storage.js';

// DOM elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Generate tab
const customText = document.getElementById('customText');
const generateBtn = document.getElementById('generateBtn');
const qrPreview = document.getElementById('qrPreview');
const qrImage = document.getElementById('qrImage');
const copyQRBtn = document.getElementById('copyQRBtn');
const downloadQRBtn = document.getElementById('downloadQRBtn');
const favoriteQRBtn = document.getElementById('favoriteQRBtn');

// History tab
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Favorites tab
const favoritesList = document.getElementById('favoritesTab').querySelector('.favorites-list');

let currentQRData = null;
let currentTextData = null;
const PENDING_KEYS = {
  TEXT: 'pendingQRText',
  TARGET_TAB: 'pendingSidePanelTab',
  ACTION: 'pendingSidePanelAction'
};

/**
 * Initialize side panel
 */
async function init() {
  // Load current tab URL
  const tabInfo = await getCurrentTabInfo();
  if (customText && tabInfo.url) {
    customText.value = tabInfo.url;
  }

  // Load history and favorites
  await loadHistory();
  await loadFavorites();
  await consumePendingActions();

  // Listen for messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'showHistory') {
      switchTab('history');
    }

    if (message.action === 'prefillText' && message.text) {
      customText.value = message.text;
      switchTab('generate');
      handleGenerate();
    }
  });

  // Handle pending data arriving right after panel opens.
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (changes[PENDING_KEYS.TEXT] || changes[PENDING_KEYS.TARGET_TAB] || changes[PENDING_KEYS.ACTION]) {
      consumePendingActions();
    }
  });
}

/**
 * Consume pending actions from storage (set by background/popup).
 */
async function consumePendingActions() {
  try {
    const result = await chrome.storage.local.get([
      PENDING_KEYS.TEXT,
      PENDING_KEYS.TARGET_TAB,
      PENDING_KEYS.ACTION
    ]);

    const pendingText = result[PENDING_KEYS.TEXT];
    const pendingTargetTab = result[PENDING_KEYS.TARGET_TAB];
    const pendingAction = result[PENDING_KEYS.ACTION];

    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isCurrentTarget = !pendingTargetTab || pendingTargetTab === currentTab?.id;

    if (isCurrentTarget && pendingAction === 'generate' && pendingText && customText) {
      customText.value = pendingText;
      switchTab('generate');
      await handleGenerate();
    }

    if (isCurrentTarget && pendingAction === 'history') {
      switchTab('history');
    }

    if (isCurrentTarget && (pendingText || pendingTargetTab || pendingAction)) {
      await chrome.storage.local.remove([PENDING_KEYS.TEXT, PENDING_KEYS.TARGET_TAB, PENDING_KEYS.ACTION]);
    }
  } catch (error) {
    console.error('Failed to consume pending side panel actions:', error);
  }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Update buttons
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update content
  tabContents.forEach(content => {
    if (content.id === tabName + 'Tab') {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Refresh data when switching tabs
  if (tabName === 'history') {
    loadHistory();
  } else if (tabName === 'favorites') {
    loadFavorites();
  }
}

/**
 * Generate QR code
 */
async function handleGenerate() {
  const text = customText.value.trim();
  
  if (!text) {
    showToast('Please enter text or URL', 'error');
    return;
  }

  try {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    const settings = await getSettings();
    
    currentQRData = await generateQRCode(text, settings);
    currentTextData = text;

    // Display QR code
    qrImage.src = currentQRData;
    qrPreview.style.display = 'block';

    // Add to history
    await addToHistory({
      url: text,
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      settings: settings
    });

    // Refresh history
    await loadHistory();

    showToast('QR code generated successfully', 'success');
  } catch (error) {
    console.error('Error generating QR code:', error);
    showToast('Failed to generate QR code', 'error');
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
 * Copy current QR to clipboard
 */
async function handleCopyQR() {
  try {
    if (!currentQRData) return;

    await copyQRToClipboard(currentQRData);
    showToast('Copied to clipboard', 'success');
  } catch (error) {
    console.error('Error copying:', error);
    showToast('Failed to copy', 'error');
  }
}

/**
 * Download current QR
 */
async function handleDownloadQR() {
  try {
    if (!currentQRData) return;

    const filename = `qrcode_${Date.now()}.png`;
    await downloadQRCode(currentQRData, filename);
    showToast('QR code downloaded', 'success');
  } catch (error) {
    console.error('Error downloading:', error);
    showToast('Failed to download', 'error');
  }
}

/**
 * Toggle favorite for current QR
 */
async function handleFavoriteQR() {
  try {
    if (!currentTextData) return;

    const item = {
      id: Date.now(),
      url: currentTextData,
      title: currentTextData.substring(0, 50) + (currentTextData.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      qrData: currentQRData
    };

    const added = await toggleFavorite(item);
    
    if (added) {
      showToast('Added to favorites', 'success');
      favoriteQRBtn.classList.add('active');
    } else {
      showToast('Removed from favorites', 'success');
      favoriteQRBtn.classList.remove('active');
    }

    await loadFavorites();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showToast('Failed to update favorites', 'error');
  }
}

/**
 * Load and display history
 */
async function loadHistory() {
  try {
    const history = await getHistory();

    if (!history || history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          <h3>No History Yet</h3>
          <p>Generated QR codes will appear here</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map(item => createHistoryItemHTML(item)).join('');

    // Add event listeners
    document.querySelectorAll('.history-item').forEach((el, index) => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.item-actions')) {
          regenerateFromHistory(history[index]);
        }
      });
    });

    document.querySelectorAll('.delete-item').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(history[index].id);
      });
    });
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

/**
 * Create history item HTML
 */
function createHistoryItemHTML(item) {
  const date = new Date(item.timestamp).toLocaleString();
  
  return `
    <div class="history-item">
      <div class="item-header">
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <div class="item-actions">
          <button class="btn-icon delete-item" title="Delete">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="item-url">${escapeHtml(item.url)}</p>
      <div class="item-meta">
        <span>${date}</span>
      </div>
    </div>
  `;
}

/**
 * Regenerate QR from history item
 */
async function regenerateFromHistory(item) {
  customText.value = item.url;
  switchTab('generate');
  await handleGenerate();
}

/**
 * Delete history item
 */
async function deleteItem(id) {
  if (!confirm('Delete this item from history?')) return;

  try {
    await deleteHistoryItem(id);
    await loadHistory();
    showToast('Item deleted', 'success');
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Failed to delete item', 'error');
  }
}

/**
 * Clear all history
 */
async function handleClearHistory() {
  if (!confirm('Clear all history? This cannot be undone.')) return;

  try {
    await clearHistory();
    await loadHistory();
    showToast('History cleared', 'success');
  } catch (error) {
    console.error('Error clearing history:', error);
    showToast('Failed to clear history', 'error');
  }
}

/**
 * Load and display favorites
 */
async function loadFavorites() {
  try {
    const favorites = await getFavorites();

    if (!favorites || favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <h3>No Favorites Yet</h3>
          <p>Star QR codes to save them here</p>
        </div>
      `;
      return;
    }

    favoritesList.innerHTML = favorites.map(item => createFavoriteItemHTML(item)).join('');

    // Add event listeners
    document.querySelectorAll('.favorite-item').forEach((el, index) => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.item-actions')) {
          regenerateFromFavorite(favorites[index]);
        }
      });
    });

    document.querySelectorAll('.unfavorite-item').forEach((btn, index) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleFavorite(favorites[index]);
        await loadFavorites();
        showToast('Removed from favorites', 'success');
      });
    });
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
}

/**
 * Create favorite item HTML
 */
function createFavoriteItemHTML(item) {
  const date = new Date(item.timestamp).toLocaleString();
  
  return `
    <div class="favorite-item">
      <div class="item-header">
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <div class="item-actions">
          <button class="btn-icon unfavorite-item" title="Remove from favorites">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="item-url">${escapeHtml(item.url)}</p>
      <div class="item-meta">
        <span>${date}</span>
      </div>
    </div>
  `;
}

/**
 * Regenerate QR from favorite
 */
async function regenerateFromFavorite(item) {
  customText.value = item.url;
  switchTab('generate');
  await handleGenerate();
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

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

generateBtn?.addEventListener('click', handleGenerate);
copyQRBtn?.addEventListener('click', handleCopyQR);
downloadQRBtn?.addEventListener('click', handleDownloadQR);
favoriteQRBtn?.addEventListener('click', handleFavoriteQR);
clearHistoryBtn?.addEventListener('click', handleClearHistory);

customText?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
});

// Initialize
init();
