// Background Service Worker - PRO Version
let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60,
  mode: 'work',
  pomodoroCount: 0,
  currentTaskId: null,
  sessionStartTime: null
};

let stats = {
  todayStats: {},
  weeklyStats: {},
  monthlyStats: {}
};

// Sound notifications
const sounds = {
  complete: 'audio/Complete.m4a',
  notification: 'audio/Notification.m4a',
  alarm: 'audio/alm_Bell1.mp3'
};

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'getTimerState':
      sendResponse(timerState);
      break;
    case 'startTimer':
      startTimer(request.taskId);
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
    case 'skipTimer':
      skipTimer();
      sendResponse({ success: true });
      break;
    case 'switchMode':
      switchMode(request.mode);
      sendResponse({ success: true });
      break;
    case 'playSound':
      playSound(request.sound);
      sendResponse({ success: true });
      break;
  }
  return true;
});

function startTimer(taskId = null) {
  timerState.isRunning = true;
  timerState.isPaused = false;
  timerState.currentTaskId = taskId;
  timerState.sessionStartTime = Date.now();
  
  chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1/60 });
  
  // Update badge
  updateBadge();
}

function pauseTimer() {
  timerState.isPaused = true;
  chrome.alarms.clear('pomodoroTimer');
  chrome.action.setBadgeText({ text: '⏸' });
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.currentTaskId = null;
  resetTimer();
  chrome.alarms.clear('pomodoroTimer');
  chrome.action.setBadgeText({ text: '' });
}

function skipTimer() {
  completePomodoro();
}

function switchMode(mode) {
  timerState.mode = mode;
  resetTimer();
  if (timerState.isRunning) {
    chrome.alarms.clear('pomodoroTimer');
    startTimer();
  }
}

function resetTimer() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { workDuration: 25, shortBreak: 5, longBreak: 15 };
    const durations = {
      work: settings.workDuration * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60
    };
    timerState.currentTime = durations[timerState.mode];
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer' && timerState.isRunning && !timerState.isPaused) {
    timerState.currentTime--;
    
    updateBadge();
    
    if (timerState.currentTime <= 0) {
      completePomodoro();
    }
  }
});

function completePomodoro() {
  const wasWorkSession = timerState.mode === 'work';
  
  // Play completion sound
  playSound('complete');
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/logo128.png',
    title: wasWorkSession ? '🎉 Work Session Complete!' : '✅ Break Time Over!',
    message: wasWorkSession ? 'Great job! Time for a well-deserved break.' : 'Ready to focus again? Let\'s do this!',
    priority: 2,
    requireInteraction: true
  });
  
  // Update stats if it was a work session
  if (wasWorkSession) {
    timerState.pomodoroCount++;
    updateStats();
    
    // Update task pomodoro count
    if (timerState.currentTaskId) {
      updateTaskPomodoros(timerState.currentTaskId);
    }
  }
  
  // Auto-switch mode
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    
    if (wasWorkSession) {
      if (timerState.pomodoroCount % 4 === 0) {
        timerState.mode = 'longBreak';
      } else {
        timerState.mode = 'shortBreak';
      }
      
      if (settings.autoStartBreaks) {
        resetTimer();
        setTimeout(() => startTimer(), 1000);
        return;
      }
    } else {
      timerState.mode = 'work';
      
      if (settings.autoStartPomodoros) {
        resetTimer();
        setTimeout(() => startTimer(), 1000);
        return;
      }
    }
    
    resetTimer();
    chrome.alarms.clear('pomodoroTimer');
    timerState.isRunning = false;
    chrome.action.setBadgeText({ text: '' });
  });
}

function updateBadge() {
  if (timerState.isRunning && !timerState.isPaused) {
    const minutes = Math.floor(timerState.currentTime / 60);
    chrome.action.setBadgeText({ text: String(minutes) });
    chrome.action.setBadgeBackgroundColor({ color: timerState.mode === 'work' ? '#667eea' : '#48bb78' });
  }
}

function playSound(soundType) {
  // In a real extension, you would use the Audio API
  // For now, we'll just trigger a notification sound
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/logo128.png',
    title: '',
    message: '',
    priority: 0,
    silent: false
  });
}

function updateStats() {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || {
      today: { pomodoros: 0, focusTime: 0, tasksCompleted: 0, date: getTodayDate() },
      week: { pomodoros: 0, focusTime: 0 },
      month: { pomodoros: 0, focusTime: 0 },
      total: { pomodoros: 0, focusTime: 0 }
    };
    
    const today = getTodayDate();
    if (stats.today.date !== today) {
      stats.today = { pomodoros: 0, focusTime: 0, tasksCompleted: 0, date: today };
    }
    
    chrome.storage.local.get(['settings'], (settingsResult) => {
      const workDuration = (settingsResult.settings?.workDuration || 25);
      
      stats.today.pomodoros++;
      stats.today.focusTime += workDuration;
      stats.week.pomodoros++;
      stats.week.focusTime += workDuration;
      stats.month.pomodoros++;
      stats.month.focusTime += workDuration;
      stats.total.pomodoros++;
      stats.total.focusTime += workDuration;
      
      chrome.storage.local.set({ stats });
    });
  });
}

function updateTaskPomodoros(taskId) {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.pomodorosActual = (task.pomodorosActual || 0) + 1;
      chrome.storage.local.set({ tasks });
    }
  });
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Monitor idle state
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' && timerState.isRunning && !timerState.isPaused) {
    // Auto-pause when user is idle
    pauseTimer();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/logo128.png',
      title: '⏸️ Timer Auto-Paused',
      message: 'We noticed you were away. Timer has been paused.',
      priority: 1
    });
  }
});
