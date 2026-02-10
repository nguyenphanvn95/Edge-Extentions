// ============================================
// POMODORO GRANDE PRO - UPGRADED FEATURES
// Part 1: Themes, Presets, Smart Notifications
// ============================================

// Thêm vào phần đầu file (sau các biến global hiện tại)

// NEW: Theme System
const themes = {
  default: {
    primary: '#48bb78',
    secondary: '#667eea',
    accent: '#ed8936'
  },
  dark: {
    primary: '#68d391',
    secondary: '#9f7aea',
    accent: '#fc8181'
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#0891b2'
  },
  forest: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#047857'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ef4444',
    accent: '#dc2626'
  },
  purple: {
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#7e22ce'
  },
  monochrome: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#9ca3af'
  }
};

// NEW: Timer Presets
const timerPresets = {
  classic: {
    name: 'Classic Pomodoro',
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    icon: '📚'
  },
  study: {
    name: 'Study Mode',
    work: 50,
    shortBreak: 10,
    longBreak: 30,
    icon: '🎓'
  },
  quick: {
    name: 'Quick Focus',
    work: 15,
    shortBreak: 3,
    longBreak: 10,
    icon: '⚡'
  },
  sprint: {
    name: 'Deep Work Sprint',
    work: 90,
    shortBreak: 20,
    longBreak: 45,
    icon: '🏃'
  },
  custom: {
    name: 'Custom',
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    icon: '⚙️'
  }
};

// NEW: Motivational Quotes
const motivationalQuotes = [
  {
    text: "Tập trung là chìa khóa để mở cánh cửa thành công.",
    author: "— Bill Gates"
  },
  {
    text: "Điều quan trọng không phải làm nhiều, mà là làm đúng.",
    author: "— Peter Drucker"
  },
  {
    text: "Một giờ tập trung sâu đáng giá hơn ba giờ làm việc lãng phí.",
    author: "— Cal Newport"
  },
  {
    text: "Thành công là tổng của những nỗ lực nhỏ được lặp đi lặp lại mỗi ngày.",
    author: "— Robert Collier"
  },
  {
    text: "Đừng đếm ngày, hãy làm cho mỗi ngày có giá trị.",
    author: "— Muhammad Ali"
  },
  {
    text: "Kỷ luật là cầu nối giữa mục tiêu và thành tích.",
    author: "— Jim Rohn"
  },
  {
    text: "Tương lai phụ thuộc vào những gì bạn làm hôm nay.",
    author: "— Mahatma Gandhi"
  },
  {
    text: "Bạn không cần phải tuyệt vời mới bắt đầu, nhưng bạn phải bắt đầu để trở nên tuyệt vời.",
    author: "— Zig Ziglar"
  },
  {
    text: "Tập trung vào việc trở nên hiệu quả, không phải bận rộn.",
    author: "— Tim Ferriss"
  },
  {
    text: "Thời gian bạn tận hưởng việc lãng phí không phải là thời gian bị lãng phí.",
    author: "— Bertrand Russell"
  }
];

// NEW: Notification Messages
const notificationMessages = {
  workStart: [
    "💪 Bắt đầu làm việc! Bạn làm được!",
    "🔥 Thời gian tập trung! Hãy cho tôi thấy bạn giỏi đến đâu!",
    "⚡ Sẵn sàng chinh phục mục tiêu!",
    "🎯 Tập trung 100%! Loại bỏ mọi phiền nhiễu!",
    "🚀 Khởi động chế độ siêu năng suất!"
  ],
  workComplete: [
    "🎉 Tuyệt vời! Bạn đã hoàn thành một Pomodoro!",
    "⭐ Xuất sắc! Tiếp tục phát huy nhé!",
    "🏆 Thành công! Bạn xứng đáng được nghỉ ngơi!",
    "💯 Perfect! Bạn đang trên đà thành công!",
    "🎊 Làm tốt lắm! Hãy thưởng cho bản thân!"
  ],
  breakStart: [
    "☕ Nghỉ ngơi thôi! Bạn xứng đáng được thư giãn.",
    "🌸 Đã đến lúc nạp năng lượng.",
    "🧘 Hít thở sâu, thư giãn và sạc pin!",
    "💆 Kéo dài cơ thể, uống nước, thư giãn!",
    "🌟 Nghỉ ngơi cũng là một phần của năng suất!"
  ],
  milestone: [
    "🏅 Bạn đã hoàn thành 5 Pomodoros!",
    "🎖️ 10 Pomodoros! Bạn là champion!",
    "👑 Chúc mừng! 25 Pomodoros trong tuần!",
    "💎 50 Pomodoros! Bạn là huyền thoại!",
    "🌟 100 Pomodoros! Bạn đã đạt đỉnh cao!"
  ]
};

// ============================================
// THEME FUNCTIONS
// ============================================

async function loadTheme() {
  const result = await chrome.storage.local.get(['selectedTheme']);
  const theme = result.selectedTheme || 'default';
  applyTheme(theme);
  
  // Update select
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = theme;
  }
  
  // Update preview
  updateThemePreview(theme);
}

function applyTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);
  
  // Update CSS variables
  const theme = themes[themeName];
  if (theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    updateThemePreview(themeName);
  }
  
  // Save to storage
  chrome.storage.local.set({ selectedTheme: themeName });
  
  // Update active state in theme modal
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === themeName) {
      option.classList.add('active');
    }
  });
}

function updateThemePreview(themeName) {
  const theme = themes[themeName];
  if (theme) {
    document.getElementById('preview-primary').style.background = theme.primary;
    document.getElementById('preview-secondary').style.background = theme.secondary;
    document.getElementById('preview-accent').style.background = theme.accent;
  }
}

function setupThemeListeners() {
  // Theme button in header
  const themeBtn = document.getElementById('theme-btn');
  const themeModal = document.getElementById('theme-modal');
  const closeModal = document.getElementById('close-theme-modal');
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      themeModal.style.display = 'flex';
    });
  }
  
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      themeModal.style.display = 'none';
    });
  }
  
  // Click outside to close
  themeModal.addEventListener('click', (e) => {
    if (e.target === themeModal) {
      themeModal.style.display = 'none';
    }
  });
  
  // Theme options
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      applyTheme(theme);
    });
  });
  
  // Theme select in settings
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }
}

