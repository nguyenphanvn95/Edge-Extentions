// Content Script - Auto-inject storage helper
(function() {
  'use strict';
  
  // Inject storageHelper.js vào trang
  function injectStorageHelper() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('scripts/storageHelper.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Đợi NOTEPAD được khởi tạo
  function waitForNotepad() {
    if (window.NOTEPAD && window.NOTEPAD.initialized) {
      injectStorageHelper();
    } else {
      setTimeout(waitForNotepad, 100);
    }
  }

  // Lắng nghe message từ background để restore drawing
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method === 'restore_drawing' && message.imageData) {
      // Đợi NOTEPAD khởi tạo xong
      const checkInterval = setInterval(() => {
        if (window.NOTEPAD && window.NOTEPAD.canvas && window.NOTEPAD.context) {
          clearInterval(checkInterval);
          
          const img = new Image();
          img.onload = function() {
            window.NOTEPAD.context.drawImage(img, 0, 0);
            window.NOTEPAD.storeCanvas();
            console.log('Drawing restored from storage');
          };
          img.src = message.imageData;
          
          sendResponse({ success: true });
        }
      }, 100);
      
      return true; // Keep message channel open
    }
  });

  // Bắt đầu theo dõi NOTEPAD
  waitForNotepad();

})();
