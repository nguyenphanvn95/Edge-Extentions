// Storage Helper for Drawing Extension
// Thêm vào cuối file panelTools.js để mở rộng chức năng

(function() {
  'use strict';
  
  if (!window.NOTEPAD) {
    console.error('NOTEPAD not initialized');
    return;
  }

  // Thêm các phương thức mới vào NOTEPAD
  const StorageHelper = {
    // Lưu drawing hiện tại
    saveCurrentDrawing: function() {
      if (!window.NOTEPAD.canvas) {
        console.error('Canvas not initialized');
        return;
      }

      const currentUrl = window.location.href;
      const imageData = window.NOTEPAD.canvas.toDataURL('image/png');
      
      chrome.runtime.sendMessage({
        method: 'save_drawing',
        url: currentUrl,
        imageData: imageData
      }, (response) => {
        if (response && response.success) {
          this.showNotification('Drawing saved!', 'success');
        } else {
          this.showNotification('Failed to save drawing', 'error');
        }
      });
    },

    // Load drawing cho URL hiện tại
    loadDrawingForCurrentPage: function() {
      const currentUrl = window.location.href;
      
      chrome.runtime.sendMessage({
        method: 'load_drawing',
        url: currentUrl
      }, (response) => {
        if (response && response.success && response.data) {
          this.restoreDrawing(response.data.imageData);
          this.showNotification('Drawing loaded!', 'success');
        }
      });
    },

    // Khôi phục drawing từ imageData
    restoreDrawing: function(imageData) {
      if (!window.NOTEPAD.canvas || !window.NOTEPAD.context) {
        console.error('Canvas not initialized');
        return;
      }

      const img = new Image();
      img.onload = function() {
        window.NOTEPAD.context.drawImage(img, 0, 0);
        window.NOTEPAD.storeCanvas();
      };
      img.src = imageData;
    },

    // Xóa drawing của trang hiện tại
    deleteCurrentDrawing: function() {
      const currentUrl = window.location.href;
      
      if (confirm('Are you sure you want to delete the saved drawing for this page?')) {
        chrome.runtime.sendMessage({
          method: 'delete_drawing',
          url: currentUrl
        }, (response) => {
          if (response && response.success) {
            this.showNotification('Drawing deleted!', 'success');
          }
        });
      }
    },

    // Hiển thị danh sách tất cả drawings đã lưu
    listAllDrawings: function() {
      chrome.runtime.sendMessage({
        method: 'list_drawings'
      }, (response) => {
        if (response && response.success) {
          this.showDrawingsList(response.drawings);
        }
      });
    },

    // Hiển thị notification
    showNotification: function(message, type) {
      const notification = document.createElement('div');
      notification.className = 'notepad-notification ' + type;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    },

    // Hiển thị danh sách drawings
    showDrawingsList: function(drawings) {
      const modal = document.createElement('div');
      modal.className = 'notepad-drawings-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      `;
      
      let html = '<h2 style="margin-top:0">Saved Drawings</h2>';
      
      if (drawings.length === 0) {
        html += '<p>No drawings saved yet.</p>';
      } else {
        html += '<ul style="list-style: none; padding: 0;">';
        drawings.forEach((drawing, index) => {
          const date = new Date(drawing.timestamp).toLocaleString();
          html += `
            <li style="padding: 10px; border-bottom: 1px solid #eee;">
              <div><strong>${drawing.url}</strong></div>
              <div style="font-size: 12px; color: #666;">Saved: ${date}</div>
            </li>
          `;
        });
        html += '</ul>';
      }
      
      html += '<button style="margin-top: 15px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>';
      
      content.innerHTML = html;
      content.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    },

    // Auto-save mỗi 30 giây
    enableAutoSave: function() {
      setInterval(() => {
        if (window.NOTEPAD.canvas && window.NOTEPAD.initialized) {
          this.saveCurrentDrawing();
        }
      }, 30000); // 30 seconds
    }
  };

  // Lắng nghe message từ background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method === 'restore_drawing' && message.imageData) {
      StorageHelper.restoreDrawing(message.imageData);
    }
  });

  // Gắn StorageHelper vào NOTEPAD
  window.NOTEPAD.StorageHelper = StorageHelper;

  // Thêm các nút mới vào control panel
  if (window.NOTEPAD.initialized && window.NOTEPAD.panel) {
    addStorageButtons();
  } else {
    // Đợi NOTEPAD khởi tạo xong
    const checkInit = setInterval(() => {
      if (window.NOTEPAD.initialized && window.NOTEPAD.panel) {
        clearInterval(checkInit);
        addStorageButtons();
      }
    }, 100);
  }

  function addStorageButtons() {
    const panel = window.NOTEPAD.panel;
    if (!panel) return;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'NOTEPAD_storage_buttons';
    buttonsContainer.style.cssText = `
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
    `;

    const buttonStyle = `
      padding: 8px 12px;
      margin: 2px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: Arial, sans-serif;
    `;

    // Nút Save
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save';
    saveBtn.title = 'Save drawing for this page';
    saveBtn.style.cssText = buttonStyle;
    saveBtn.addEventListener('click', () => {
      StorageHelper.saveCurrentDrawing();
    });

    // Nút Load
    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📂 Load';
    loadBtn.title = 'Load saved drawing';
    loadBtn.style.cssText = buttonStyle;
    loadBtn.addEventListener('click', () => {
      StorageHelper.loadDrawingForCurrentPage();
    });

    // Nút Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.title = 'Delete saved drawing';
    deleteBtn.style.cssText = buttonStyle + 'background: #f44336;';
    deleteBtn.addEventListener('click', () => {
      StorageHelper.deleteCurrentDrawing();
    });

    // Nút List
    const listBtn = document.createElement('button');
    listBtn.textContent = '📋 List All';
    listBtn.title = 'View all saved drawings';
    listBtn.style.cssText = buttonStyle + 'background: #4CAF50;';
    listBtn.addEventListener('click', () => {
      StorageHelper.listAllDrawings();
    });

    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(loadBtn);
    buttonsContainer.appendChild(deleteBtn);
    buttonsContainer.appendChild(listBtn);

    panel.appendChild(buttonsContainer);

    // Bật auto-save (tùy chọn)
    // StorageHelper.enableAutoSave();
  }

  // Thêm CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

})();