// ============================================
// TIMER PRESETS
// ============================================

let currentPreset = 'classic';

function setupPresetListeners() {
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const presetName = card.dataset.preset;
      applyPreset(presetName);
    });
  });
}

function applyPreset(presetName) {
  const preset = timerPresets[presetName];
  if (!preset) return;
  
  currentPreset = presetName;
  
  // Update active state
  document.querySelectorAll('.preset-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.preset === presetName) {
      card.classList.add('active');
    }
  });
  
  // Update settings
  document.getElementById('work-duration').value = preset.work;
  document.getElementById('short-break').value = preset.shortBreak;
  document.getElementById('long-break').value = preset.longBreak;
  
  // Save settings
  chrome.storage.local.set({
    workDuration: preset.work,
    shortBreak: preset.shortBreak,
    longBreak: preset.longBreak,
    currentPreset: presetName
  });
  
  // Update timer if not running
  if (!isRunning && currentMode === 'work') {
    timeLeft = preset.work * 60;
    updateTimerDisplay();
  }
  
  // Update mode text
  document.getElementById('mode-text').textContent = `Chế độ ${preset.name}`;
  
  // Show success notification
  showToast(`✅ Đã chuyển sang ${preset.name}!`);
}

async function loadCurrentPreset() {
  const result = await chrome.storage.local.get(['currentPreset']);
  const preset = result.currentPreset || 'classic';
  
  document.querySelectorAll('.preset-card').forEach(card => {
    if (card.dataset.preset === preset) {
      card.classList.add('active');
    }
  });
  
  currentPreset = preset;
}

// ============================================
// DAILY QUOTE
// ============================================

async function loadDailyQuote() {
  const today = new Date().toDateString();
  const result = await chrome.storage.local.get(['dailyQuote', 'quoteDate']);
  
  let quote;
  
  // Check if we need a new quote
  if (result.quoteDate !== today || !result.dailyQuote) {
    // Get random quote
    quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    // Save for today
    await chrome.storage.local.set({
      dailyQuote: quote,
      quoteDate: today
    });
  } else {
    quote = result.dailyQuote;
  }
  
  // Display quote
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  
  if (quoteText && quoteAuthor) {
    quoteText.textContent = quote.text;
    quoteAuthor.textContent = quote.author;
  }
}

// ============================================
// SMART NOTIFICATIONS
// ============================================

async function showSmartNotification(type, pomodoroCount = 0) {
  const settings = await chrome.storage.local.get(['notificationEnabled', 'motivationalQuotes']);
  
  if (!settings.notificationEnabled) return;
  
  let messages = [];
  let title = '';
  
  switch (type) {
    case 'workStart':
      messages = notificationMessages.workStart;
      title = '🍅 Pomodoro Bắt Đầu';
      break;
    case 'workComplete':
      messages = notificationMessages.workComplete;
      title = '✅ Hoàn Thành';
      
      // Check for milestones
      if (pomodoroCount % 5 === 0 && pomodoroCount > 0) {
        messages = [`🎉 Milestone: ${pomodoroCount} Pomodoros hoàn thành!`];
      }
      break;
    case 'breakStart':
      messages = notificationMessages.breakStart;
      title = '☕ Nghỉ Ngơi';
      break;
  }
  
  if (messages.length === 0) return;
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // Show browser notification
  if (settings.motivationalQuotes !== false) {
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: title,
      message: message
    });
  }
  
  // Show in-app toast
  showToast(message);
}

// Toast notification helper
function showToast(message, duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// CONFETTI CELEBRATION
// ============================================

function celebrateWithConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const confetti = [];
  const colors = ['#48bb78', '#667eea', '#ed8936', '#f56565', '#4299e1'];
  
  // Create confetti pieces
  for (let i = 0; i < 50; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10
    });
  }
  
  // Animate
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confetti.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
      
      // Update position
      c.y += c.d;
      c.x += Math.sin(c.y * 0.01) * 2;
      
      // Remove if off screen
      if (c.y > canvas.height) {
        confetti.splice(i, 1);
      }
    });
    
    if (confetti.length > 0) {
      requestAnimationFrame(draw);
    } else {
      canvas.style.display = 'none';
    }
  }
  
  draw();
}

// ============================================
// UPDATE EXISTING FUNCTIONS
// ============================================

// Thêm vào hàm startTimer() hiện tại:
async function startTimer() {
  isRunning = true;
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'block';
  document.getElementById('skip-btn').style.display = 'block';

  chrome.runtime.sendMessage({ 
    action: 'startTimer', 
    mode: currentMode,
    timeLeft: timeLeft 
  });

  const settings = await loadSettings();
  if (settings.musicEnabled) {
    startBackgroundMusic();
  }

  // NEW: Show smart notification
  await showSmartNotification('workStart');

  updateTimerDisplay();
}

// Thêm vào hàm khi hoàn thành Pomodoro:
async function onPomodoroComplete() {
  pomodoroCount++;
  savePomodoroCount();
  
  // NEW: Smart notification với milestone check
  await showSmartNotification('workComplete', pomodoroCount);
  
  // NEW: Confetti for milestones
  if (pomodoroCount % 5 === 0) {
    celebrateWithConfetti();
  }
  
  // NEW: Auto-save journal prompt
  const settings = await chrome.storage.local.get(['autoJournal']);
  if (settings.autoJournal !== false) {
    setTimeout(() => {
      showJournalPrompt();
    }, 2000);
  }
  
  nextSession();
}

// ============================================
// INITIALIZATION
// ============================================

// Thêm vào DOMContentLoaded:
document.addEventListener('DOMContentLoaded', async () => {
  // Existing code...
  await loadSettings();
  await loadStats();
  await loadBlockedSites();
  await loadTodos();
  
  // NEW: Load theme, preset, quote
  await loadTheme();
  await loadCurrentPreset();
  await loadDailyQuote();
  
  setupEventListeners();
  
  // NEW: Setup new listeners
  setupThemeListeners();
  setupPresetListeners();
  
  syncTimerWithBackground();
});

