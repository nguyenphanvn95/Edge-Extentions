/**
 * Background service worker for TapToQR Enhanced.
 */

const CONTEXT_MENU_IDS = {
  SELECTION: 'generateQRFromSelection',
  LINK: 'generateQRFromLink',
  PAGE: 'generateQRFromPage'
};

const PENDING_KEYS = {
  TEXT: 'pendingQRText',
  TARGET_TAB: 'pendingSidePanelTab',
  ACTION: 'pendingSidePanelAction'
};

/**
 * Create extension context menus.
 */
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.SELECTION,
      title: 'Generate QR code from "%s"',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.LINK,
      title: 'Generate QR code for this link',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      id: CONTEXT_MENU_IDS.PAGE,
      title: 'Generate QR code for this page',
      contexts: ['page']
    });
  });
}

/**
 * Open side panel for tab and persist text for side panel consumption.
 */
async function openPanelAndPrefill(tab, text) {
  if (!text) {
    return;
  }

  let targetTab = tab;
  if (!targetTab?.id) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    targetTab = activeTab;
  }

  if (!targetTab?.id) {
    throw new Error('No target tab found for opening side panel');
  }

  const persistPromise = chrome.storage.local.set({
    [PENDING_KEYS.TEXT]: text,
    [PENDING_KEYS.TARGET_TAB]: targetTab.id,
    [PENDING_KEYS.ACTION]: 'generate'
  });

  // Ensure side panel is enabled for this tab before opening.
  const setOptionsPromise = chrome.sidePanel.setOptions({
    path: 'src/sidepanel/sidepanel.html',
    enabled: true
  }).catch(() => undefined);

  const setTabOptionsPromise = chrome.sidePanel.setOptions({
    tabId: targetTab.id,
    path: 'src/sidepanel/sidepanel.html',
    enabled: true
  }).catch(() => undefined);

  // Open immediately in the context-menu gesture. Edge can reject when delayed by awaits.
  const openByWindow = () => chrome.sidePanel.open({ windowId: targetTab.windowId });
  const openByTab = () => chrome.sidePanel.open({ tabId: targetTab.id });

  let openError = null;
  try {
    await openByWindow();
  } catch (errWindow) {
    try {
      await openByTab();
    } catch (errTab) {
      openError = errTab || errWindow;
    }
  }

  await Promise.allSettled([persistPromise, setOptionsPromise, setTabOptionsPromise]);

  if (openError) {
    throw openError;
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TapToQR Enhanced installed');
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('TapToQR Enhanced updated');
  }

  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting panel behavior:', error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel') {
    const targetWindowId = sender?.tab?.windowId;

    if (!targetWindowId) {
      sendResponse({ success: false, error: 'No sender tab window' });
      return false;
    }

    chrome.sidePanel.open({ windowId: targetWindowId })
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'openHistory') {
    chrome.storage.local.set({
      [PENDING_KEYS.TARGET_TAB]: message.tabId || null,
      [PENDING_KEYS.ACTION]: 'history'
    })
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  return false;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    let targetTab = tab;
    if (!targetTab?.id && typeof info.tabId === 'number') {
      targetTab = await chrome.tabs.get(info.tabId);
    }

    if (info.menuItemId === CONTEXT_MENU_IDS.SELECTION) {
      await openPanelAndPrefill(targetTab, info.selectionText);
      return;
    }

    if (info.menuItemId === CONTEXT_MENU_IDS.LINK) {
      await openPanelAndPrefill(targetTab, info.linkUrl);
      return;
    }

    if (info.menuItemId === CONTEXT_MENU_IDS.PAGE) {
      const pageUrl = targetTab?.url || info.pageUrl;
      await openPanelAndPrefill(targetTab, pageUrl);
    }
  } catch (error) {
    console.error('Failed handling context menu click:', {
      error: error?.message || String(error),
      menuItemId: info?.menuItemId,
      tabId: tab?.id,
      pageUrl: info?.pageUrl,
      linkUrl: info?.linkUrl
    });
  }
});
