/**
 * Storage utility for managing QR code data and settings
 */

// Default settings
export const DEFAULT_SETTINGS = {
  qrCodeSize: 300,
  qrCodeDownloadSize: 400,
  displayLogo: false,
  errorCorrectionLevel: 'M',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  cornerStyle: 'square',
  dotStyle: 'square'
};

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'qr_settings',
  HISTORY: 'qr_history',
  FAVORITES: 'qr_favorites'
};

/**
 * Get settings from storage
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: settings
    });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Reset settings to default
 */
export async function resetSettings() {
  return await saveSettings(DEFAULT_SETTINGS);
}

/**
 * Get QR history
 */
export async function getHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    return result[STORAGE_KEYS.HISTORY] || [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Add item to history
 */
export async function addToHistory(item) {
  try {
    const history = await getHistory();
    const newItem = {
      id: Date.now(),
      url: item.url,
      title: item.title || 'Untitled',
      timestamp: new Date().toISOString(),
      settings: item.settings
    };
    
    // Add to beginning, limit to 100 items
    const updatedHistory = [newItem, ...history].slice(0, 100);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: updatedHistory
    });
    
    return newItem;
  } catch (error) {
    console.error('Error adding to history:', error);
    return null;
  }
}

/**
 * Delete history item
 */
export async function deleteHistoryItem(id) {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: updatedHistory
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
}

/**
 * Clear all history
 */
export async function clearHistory() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: []
    });
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

/**
 * Get favorites
 */
export async function getFavorites() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.FAVORITES);
    return result[STORAGE_KEYS.FAVORITES] || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(item) {
  try {
    const favorites = await getFavorites();
    const existingIndex = favorites.findIndex(fav => fav.id === item.id);
    
    let updatedFavorites;
    if (existingIndex >= 0) {
      // Remove from favorites
      updatedFavorites = favorites.filter((_, index) => index !== existingIndex);
    } else {
      // Add to favorites
      updatedFavorites = [item, ...favorites];
    }
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.FAVORITES]: updatedFavorites
    });
    
    return existingIndex < 0; // Return true if added, false if removed
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
}