// Export functions for use in other parts
window.applyTheme = applyTheme;
window.applyPreset = applyPreset;
window.showSmartNotification = showSmartNotification;
window.showToast = showToast;

// Popup.js - Xử lý giao diện popup
let timerInterval;
let currentMode = 'work'; // work, shortBreak, longBreak
let timeLeft = 1500; // 25 phút
let isRunning = false;
let pomodoroCount = 0;
let totalFocusTime = 0;
let audioContext;
let musicSource;
let musicGainNode;
let isPlayingMusic = false;

// Khởi tạo
document.addEventListener('DOMContentLoaded', async () => {
  // Original loads
  await loadSettings();
  await loadStats();
  await loadBlockedSites();
  await loadTodos();
  
  // NEW: Load upgraded features
  await loadTheme();
  await loadCurrentPreset();
  await loadDailyQuote();
  await initializeJournal();
  
  // Setup listeners
  setupEventListeners();
  
  // NEW: Setup new listeners
  setupThemeListeners();
  setupPresetListeners();
  setupJournalListeners();
  
  syncTimerWithBackground();
});
// Setup Event Listeners
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Timer controls
  document.getElementById('start-btn').addEventListener('click', startTimer);
  document.getElementById('pause-btn').addEventListener('click', pauseTimer);
  document.getElementById('stop-btn').addEventListener('click', stopTimer);
  document.getElementById('skip-btn').addEventListener('click', skipSession);

  // Settings
  document.getElementById('work-duration').addEventListener('change', saveSettings);
  document.getElementById('short-break').addEventListener('change', saveSettings);
  document.getElementById('long-break').addEventListener('change', saveSettings);
  document.getElementById('notification-enabled').addEventListener('change', saveSettings);
  document.getElementById('notification-sound').addEventListener('change', saveSettings);
  document.getElementById('notification-volume').addEventListener('input', updateVolumeDisplay);
  document.getElementById('notification-volume').addEventListener('change', saveSettings);
  document.getElementById('ultra-focus').addEventListener('change', saveSettings);
  document.getElementById('auto-start').addEventListener('change', saveSettings);

  // Music
  document.getElementById('music-enabled').addEventListener('change', toggleMusic);
  document.getElementById('music-select').addEventListener('change', changeMusic);
  document.getElementById('music-volume').addEventListener('input', updateMusicVolumeDisplay);
  document.getElementById('music-volume').addEventListener('change', changeMusicVolume);
  document.getElementById('preview-music').addEventListener('click', previewMusic);

  // Sites blocking
  document.querySelectorAll('.site-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSiteMode(btn.dataset.mode));
  });
  
  document.getElementById('add-blacklist').addEventListener('click', () => addSite('blacklist'));
  document.getElementById('add-whitelist').addEventListener('click', () => addSite('whitelist'));
  
  document.getElementById('blacklist-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite('blacklist');
  });
  
  document.getElementById('whitelist-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite('whitelist');
  });

  // Preset sites
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => addPresetSite(btn.dataset.site));
  });

  // Site item actions (remove) via delegation
  document.getElementById('sites-tab').addEventListener('click', handleSiteActionClick);

  // Todo List / Kanban
  document.getElementById('add-todo-btn').addEventListener('click', addTodo);
  document.getElementById('todo-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  document.getElementById('clear-completed-btn').addEventListener('click', clearCompletedTasks);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllTasks);
  document.getElementById('todos-tab').addEventListener('click', handleTaskActionClick);
}

function handleSiteActionClick(e) {
  const btn = e.target.closest('button[data-site-action="remove"]');
  if (!btn) return;
  const type = btn.dataset.siteType;
  const site = btn.dataset.siteValue;
  if (!type || !site) return;
  removeSite(type, site);
}

function handleTaskActionClick(e) {
  const actionBtn = e.target.closest('button[data-task-action]');
  if (!actionBtn) return;

  const action = actionBtn.dataset.taskAction;
  const taskId = actionBtn.dataset.taskId;
  if (!action || !taskId) return;

  if (action === 'edit') editTask(taskId);
  if (action === 'delete') deleteTask(taskId);
  if (action === 'save') saveTaskEdit(taskId);
  if (action === 'cancel') cancelTaskEdit(taskId);
}

// Tab Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Timer Functions
async function startTimer() {
  await showSmartNotification('workStart');
  isRunning = true;
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'block';
  document.getElementById('skip-btn').style.display = 'block';

  // Gửi message tới background
  chrome.runtime.sendMessage({ 
    action: 'startTimer', 
    mode: currentMode,
    timeLeft: timeLeft 
  });

  // Bật nhạc nếu được bật
  const settings = await loadSettings();
  if (settings.musicEnabled) {
    startBackgroundMusic();
  }

  updateTimerDisplay();
}

function pauseTimer() {
  isRunning = false;
  document.getElementById('start-btn').style.display = 'block';
  document.getElementById('pause-btn').style.display = 'none';

  chrome.runtime.sendMessage({ action: 'pauseTimer' });
  
  if (isPlayingMusic) {
    stopBackgroundMusic();
  }
}

function stopTimer() {
  isRunning = false;
  document.getElementById('start-btn').style.display = 'block';
  document.getElementById('pause-btn').style.display = 'none';
  document.getElementById('skip-btn').style.display = 'none';

  chrome.runtime.sendMessage({ action: 'stopTimer' });
  
  if (isPlayingMusic) {
    stopBackgroundMusic();
  }

  resetTimer();
  closeFloatingTimer();
}

function skipSession() {
  chrome.runtime.sendMessage({ action: 'skipSession' });
  nextSession();
}

function resetTimer() {
  chrome.storage.local.get(['workDuration'], (result) => {
    timeLeft = (result.workDuration || 25) * 60;
    currentMode = 'work';
    updateTimerDisplay();
  });
}

