// Background Service Worker
let timerState = {
  isRunning: false,
  timeLeft: 1500, // 25 phút
  totalTime: 1500, // Total time for progress bar
  mode: 'work', // work, shortBreak, longBreak
  startTime: null
};

let settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  notificationEnabled: true,
  notificationSound: 'ding',
  notificationVolume: 70,
  ultraFocus: false,
  autoStart: false,
  musicEnabled: false,
  musicSelect: 'lofi',
  musicVolume: 50
};

let pomodoroCount = 0;

// Khởi tạo khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pomodoro Extension installed');
  loadSettings();
  
  // Tạo alarm để update timer mỗi giây
  chrome.alarms.create('timerTick', { periodInMinutes: 1/60 });
});

// Khởi tạo khi browser khởi động
chrome.runtime.onStartup.addListener(() => {
  loadSettings();
});

// Lắng nghe messages từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.mode, message.timeLeft);
      sendResponse({ success: true });
      break;
      
    case 'pauseTimer':
      pauseTimer();
      sendResponse({ success: true });
      break;
      
    case 'stopTimer':
      stopTimer();
      sendResponse({ success: true });
      break;
      
    case 'skipSession':
      skipSession();
      sendResponse({ success: true });
      break;
      
    case 'getTimerState':
      sendResponse(timerState);
      break;
      
    case 'updateSettings':
      settings = message.settings;
      chrome.storage.local.set(message.settings);
      sendResponse({ success: true });
      break;
      
    case 'updateBlockedSites':
      updateContentScripts();
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

// Xử lý alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerTick' && timerState.isRunning) {
    timerState.timeLeft--;
    
    // Update badge
    updateBadge();
    
    // Gửi update tới popup nếu đang mở
    chrome.runtime.sendMessage({ 
      action: 'timerUpdate', 
      timeLeft: timerState.timeLeft 
    }).catch(() => {
      // Popup không mở, bỏ qua lỗi
    });
    
    // Kiểm tra nếu hết thời gian
    if (timerState.timeLeft <= 0) {
      sessionComplete();
    }
  }
});

// Timer functions
function startTimer(mode, timeLeft) {
  timerState.isRunning = true;
  timerState.mode = mode;
  timerState.timeLeft = timeLeft;
  timerState.totalTime = timeLeft; // Save total time for progress
  timerState.startTime = Date.now();
  
  updateBadge();
  
  // Kích hoạt chặn website nếu đang ở chế độ work
  if (mode === 'work') {
    updateContentScripts();
  }
}

function pauseTimer() {
  timerState.isRunning = false;
  updateBadge();
  
  // Tắt chặn website
  updateContentScripts();
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.timeLeft = settings.workDuration * 60;
  timerState.totalTime = settings.workDuration * 60;
  timerState.mode = 'work';
  
  chrome.action.setBadgeText({ text: '' });
  
  // Tắt chặn website
  updateContentScripts();
}

function skipSession() {
  sessionComplete();
}

function sessionComplete() {
  timerState.isRunning = false;
  
  // Hiển thị thông báo
  if (settings.notificationEnabled) {
    showNotification();
  }
  
  // Play sound
  playNotificationSound();
  
  // Chuyển sang session tiếp theo
  chrome.runtime.sendMessage({ action: 'sessionComplete' }).catch(() => {});
  
  // Tắt chặn website tạm thời
  updateContentScripts();
}

function updateBadge() {
  if (timerState.isRunning) {
    const minutes = Math.ceil(timerState.timeLeft / 60);
    chrome.action.setBadgeText({ text: minutes.toString() });
    
    if (timerState.mode === 'work') {
      chrome.action.setBadgeBackgroundColor({ color: '#48bb78' });
    } else if (timerState.mode === 'shortBreak') {
      chrome.action.setBadgeBackgroundColor({ color: '#ed8936' });
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    }
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Notifications
function showNotification() {
  let title, message, icon;
  
  if (timerState.mode === 'work') {
    title = '🎉 Hoàn thành Pomodoro!';
    message = 'Tuyệt vời! Đã đến lúc nghỉ ngơi một chút.';
    icon = 'icons/icon128.png';
  } else {
    title = '⚡ Hết giờ nghỉ!';
    message = 'Đã sẵn sàng cho phiên làm việc tiếp theo chưa?';
    icon = 'icons/icon128.png';
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title: title,
    message: message,
    priority: 2
  });
}

function playNotificationSound() {
  // Trong service worker, không thể phát âm thanh trực tiếp
  // Cần sử dụng offscreen document hoặc content script
  console.log('Playing notification sound:', settings.notificationSound);
}

// Settings
function loadSettings() {
  chrome.storage.local.get({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    notificationEnabled: true,
    notificationSound: 'ding',
    notificationVolume: 70,
    ultraFocus: false,
    autoStart: false,
    musicEnabled: false,
    musicSelect: 'lofi',
    musicVolume: 50,
    pomodoroCount: 0
  }, (result) => {
    settings = result;
    pomodoroCount = result.pomodoroCount || 0;
    timerState.timeLeft = settings.workDuration * 60;
  });
}

// Content Scripts - Website Blocking
function updateContentScripts() {
  // Gửi message tới tất cả tabs để update trạng thái chặn
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateBlockingState',
          isBlocking: timerState.isRunning && timerState.mode === 'work',
          ultraFocus: settings.ultraFocus
        }).catch(() => {
          // Tab không có content script, bỏ qua
        });
      }
    });
  });
}

// Badge click - mở popup
chrome.action.onClicked.addListener(() => {
  // Popup sẽ tự động mở vì có default_popup trong manifest
});
