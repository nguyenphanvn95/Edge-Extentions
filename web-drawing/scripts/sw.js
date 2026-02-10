(() => {
  const extension = new class {
    constructor() {
      this.screenshotTabId = null;
      this.initMessageListeners();
      this.run();
    }

    run() {
      chrome.action.onClicked.addListener(this.inject.bind(this));
      chrome.tabs.onActivated.addListener(this.warning.bind(this));
      chrome.tabs.onUpdated.addListener(this.warning.bind(this));
      chrome.runtime.onInstalled.addListener(this.warning.bind(this));
      
      // Auto-load drawings when tab is updated
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
          this.autoLoadDrawing(tabId, tab.url);
        }
      });
    }

    initMessageListeners() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.method === 'take_screen_shot') {
          this.screenShot(sendResponse);
        } else if (message.method === 'get_pixel_color') {
          const point = message.point;
          this.getPixelColor(point, sendResponse);
        } else if (message.method === 'save_data') {
          // Nâng cấp: Lưu theo URL
          this.saveDataByUrl(message.config, message.url);
        } else if (message.method === 'get_data') {
          // Nâng cấp: Lấy data theo URL
          this.getDataByUrl(message.url, sendResponse);
        } else if (message.method === 'save_drawing') {
          // Tính năng mới: Lưu drawing theo URL
          this.saveDrawing(message.url, message.imageData, sendResponse);
        } else if (message.method === 'load_drawing') {
          // Tính năng mới: Load drawing theo URL
          this.loadDrawing(message.url, sendResponse);
        } else if (message.method === 'delete_drawing') {
          // Tính năng mới: Xóa drawing
          this.deleteDrawing(message.url, sendResponse);
        } else if (message.method === 'list_drawings') {
          // Tính năng mới: Liệt kê tất cả drawings
          this.listAllDrawings(sendResponse);
        } else if (message.method === 'open_options') {
          chrome.runtime.openOptionsPage();
        }
        return true; // Keep message channel open for async response
      });
    }

    // Hàm tạo key từ URL (bỏ query string và hash)
    normalizeUrl(url) {
      try {
        const urlObj = new URL(url);
        // Chỉ lấy origin + pathname, bỏ query string và hash
        return urlObj.origin + urlObj.pathname;
      } catch (e) {
        return url;
      }
    }

    // Lưu drawing theo URL
    async saveDrawing(url, imageData, callback) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `drawing_${btoa(normalizedUrl)}`;
      
      try {
        await chrome.storage.local.set({
          [key]: {
            url: normalizedUrl,
            imageData: imageData,
            timestamp: Date.now()
          }
        });
        
        // Cập nhật danh sách URLs đã lưu
        const { savedUrls = [] } = await chrome.storage.local.get(['savedUrls']);
        if (!savedUrls.includes(normalizedUrl)) {
          savedUrls.push(normalizedUrl);
          await chrome.storage.local.set({ savedUrls });
        }
        
        if (callback) callback({ success: true });
      } catch (error) {
        console.error('Error saving drawing:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    }

    // Load drawing theo URL
    async loadDrawing(url, callback) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `drawing_${btoa(normalizedUrl)}`;
      
      try {
        const result = await chrome.storage.local.get([key]);
        if (result[key]) {
          if (callback) callback({ 
            success: true, 
            data: result[key] 
          });
        } else {
          if (callback) callback({ 
            success: false, 
            message: 'No drawing found for this URL' 
          });
        }
      } catch (error) {
        console.error('Error loading drawing:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    }

    // Xóa drawing
    async deleteDrawing(url, callback) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `drawing_${btoa(normalizedUrl)}`;
      
      try {
        await chrome.storage.local.remove([key]);
        
        // Xóa khỏi danh sách URLs
        const { savedUrls = [] } = await chrome.storage.local.get(['savedUrls']);
        const updatedUrls = savedUrls.filter(u => u !== normalizedUrl);
        await chrome.storage.local.set({ savedUrls: updatedUrls });
        
        if (callback) callback({ success: true });
      } catch (error) {
        console.error('Error deleting drawing:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    }

    // Liệt kê tất cả drawings đã lưu
    async listAllDrawings(callback) {
      try {
        const { savedUrls = [] } = await chrome.storage.local.get(['savedUrls']);
        const drawings = [];
        
        for (const url of savedUrls) {
          const key = `drawing_${btoa(url)}`;
          const result = await chrome.storage.local.get([key]);
          if (result[key]) {
            drawings.push({
              url: url,
              timestamp: result[key].timestamp
            });
          }
        }
        
        if (callback) callback({ success: true, drawings });
      } catch (error) {
        console.error('Error listing drawings:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    }

    // Auto-load drawing khi tab được load
    async autoLoadDrawing(tabId, url) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `drawing_${btoa(normalizedUrl)}`;
      
      try {
        const result = await chrome.storage.local.get([key]);
        if (result[key]) {
          // Inject CSS và script trước
          await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['/assets/css/panelTools.css']
          });
          
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['/scripts/panelTools.js']
          });
          
          // Đợi một chút để script khởi tạo
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              method: 'restore_drawing',
              imageData: result[key].imageData
            });
          }, 500);
        }
      } catch (error) {
        console.error('Error auto-loading drawing:', error);
      }
    }

    // Lưu config theo URL (nâng cấp từ hàm cũ)
    async saveDataByUrl(config, url) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `config_${btoa(normalizedUrl)}`;
      return chrome.storage.local.set({ [key]: config });
    }

    // Lấy config theo URL (nâng cấp từ hàm cũ)
    async getDataByUrl(url, callback) {
      const normalizedUrl = this.normalizeUrl(url);
      const key = `config_${btoa(normalizedUrl)}`;
      chrome.storage.local.get([key], (result) => {
        callback(result[key] || null);
      });
    }

    getPixelColor(point, callback) {
      chrome.tabs.captureVisibleTab(null, null, (dataUrl) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        
        document.documentElement.appendChild(canvas);
        image.src = dataUrl;
        
        image.onload = () => {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.drawImage(image, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const index = (point.y * imageData.width + point.x) * 4;
          const pixels = imageData.data;
          
          if (typeof callback === 'function') {
            const color = {
              r: pixels[index],
              g: pixels[index + 1],
              b: pixels[index + 2],
              a: pixels[index + 3]
            };
            document.documentElement.removeChild(canvas);
            callback(color);
          }
        };
      });
    }

    saveData(config) {
      return chrome.storage.local.set({ config: config });
    }

    getData(callback) {
      chrome.storage.local.get((data) => {
        callback(data.config || null);
      });
    }

    inject() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['/assets/css/panelTools.css']
        }).then(() => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['/scripts/panelTools.js']
          });
        });
      });
    }

    async screenShot(callback) {
      const dataUrl = await chrome.tabs.captureVisibleTab();
      
      let existingTab;
      if (this.screenshotTabId) {
        existingTab = await chrome.tabs.get(this.screenshotTabId).catch(() => null);
      }
      
      if (existingTab) {
        await chrome.tabs.update(existingTab.id, { active: true });
        this.updateScreenshot(dataUrl, callback, 0, existingTab);
      } else {
        const newTab = await chrome.tabs.create({ url: '/editor.html' });
        this.screenshotTabId = newTab.id;
        this.updateScreenshot(dataUrl, callback, 0, newTab);
      }
    }

    updateScreenshot(dataUrl, callback, retryCount = 0, tab) {
      if (retryCount > 10) return;
      
      chrome.runtime.sendMessage({
        method: 'update_url',
        url: dataUrl
      }, (response) => {
        if (!response || !response.success) {
          setTimeout(() => {
            this.updateScreenshot(dataUrl, callback, retryCount + 1, tab);
          }, 300);
        }
      });
    }

    async setWarning(popup) {
      await chrome.action.setPopup({ popup: popup });
    }

    async warning() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['/assets/css/modalRateUs.css']
          });
          await extension.setWarning('');
        } else {
          await extension.setWarning('showWarning.html');
        }
      } catch (error) {
        await extension.setWarning('showWarning.html');
      }
    }
  }
})();