function nextSession() {
  if (currentMode === 'work') {
    pomodoroCount++;
    savePomodoroCount();
    
    // Sau 4 pomodoro thì nghỉ dài
    if (pomodoroCount % 4 === 0) {
      currentMode = 'longBreak';
      chrome.storage.local.get(['longBreak'], (result) => {
        timeLeft = (result.longBreak || 15) * 60;
        updateTimerDisplay();
      });
    } else {
      currentMode = 'shortBreak';
      chrome.storage.local.get(['shortBreak'], (result) => {
        timeLeft = (result.shortBreak || 5) * 60;
        updateTimerDisplay();
      });
    }
  } else {
    currentMode = 'work';
    chrome.storage.local.get(['workDuration'], (result) => {
      timeLeft = (result.workDuration || 25) * 60;
      updateTimerDisplay();
    });
  }

  // Auto start nếu được bật
  chrome.storage.local.get(['autoStart'], (result) => {
    if (result.autoStart) {
      startTimer();
    }
  });
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  document.getElementById('timer').textContent = timeString;
  
  // Update label và màu sắc
  const timerElement = document.getElementById('timer');
  const labelElement = document.getElementById('timer-label');
  const modeText = document.getElementById('mode-text');
  const modeBadge = document.getElementById('mode-badge');
  
  timerElement.classList.remove('break', 'long-break');
  modeBadge.classList.remove('ultra');
  
  if (currentMode === 'work') {
    labelElement.textContent = 'Thời gian tập trung! ⚡';
    modeText.textContent = 'Chế độ làm việc';
    
    chrome.storage.local.get(['ultraFocus'], (result) => {
      if (result.ultraFocus) {
        modeBadge.classList.add('ultra');
        modeText.textContent = 'Siêu tập trung 🔥';
      }
    });
  } else if (currentMode === 'shortBreak') {
    timerElement.classList.add('break');
    labelElement.textContent = 'Nghỉ ngắn! ☕';
    modeText.textContent = 'Chế độ nghỉ ngắn';
  } else {
    timerElement.classList.add('long-break');
    labelElement.textContent = 'Nghỉ dài! 🌙';
    modeText.textContent = 'Chế độ nghỉ dài';
  }

  // Update session info
  const sessionInfo = document.getElementById('session-info');
  if (isRunning) {
    sessionInfo.textContent = `Phiên ${pomodoroCount + 1} - ${currentMode === 'work' ? 'Tập trung' : 'Nghỉ ngơi'}`;
  } else {
    sessionInfo.textContent = 'Bắt đầu phiên làm việc mới!';
  }
}

// Sync với background
function syncTimerWithBackground() {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    if (response) {
      timeLeft = response.timeLeft;
      currentMode = response.mode;
      isRunning = response.isRunning;
      
      updateTimerDisplay();
      
      if (isRunning) {
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'block';
        document.getElementById('skip-btn').style.display = 'block';
      }
    }
  });

  // Lắng nghe updates từ background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'timerUpdate') {
      timeLeft = message.timeLeft;
      updateTimerDisplay();
      
      // Cập nhật focus time
      if (currentMode === 'work') {
        totalFocusTime++;
        updateFocusTimeDisplay();
      }
    } else if (message.action === 'sessionComplete') {
      nextSession();
    }
  });
}

// Settings
async function loadSettings() {
  return new Promise((resolve) => {
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
      musicVolume: 50
    }, (settings) => {
      document.getElementById('work-duration').value = settings.workDuration;
      document.getElementById('short-break').value = settings.shortBreak;
      document.getElementById('long-break').value = settings.longBreak;
      document.getElementById('notification-enabled').checked = settings.notificationEnabled;
      document.getElementById('notification-sound').value = settings.notificationSound;
      document.getElementById('notification-volume').value = settings.notificationVolume;
      document.getElementById('notification-volume-display').textContent = settings.notificationVolume;
      document.getElementById('ultra-focus').checked = settings.ultraFocus;
      document.getElementById('auto-start').checked = settings.autoStart;
      document.getElementById('music-enabled').checked = settings.musicEnabled;
      document.getElementById('music-select').value = settings.musicSelect;
      document.getElementById('music-volume').value = settings.musicVolume;
      document.getElementById('volume-display').textContent = settings.musicVolume;
      
      resolve(settings);
    });
  });
}

function saveSettings() {
  const settings = {
    workDuration: parseInt(document.getElementById('work-duration').value),
    shortBreak: parseInt(document.getElementById('short-break').value),
    longBreak: parseInt(document.getElementById('long-break').value),
    notificationEnabled: document.getElementById('notification-enabled').checked,
    notificationSound: document.getElementById('notification-sound').value,
    notificationVolume: parseInt(document.getElementById('notification-volume').value),
    ultraFocus: document.getElementById('ultra-focus').checked,
    autoStart: document.getElementById('auto-start').checked,
    musicEnabled: document.getElementById('music-enabled').checked,
    musicSelect: document.getElementById('music-select').value,
    musicVolume: parseInt(document.getElementById('music-volume').value)
  };

  chrome.storage.local.set(settings);
  
  // Cập nhật timer nếu không đang chạy
  if (!isRunning && currentMode === 'work') {
    timeLeft = settings.workDuration * 60;
    updateTimerDisplay();
  }

  chrome.runtime.sendMessage({ action: 'updateSettings', settings: settings });
}

function updateVolumeDisplay() {
  const volume = document.getElementById('notification-volume').value;
  document.getElementById('notification-volume-display').textContent = volume;
}

function updateMusicVolumeDisplay() {
  const volume = document.getElementById('music-volume').value;
  document.getElementById('volume-display').textContent = volume;
}

// Stats
async function loadStats() {
  chrome.storage.local.get(['pomodoroCount', 'totalFocusTime'], (result) => {
    pomodoroCount = result.pomodoroCount || 0;
    totalFocusTime = result.totalFocusTime || 0;
    
    document.getElementById('pomodoro-count').textContent = pomodoroCount;
    updateFocusTimeDisplay();
  });
}

function savePomodoroCount() {
  chrome.storage.local.set({ pomodoroCount: pomodoroCount });
  document.getElementById('pomodoro-count').textContent = pomodoroCount;
}

function updateFocusTimeDisplay() {
  const hours = Math.floor(totalFocusTime / 3600);
  const minutes = Math.floor((totalFocusTime % 3600) / 60);
  document.getElementById('focus-time').textContent = `${hours}h ${minutes}m`;
  
  chrome.storage.local.set({ totalFocusTime: totalFocusTime });
}

// Music Functions
function toggleMusic() {
  const enabled = document.getElementById('music-enabled').checked;
  chrome.storage.local.set({ musicEnabled: enabled });
  
  if (enabled && isRunning) {
    startBackgroundMusic();
  } else if (!enabled && isPlayingMusic) {
    stopBackgroundMusic();
  }
}

function changeMusic() {
  const musicType = document.getElementById('music-select').value;
  chrome.storage.local.set({ musicSelect: musicType });
  
  if (isPlayingMusic) {
    stopBackgroundMusic();
    startBackgroundMusic();
  }
}

function changeMusicVolume() {
  const volume = parseInt(document.getElementById('music-volume').value);
  chrome.storage.local.set({ musicVolume: volume });
  
  if (musicGainNode) {
    musicGainNode.gain.value = volume / 100;
  }
}

async function previewMusic() {
  if (isPlayingMusic) {
    stopBackgroundMusic();
    document.getElementById('preview-music').textContent = '🎵 Nghe thử';
  } else {
    await startBackgroundMusic();
    document.getElementById('preview-music').textContent = isPlayingMusic ? '⏹ Dừng' : '🎵 Nghe thử';
  }
}

async function startBackgroundMusic() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const musicType = document.getElementById('music-select').value;
    const volume = parseInt(document.getElementById('music-volume').value);

    // Tạo oscillator để tạo âm thanh đơn giản (thay cho file nhạc thật)
    const oscillator = audioContext.createOscillator();
    musicGainNode = audioContext.createGain();
    
    oscillator.connect(musicGainNode);
    musicGainNode.connect(audioContext.destination);
    
    // Thiết lập tần số dựa trên loại nhạc
    const frequencies = {
      lofi: 220,
      piano: 440,
      nature: 330,
      rain: 110,
      cafe: 277,
      ocean: 165
    };
    
    oscillator.frequency.value = frequencies[musicType] || 220;
    oscillator.type = 'sine';
    musicGainNode.gain.value = volume / 100 * 0.1; // Giảm âm lượng để êm hơn
    
    oscillator.start();
    musicSource = oscillator;
    isPlayingMusic = true;

    console.log('Music started:', musicType);
  } catch (error) {
    console.error('Error starting music:', error);
  }
}

function stopBackgroundMusic() {
  if (musicSource) {
    musicSource.stop();
    musicSource = null;
    isPlayingMusic = false;
  }
  
  if (document.getElementById('preview-music')) {
    document.getElementById('preview-music').textContent = '🎵 Nghe thử';
  }
}

// Site Blocking
function switchSiteMode(mode) {
  document.querySelectorAll('.site-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.site-mode').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.getElementById(`${mode}-mode`).classList.add('active');
}

async function loadBlockedSites() {
  chrome.storage.local.get(['blacklist', 'whitelist'], (result) => {
    const blacklist = result.blacklist || [];
    const whitelist = result.whitelist || [];
    
    renderSiteList('blacklist', blacklist);
    renderSiteList('whitelist', whitelist);
  });
}

function renderSiteList(type, sites) {
  const container = document.getElementById(type);
  if (!container) return;
  container.innerHTML = '';
  
  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-state">Chưa có website nào</div>';
    return;
  }
  
  sites.forEach(site => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span>${site}</span>
      <button type="button" data-site-action="remove" data-site-type="${type}" data-site-value="${site}" title="Xóa">×</button>
    `;
    container.appendChild(item);
  });
}

function addSite(type) {
  const input = document.getElementById(`${type}-input`);
  const site = input.value.trim().toLowerCase();
  
  if (!site) return;
  
  // Validate domain
  if (!isValidDomain(site)) {
    alert('Vui lòng nhập domain hợp lệ (vd: facebook.com)');
    return;
  }
  
  chrome.storage.local.get([type], (result) => {
    const sites = result[type] || [];
    
    if (sites.includes(site)) {
      alert('Website này đã có trong danh sách!');
      return;
    }
    
    sites.push(site);
    chrome.storage.local.set({ [type]: sites });
    
    renderSiteList(type, sites);
    input.value = '';
    
    // Thông báo cho background
    chrome.runtime.sendMessage({ action: 'updateBlockedSites' });
  });
}

function removeSite(type, site) {
  chrome.storage.local.get([type], (result) => {
    const sites = result[type] || [];
    const index = sites.indexOf(site);
    
    if (index > -1) {
      sites.splice(index, 1);
      chrome.storage.local.set({ [type]: sites });
      renderSiteList(type, sites);
      
      chrome.runtime.sendMessage({ action: 'updateBlockedSites' });
    }
  });
}

function addPresetSite(site) {
  chrome.storage.local.get(['blacklist'], (result) => {
    const sites = result.blacklist || [];
    
    if (sites.includes(site)) {
      alert('Website này đã có trong danh sách!');
      return;
    }
    
    sites.push(site);
    chrome.storage.local.set({ blacklist: sites });
    
    renderSiteList('blacklist', sites);
    
    chrome.runtime.sendMessage({ action: 'updateBlockedSites' });
  });
}

function isValidDomain(domain) {
  const pattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return pattern.test(domain);
}

// Expose functions globally for onclick handlers
window.removeSite = removeSite;

// ========== TODO LIST / KANBAN FUNCTIONS ==========

let tasks = [];
let draggedTask = null;

async function loadTodos() {
  chrome.storage.local.get(['tasks'], (result) => {
    tasks = result.tasks || [];
    renderAllTasks();
    updateTaskStats();
    setupDragAndDrop();
  });
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  
  if (!text) return;
  
  const task = {
    id: Date.now().toString(),
    text: text,
    status: 'todo',
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  tasks.push(task);
  saveTasks();
  renderAllTasks();
  updateTaskStats();
  
  input.value = '';
  input.focus();
}

function renderAllTasks() {
  // Clear all columns
  document.getElementById('todo-tasks').innerHTML = '';
  document.getElementById('inprogress-tasks').innerHTML = '';
  document.getElementById('done-tasks').innerHTML = '';
  
  // Count tasks
  let todoCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;
  
  // Render tasks in appropriate columns
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    const container = document.getElementById(`${task.status}-tasks`);
    container.appendChild(taskElement);
    
    if (task.status === 'todo') todoCount++;
    else if (task.status === 'inprogress') inProgressCount++;
    else if (task.status === 'done') doneCount++;
  });
  
  // Update counts
  document.getElementById('todo-count').textContent = todoCount;
  document.getElementById('inprogress-count').textContent = inProgressCount;
  document.getElementById('done-count').textContent = doneCount;
  
  // Show empty states
  if (todoCount === 0) {
    document.getElementById('todo-tasks').innerHTML = '<div class="task-empty">Không có việc nào</div>';
  }
  if (inProgressCount === 0) {
    document.getElementById('inprogress-tasks').innerHTML = '<div class="task-empty">Chưa có việc đang làm</div>';
  }
  if (doneCount === 0) {
    document.getElementById('done-tasks').innerHTML = '<div class="task-empty">Chưa hoàn thành việc nào</div>';
  }
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  div.draggable = true;
  div.dataset.id = task.id;
  
  const timeAgo = getTimeAgo(task.createdAt);
  
  div.innerHTML = `
    <div class="task-header">
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-time">${timeAgo}</div>
      </div>
      <div class="task-actions">
        <button type="button" class="task-btn edit-btn" data-task-action="edit" data-task-id="${task.id}" title="Sửa">&#9998;</button>
        <button type="button" class="task-btn delete-btn" data-task-action="delete" data-task-id="${task.id}" title="Xóa">&#128465;</button>
      </div>
    </div>
  `;
  
  // Drag events
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);
  
  return div;
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-tasks');
  
  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
  });
}

function handleDragStart(e) {
  draggedTask = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // Remove drag-over class from all columns
  document.querySelectorAll('.kanban-tasks').forEach(column => {
    column.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  if (e.target === this) {
    this.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  this.classList.remove('drag-over');
  
  if (draggedTask) {
    const taskId = draggedTask.dataset.id;
    const newStatus = this.dataset.status;
    
    // Update task status
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      
      // Set completed time if moved to done
      if (newStatus === 'done' && !task.completedAt) {
        task.completedAt = new Date().toISOString();
      } else if (newStatus !== 'done') {
        task.completedAt = null;
      }
      
      saveTasks();
      renderAllTasks();
      updateTaskStats();
    }
  }
  
  return false;
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const taskCard = document.querySelector(`[data-id="${taskId}"]`);
  if (!taskCard) return;
  
  taskCard.classList.add('editing');
  taskCard.innerHTML = `
    <input type="text" class="task-edit-input" value="${escapeHtml(task.text)}" id="edit-input-${taskId}">
    <div class="task-edit-actions">
      <button type="button" class="save-btn" data-task-action="save" data-task-id="${taskId}">Lưu</button>
      <button type="button" class="cancel-btn" data-task-action="cancel" data-task-id="${taskId}">Hủy</button>
    </div>
  `;
  
  const input = document.getElementById(`edit-input-${taskId}`);
  input.focus();
  input.select();
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveTaskEdit(taskId);
    if (e.key === 'Escape') cancelTaskEdit(taskId);
  });
}

function saveTaskEdit(taskId) {
  const input = document.getElementById(`edit-input-${taskId}`);
  const newText = input.value.trim();
  
  if (!newText) {
    alert('Nội dung công việc không được để trống!');
    return;
  }
  
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.text = newText;
    saveTasks();
    renderAllTasks();
  }
}

function cancelTaskEdit(taskId) {
  renderAllTasks();
}

function deleteTask(taskId) {
  if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
  
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  renderAllTasks();
  updateTaskStats();
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.status === 'done').length;
  
  if (completedCount === 0) {
    alert('Không có công việc đã hoàn thành nào!');
    return;
  }
  
  if (!confirm(`Xóa ${completedCount} công việc đã hoàn thành?`)) return;
  
  tasks = tasks.filter(t => t.status !== 'done');
  saveTasks();
  renderAllTasks();
  updateTaskStats();
}

function clearAllTasks() {
  if (tasks.length === 0) {
    alert('Danh sách công việc đã trống!');
    return;
  }
  
  if (!confirm(`Xóa tất cả ${tasks.length} công việc?`)) return;
  
  tasks = [];
  saveTasks();
  renderAllTasks();
  updateTaskStats();
}

function saveTasks() {
  chrome.storage.local.set({ tasks: tasks });
}

function updateTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  document.getElementById('total-tasks').textContent = total;
  document.getElementById('completed-tasks').textContent = completed;
  document.getElementById('progress-percentage').textContent = percentage + '%';
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
  if (seconds < 604800) return Math.floor(seconds / 86400) + ' ngày trước';
  
  return date.toLocaleDateString('vi-VN');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Expose todo functions globally
window.editTask = editTask;
window.saveTaskEdit = saveTaskEdit;
window.cancelTaskEdit = cancelTaskEdit;
window.deleteTask = deleteTask;
// ============================================
// POMODORO GRANDE PRO - UPGRADED FEATURES
// Part 2: Journal / Notes System
// ============================================

// Global variables for journal
let journalEntries = [];
let currentFilter = 'all';

// ============================================
// JOURNAL CORE FUNCTIONS
// ============================================

async function loadJournalEntries() {
  const result = await chrome.storage.local.get(['journalEntries']);
  journalEntries = result.journalEntries || [];
  renderJournalEntries();
  updateJournalStats();
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries');
  const emptyState = document.getElementById('journal-empty');
  
  if (!container) return;
  
  // Filter entries
  const filteredEntries = filterEntries(journalEntries, currentFilter);
  
  // Show/hide empty state
  if (filteredEntries.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  emptyState.style.display = 'none';
  
  // Clear container
  container.innerHTML = '';
  
  // Render entries (newest first)
  filteredEntries.reverse().forEach(entry => {
    const entryElement = createJournalEntry(entry);
    container.appendChild(entryElement);
  });
}

function createJournalEntry(entry) {
  const div = document.createElement('div');
  div.className = 'journal-entry';
  div.dataset.id = entry.id;
  
  const date = new Date(entry.timestamp);
  const formattedDate = formatDate(date);
  const timeAgo = getTimeAgo(entry.timestamp);
  
  div.innerHTML = `
    <div class="entry-header">
      <div class="entry-date">
        📅 ${formattedDate} <span style="opacity: 0.7">(${timeAgo})</span>
      </div>
      <div class="entry-actions">
        <button type="button" class="entry-btn" data-journal-action="edit" data-entry-id="${entry.id}" title="Sửa">&#9998;</button>
        <button type="button" class="entry-btn" data-journal-action="delete" data-entry-id="${entry.id}" title="Xóa">&#128465;</button>
      </div>
    </div>
    <div class="entry-content">${escapeHtml(entry.content)}</div>
    <div class="entry-stats">
      <span>🍅 Pomodoro #${entry.pomodoroNumber || 'N/A'}</span>
      ${entry.taskName ? `<span>📝 ${escapeHtml(entry.taskName)}</span>` : ''}
      ${entry.mood ? `<span>${getMoodEmoji(entry.mood)}</span>` : ''}
    </div>
  `;
  
  return div;
}

function filterEntries(entries, filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  switch (filter) {
    case 'today':
      return entries.filter(e => new Date(e.timestamp) >= today);
    case 'week':
      return entries.filter(e => new Date(e.timestamp) >= weekAgo);
    case 'month':
      return entries.filter(e => new Date(e.timestamp) >= monthAgo);
    default:
      return entries;
  }
}

function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('vi-VN', options);
}

function getMoodEmoji(mood) {
  const moods = {
    great: '😄 Tuyệt vời',
    good: '😊 Tốt',
    okay: '😐 Bình thường',
    bad: '😔 Không tốt'
  };
  return moods[mood] || '';
}

// ============================================
// JOURNAL ACTIONS
// ============================================

async function saveJournalNote() {
  const input = document.getElementById('quick-note-input');
  const content = input.value.trim();
  
  if (!content) {
    showToast('⚠️ Vui lòng nhập nội dung ghi chú!');
    return;
  }
  
  // Get current stats
  const stats = await chrome.storage.local.get(['pomodoroCount']);
  
  const entry = {
    id: generateId(),
    content: content,
    timestamp: new Date().toISOString(),
    pomodoroNumber: stats.pomodoroCount || 0,
    taskName: null, // Could link to current task
    mood: null // Could add mood selector
  };
  
  journalEntries.push(entry);
  
  // Save to storage
  await chrome.storage.local.set({ journalEntries: journalEntries });
  
  // Clear input
  input.value = '';
  updateCharCount();
  
  // Re-render
  renderJournalEntries();
  updateJournalStats();
  
  // Success feedback
  showToast('✅ Đã lưu ghi chú!');
  
  // Flash animation
  const entries = document.getElementById('journal-entries');
  if (entries) {
    entries.classList.add('success-flash');
    setTimeout(() => entries.classList.remove('success-flash'), 500);
  }
}

async function editJournalEntry(entryId) {
  const entry = journalEntries.find(e => e.id === entryId);
  if (!entry) return;
  
  const newContent = prompt('Sửa ghi chú:', entry.content);
  
  if (newContent !== null && newContent.trim()) {
    entry.content = newContent.trim();
    entry.edited = true;
    entry.editedAt = new Date().toISOString();
    
    await chrome.storage.local.set({ journalEntries: journalEntries });
    renderJournalEntries();
    showToast('✅ Đã cập nhật ghi chú!');
  }
}

async function deleteJournalEntry(entryId) {
  if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
  
  journalEntries = journalEntries.filter(e => e.id !== entryId);
  await chrome.storage.local.set({ journalEntries: journalEntries });
  
  renderJournalEntries();
  updateJournalStats();
  showToast('🗑️ Đã xóa ghi chú!');
}

// ============================================
// JOURNAL PROMPT (AUTO)
// ============================================

function showJournalPrompt() {
  // Switch to journal tab
  switchTab('journal');
  
  // Focus on input
  const input = document.getElementById('quick-note-input');
  if (input) {
    input.focus();
    input.placeholder = '✍️ Bạn vừa hoàn thành gì? Hãy ghi lại nhé!';
  }
  
  // Show toast
  showToast('📝 Đã đến lúc ghi chú! Bạn vừa làm gì trong phiên vừa rồi?', 5000);
}

// ============================================
// EXPORT JOURNAL
// ============================================

async function exportJournal() {
  if (journalEntries.length === 0) {
    showToast('⚠️ Chưa có ghi chú nào để xuất!');
    return;
  }
  
  // Create text content
  let content = '# NHẬT KÝ POMODORO\n\n';
  content += `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}\n`;
  content += `Tổng số ghi chú: ${journalEntries.length}\n\n`;
  content += '---\n\n';
  
  journalEntries.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    content += `## Ghi chú #${index + 1}\n`;
    content += `**Ngày:** ${formatDate(date)}\n`;
    content += `**Pomodoro:** #${entry.pomodoroNumber || 'N/A'}\n`;
    if (entry.taskName) {
      content += `**Công việc:** ${entry.taskName}\n`;
    }
    content += `\n${entry.content}\n\n`;
    content += '---\n\n';
  });
  
  // Create download
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pomodoro-journal-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📤 Đã xuất nhật ký!');
}

// ============================================
// JOURNAL FILTERS
// ============================================

function setupJournalFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Re-render
      renderJournalEntries();
    });
  });
}

// ============================================
// CHARACTER COUNTER
// ============================================

function updateCharCount() {
  const input = document.getElementById('quick-note-input');
  const counter = document.getElementById('note-char-count');
  
  if (input && counter) {
    const count = input.value.length;
    counter.textContent = `${count}/500`;
    
    // Change color if near limit
    if (count > 450) {
      counter.style.color = 'var(--danger-color)';
    } else {
      counter.style.color = 'var(--text-secondary)';
    }
  }
}

function setupCharCounter() {
  const input = document.getElementById('quick-note-input');
  if (input) {
    input.addEventListener('input', updateCharCount);
  }
}

// ============================================
// JOURNAL STATS
// ============================================

function updateJournalStats() {
  // Could add stats like:
  // - Total notes this week
  // - Most productive day
  // - Average notes per day
  // etc.
  
  // For now, just update count in UI if needed
  const today = new Date().toDateString();
  const todayEntries = journalEntries.filter(e => 
    new Date(e.timestamp).toDateString() === today
  );
  
  // Could display somewhere: `Hôm nay: ${todayEntries.length} ghi chú`
}

// ============================================
// JOURNAL EVENT LISTENERS
// ============================================

function setupJournalListeners() {
  const journalTab = document.getElementById('journal-tab');
  if (journalTab) {
    journalTab.addEventListener('click', handleJournalActionClick);
  }

  // Save note button
  const saveBtn = document.getElementById('save-note-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveJournalNote);
  }
  
  // Enter key to save (Ctrl+Enter)
  const input = document.getElementById('quick-note-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        saveJournalNote();
      }
    });
  }
  
  // Export button
  const exportBtn = document.getElementById('export-journal-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportJournal);
  }
  
  // Filters
  setupJournalFilters();
  
  // Character counter
  setupCharCounter();
}

function handleJournalActionClick(e) {
  const btn = e.target.closest('button[data-journal-action]');
  if (!btn) return;

  const action = btn.dataset.journalAction;
  const entryId = btn.dataset.entryId;
  if (!action || !entryId) return;

  if (action === 'edit') {
    editJournalEntry(entryId);
  } else if (action === 'delete') {
    deleteJournalEntry(entryId);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTimeAgo(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
  if (seconds < 604800) return Math.floor(seconds / 86400) + ' ngày trước';
  if (seconds < 2592000) return Math.floor(seconds / 604800) + ' tuần trước';
  
  return Math.floor(seconds / 2592000) + ' tháng trước';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

// Add to DOMContentLoaded
async function initializeJournal() {
  await loadJournalEntries();
  setupJournalListeners();
}

// Export functions
window.editJournalEntry = editJournalEntry;
window.deleteJournalEntry = deleteJournalEntry;
window.saveJournalNote = saveJournalNote;
window.exportJournal = exportJournal;
window.showJournalPrompt = showJournalPrompt;



// ============================================
// CUSTOM PRESET MODAL
// ============================================

let customPreset = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
};

function setupCustomPresetListeners() {
  // Open modal when clicking custom preset
  document.querySelector('[data-preset="custom"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCustomPresetModal();
  });
  
  // Modal controls
  document.getElementById('close-custom-modal')?.addEventListener('click', closeCustomPresetModal);
  document.getElementById('cancel-custom-btn')?.addEventListener('click', closeCustomPresetModal);
  document.getElementById('save-custom-btn')?.addEventListener('click', saveCustomPreset);
  
  // Update preview on input
  ['custom-work-input', 'custom-short-input', 'custom-long-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateCustomPreview);
  });
  
  // Close modal on outside click
  document.getElementById('custom-preset-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'custom-preset-modal') {
      closeCustomPresetModal();
    }
  });
}

async function loadCustomPreset() {
  const data = await chrome.storage.local.get(['customPreset']);
  if (data.customPreset) {
    customPreset = data.customPreset;
    timerPresets.custom.work = customPreset.work;
    timerPresets.custom.shortBreak = customPreset.shortBreak;
    timerPresets.custom.longBreak = customPreset.longBreak;
    
    // Update display
    const timeDisplay = document.getElementById('custom-preset-time');
    if (timeDisplay) {
      timeDisplay.textContent = `${customPreset.work}/${customPreset.shortBreak}/${customPreset.longBreak}`;
    }
  }
}

function openCustomPresetModal() {
  const modal = document.getElementById('custom-preset-modal');
  modal.classList.add('active');
  
  // Load current values
  document.getElementById('custom-work-input').value = customPreset.work;
  document.getElementById('custom-short-input').value = customPreset.shortBreak;
  document.getElementById('custom-long-input').value = customPreset.longBreak;
  
  updateCustomPreview();
}

function closeCustomPresetModal() {
  const modal = document.getElementById('custom-preset-modal');
  modal.classList.remove('active');
}

function updateCustomPreview() {
  const work = document.getElementById('custom-work-input').value || 25;
  const short = document.getElementById('custom-short-input').value || 5;
  const long = document.getElementById('custom-long-input').value || 15;
  
  document.getElementById('custom-preview-text').textContent = `${work}/${short}/${long}`;
}

async function saveCustomPreset() {
  const work = parseInt(document.getElementById('custom-work-input').value);
  const shortBreak = parseInt(document.getElementById('custom-short-input').value);
  const longBreak = parseInt(document.getElementById('custom-long-input').value);
  
  // Validate
  if (!work || work < 1 || work > 180) {
    alert('Thời gian làm việc phải từ 1-180 phút');
    return;
  }
  if (!shortBreak || shortBreak < 1 || shortBreak > 60) {
    alert('Thời gian nghỉ ngắn phải từ 1-60 phút');
    return;
  }
  if (!longBreak || longBreak < 1 || longBreak > 120) {
    alert('Thời gian nghỉ dài phải từ 1-120 phút');
    return;
  }
  
  // Save
  customPreset = { work, shortBreak, longBreak };
  timerPresets.custom.work = work;
  timerPresets.custom.shortBreak = shortBreak;
  timerPresets.custom.longBreak = longBreak;
  
  await chrome.storage.local.set({ customPreset });
  
  // Update display
  document.getElementById('custom-preset-time').textContent = `${work}/${shortBreak}/${longBreak}`;
  
  // Apply preset
  applyPreset('custom');
  
  closeCustomPresetModal();
  
  showToast('✅ Đã lưu cài đặt Custom');
}

// ============================================
// FLOATING TIMER WINDOW
// ============================================

async function sendFloatingStripMessage(action) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (!tabs || tabs.length === 0) return;

  await Promise.all(
    tabs
      .filter(tab => tab.id)
      .map(tab =>
        chrome.tabs.sendMessage(tab.id, { action }).catch(() => {})
      )
  );
}

async function openFloatingTimer() {
  await sendFloatingStripMessage('showTimerStrip');
}

function closeFloatingTimer() {
  sendFloatingStripMessage('hideTimerStrip');
}

// Override startTimer to open floating window
const originalStartTimer = startTimer;
startTimer = async function() {
  await originalStartTimer.apply(this, arguments);
  await openFloatingTimer();
};

// ============================================
// INITIALIZE CUSTOM PRESET
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  setupCustomPresetListeners();
  await loadCustomPreset();
});

