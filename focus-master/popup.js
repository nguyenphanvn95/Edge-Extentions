// Focus Master Pro - Main Script
// Storage Keys
const KEYS = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  STATS: 'stats',
  SETTINGS: 'settings',
  STREAK: 'streak',
  BADGES: 'badges'
};

// Default Settings
const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  dailyGoal: 8,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true
};

// State
let state = {
  tasks: [],
  projects: [],
  stats: null,
  settings: { ...DEFAULT_SETTINGS },
  currentFilter: 'all',
  currentTaskId: null,
  currentPeriod: 'today',
  streak: 0,
  badges: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  initializeTabs();
  initializeTimer();
  initializeTasks();
  initializeProjects();
  initializeAnalytics();
  initializeInsights();
  initializeSettings();
  startTimerSync();
});

// Load Data
async function loadAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(Object.values(KEYS), (result) => {
      state.tasks = result[KEYS.TASKS] || [];
      state.projects = result[KEYS.PROJECTS] || getDefaultProjects();
      state.stats = result[KEYS.STATS] || getDefaultStats();
      state.settings = { ...DEFAULT_SETTINGS, ...(result[KEYS.SETTINGS] || {}) };
      state.streak = result[KEYS.STREAK] || 0;
      state.badges = result[KEYS.BADGES] || [];
      
      // Check and reset stats if new day
      checkAndResetDailyStats();
      
      resolve();
    });
  });
}

function getDefaultProjects() {
  return [
    { id: 'personal', name: 'Personal', color: '#667eea', taskCount: 0 },
    { id: 'work', name: 'Work', color: '#f56565', taskCount: 0 },
    { id: 'learning', name: 'Learning', color: '#48bb78', taskCount: 0 }
  ];
}

function getDefaultStats() {
  return {
    today: { pomodoros: 0, focusTime: 0, tasksCompleted: 0, date: getTodayDate() },
    week: { pomodoros: 0, focusTime: 0, startDate: getWeekStart() },
    month: { pomodoros: 0, focusTime: 0, startDate: getMonthStart() },
    total: { pomodoros: 0, focusTime: 0 },
    history: []
  };
}

function checkAndResetDailyStats() {
  const today = getTodayDate();
  if (state.stats.today.date !== today) {
    // Save yesterday's stats to history
    if (state.stats.today.pomodoros > 0) {
      state.stats.history.push({
        date: state.stats.today.date,
        pomodoros: state.stats.today.pomodoros,
        focusTime: state.stats.today.focusTime,
        tasksCompleted: state.stats.today.tasksCompleted
      });
      
      // Keep only last 90 days
      if (state.stats.history.length > 90) {
        state.stats.history = state.stats.history.slice(-90);
      }
      
      // Update streak
      updateStreak();
    }
    
    state.stats.today = { pomodoros: 0, focusTime: 0, tasksCompleted: 0, date: today };
    saveData(KEYS.STATS);
  }
}

// Tabs
function initializeTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Refresh content based on tab
  if (tabName === 'analytics') updateAnalytics();
  if (tabName === 'insights') updateInsights();
}

// Timer
let timerInterval = null;
let currentTimerState = null;

function initializeTimer() {
  // Mode buttons
  document.querySelectorAll('.mode-btn-pro').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      chrome.runtime.sendMessage({ action: 'switchMode', mode });
    });
  });
  
  // Control buttons
  document.getElementById('start-btn').addEventListener('click', startTimer);
  document.getElementById('pause-btn').addEventListener('click', pauseTimer);
  document.getElementById('resume-btn').addEventListener('click', resumeTimer);
  document.getElementById('stop-btn').addEventListener('click', stopTimer);
  document.getElementById('skip-btn').addEventListener('click', skipTimer);
  
  // Select task button
  document.getElementById('select-task-btn').addEventListener('click', showTaskSelector);
  
  // Update timer displays
  updateTimerDisplays();
}

function startTimerSync() {
  timerInterval = setInterval(() => {
    chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
      if (response) {
        currentTimerState = response;
        updateTimerUI();
        updateProgressCircle();
      }
    });
  }, 100);
}

function updateTimerUI() {
  if (!currentTimerState) return;
  
  const minutes = Math.floor(currentTimerState.currentTime / 60);
  const seconds = currentTimerState.currentTime % 60;
  document.getElementById('timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  document.getElementById('session-count').textContent = currentTimerState.pomodoroCount + 1;
  
  // Update label
  const labels = {
    work: currentTimerState.isRunning ? 'Stay Focused!' : 'Ready to Focus',
    shortBreak: currentTimerState.isRunning ? 'Take a Break' : 'Break Time',
    longBreak: currentTimerState.isRunning ? 'Long Break' : 'Relax Time'
  };
  document.getElementById('timer-label').textContent = labels[currentTimerState.mode];
  
  // Update buttons
  updateTimerButtons();
  
  // Update mode buttons
  updateModeButtons();
}

function updateTimerButtons() {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  
  if (currentTimerState.isRunning && !currentTimerState.isPaused) {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
  } else if (currentTimerState.isRunning && currentTimerState.isPaused) {
    startBtn.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
  } else {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
  }
}

function updateModeButtons() {
  document.querySelectorAll('.mode-btn-pro').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === currentTimerState.mode);
  });
}

function updateProgressCircle() {
  if (!currentTimerState) return;
  
  const totalTime = state.settings[
    currentTimerState.mode === 'work' ? 'workDuration' :
    currentTimerState.mode === 'shortBreak' ? 'shortBreak' : 'longBreak'
  ] * 60;
  
  const progress = (totalTime - currentTimerState.currentTime) / totalTime;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const offset = circumference * (1 - progress);
  
  const circle = document.getElementById('progress-circle');
  if (circle) {
    circle.style.strokeDashoffset = offset;
  }
}

function updateTimerDisplays() {
  document.getElementById('work-time').textContent = `${state.settings.workDuration}m`;
  document.getElementById('short-time').textContent = `${state.settings.shortBreak}m`;
  document.getElementById('long-time').textContent = `${state.settings.longBreak}m`;
}

function startTimer() {
  chrome.runtime.sendMessage({ 
    action: 'startTimer', 
    taskId: state.currentTaskId 
  });
}

function pauseTimer() {
  chrome.runtime.sendMessage({ action: 'pauseTimer' });
}

function resumeTimer() {
  chrome.runtime.sendMessage({ action: 'startTimer' });
}

function stopTimer() {
  chrome.runtime.sendMessage({ action: 'stopTimer' });
}

function skipTimer() {
  chrome.runtime.sendMessage({ action: 'skipTimer' });
}

function showTaskSelector() {
  // Simple implementation - just cycle through active tasks
  const activeTasks = state.tasks.filter(t => !t.completed);
  if (activeTasks.length === 0) {
    alert('No active tasks. Add a task first!');
    switchTab('tasks');
    return;
  }
  
  const currentIndex = activeTasks.findIndex(t => t.id === state.currentTaskId);
  const nextIndex = (currentIndex + 1) % activeTasks.length;
  state.currentTaskId = activeTasks[nextIndex].id;
  
  updateCurrentTaskDisplay();
}

function updateCurrentTaskDisplay() {
  const task = state.tasks.find(t => t.id === state.currentTaskId);
  const nameEl = document.getElementById('current-task-name');
  
  if (task) {
    nameEl.textContent = task.text;
  } else {
    nameEl.textContent = 'No task selected';
  }
}

// Tasks
function initializeTasks() {
  document.getElementById('add-task-btn').addEventListener('click', addTask);
  document.getElementById('new-task-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  document.getElementById('clear-completed').addEventListener('click', clearCompleted);
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });
  
  document.getElementById('task-sort').addEventListener('change', renderTasks);
  
  // Populate project dropdown
  updateProjectDropdown();
  
  renderTasks();
}

function addTask() {
  const input = document.getElementById('new-task-input');
  const text = input.value.trim();
  if (!text) return;
  
  const priority = document.getElementById('task-priority').value;
  const projectId = document.getElementById('task-project').value;
  const pomodoros = parseInt(document.getElementById('task-pomodoros').value) || 1;
  
  const task = {
    id: Date.now(),
    text,
    priority,
    projectId,
    completed: false,
    pomodorosEstimated: pomodoros,
    pomodorosActual: 0,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  state.tasks.unshift(task);
  saveData(KEYS.TASKS);
  renderTasks();
  
  input.value = '';
  document.getElementById('task-pomodoros').value = '1';
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  
  if (task.completed) {
    state.stats.today.tasksCompleted++;
    checkAchievements();
  } else {
    state.stats.today.tasksCompleted = Math.max(0, state.stats.today.tasksCompleted - 1);
  }
  
  saveData(KEYS.TASKS);
  saveData(KEYS.STATS);
  renderTasks();
  updateQuickStats();
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveData(KEYS.TASKS);
  renderTasks();
}

function clearCompleted() {
  if (!confirm('Clear all completed tasks?')) return;
  state.tasks = state.tasks.filter(t => !t.completed);
  saveData(KEYS.TASKS);
  renderTasks();
}

function renderTasks() {
  let tasks = [...state.tasks];
  
  // Filter
  if (state.currentFilter === 'active') {
    tasks = tasks.filter(t => !t.completed);
  } else if (state.currentFilter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }
  
  // Sort
  const sortBy = document.getElementById('task-sort').value;
  tasks.sort((a, b) => {
    switch(sortBy) {
      case 'priority':
        const priority = { high: 3, medium: 2, low: 1, none: 0 };
        return priority[b.priority] - priority[a.priority];
      case 'pomodoros':
        return b.pomodorosEstimated - a.pomodorosEstimated;
      case 'name':
        return a.text.localeCompare(b.text);
      default:
        return b.id - a.id;
    }
  });
  
  const listEl = document.getElementById('tasks-list');
  
  if (tasks.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">No tasks yet. Add one to get started!</div>
      </div>
    `;
  } else {
    listEl.innerHTML = tasks.map(task => `
      <div class="task-item-pro ${task.completed ? 'completed' : ''} slide-up">
        <div class="task-header">
          <input type="checkbox" class="task-checkbox-pro" 
                 ${task.completed ? 'checked' : ''}
                 onchange="toggleTask(${task.id})">
          <div class="task-content-pro">
            <div class="task-title-pro">${escapeHtml(task.text)}</div>
            <div class="task-meta">
              ${task.priority !== 'none' ? `<span class="meta-tag priority-${task.priority}">${getPriorityIcon(task.priority)} ${task.priority}</span>` : ''}
              ${task.projectId ? `<span class="meta-tag" style="background: ${getProjectColor(task.projectId)}20; color: ${getProjectColor(task.projectId)}">
                📁 ${getProjectName(task.projectId)}
              </span>` : ''}
              <span class="meta-tag">🍅 ${task.pomodorosActual}/${task.pomodorosEstimated}</span>
            </div>
          </div>
          <div class="task-actions-pro">
            <button class="btn-icon-only" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  updateTaskSummary();
}

function updateTaskSummary() {
  const active = state.tasks.filter(t => !t.completed).length;
  const totalPomo = state.tasks
    .filter(t => !t.completed)
    .reduce((sum, t) => sum + t.pomodorosEstimated, 0);
  
  document.getElementById('active-tasks-count').textContent = 
    `${active} ${active === 1 ? 'task' : 'tasks'}`;
  document.getElementById('total-pomodoros-estimate').textContent = 
    `${totalPomo} 🍅 estimated`;
}

function getPriorityIcon(priority) {
  return { high: '🔴', medium: '🟡', low: '🟢', none: '⚪' }[priority];
}

function getProjectColor(id) {
  const project = state.projects.find(p => p.id === id);
  return project ? project.color : '#667eea';
}

function getProjectName(id) {
  const project = state.projects.find(p => p.id === id);
  return project ? project.name : 'Unknown';
}

// Projects
function initializeProjects() {
  document.getElementById('add-project-btn').addEventListener('click', showProjectModal);
  renderProjects();
}

function showProjectModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('project-modal').classList.remove('hidden');
  
  // Close handlers
  document.querySelector('#project-modal .modal-close').onclick = closeProjectModal;
  document.getElementById('cancel-project').onclick = closeProjectModal;
  document.getElementById('save-project').onclick = saveProject;
  
  // Color picker
  document.querySelectorAll('.color-option').forEach(option => {
    option.onclick = () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    };
  });
}

function closeProjectModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('project-modal').classList.add('hidden');
  document.getElementById('project-name').value = '';
  document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
}

function saveProject() {
  const name = document.getElementById('project-name').value.trim();
  if (!name) return;
  
  const selectedColor = document.querySelector('.color-option.selected');
  const color = selectedColor ? selectedColor.dataset.color : '#667eea';
  
  const project = {
    id: Date.now(),
    name,
    color,
    taskCount: 0
  };
  
  state.projects.push(project);
  saveData(KEYS.PROJECTS);
  renderProjects();
  updateProjectDropdown();
  closeProjectModal();
}

function renderProjects() {
  const gridEl = document.getElementById('projects-grid');
  
  gridEl.innerHTML = state.projects.map(project => {
    const taskCount = state.tasks.filter(t => t.projectId === project.id).length;
    return `
      <div class="project-card">
        <div class="project-color" style="background: ${project.color}"></div>
        <div class="project-name">${escapeHtml(project.name)}</div>
        <div class="project-stats">${taskCount} tasks</div>
      </div>
    `;
  }).join('');
}

function updateProjectDropdown() {
  const select = document.getElementById('task-project');
  select.innerHTML = '<option value="">No Project</option>' +
    state.projects.map(p => 
      `<option value="${p.id}">${escapeHtml(p.name)}</option>`
    ).join('');
}

// Continue in next part...

// Analytics
function initializeAnalytics() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPeriod = btn.dataset.period;
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAnalytics();
    });
  });
  
  updateAnalytics();
}

function updateAnalytics() {
  const periodData = getPeriodData();
  
  document.getElementById('stat-pomodoros').textContent = periodData.pomodoros;
  document.getElementById('stat-focus-time').textContent = formatTime(periodData.focusTime);
  document.getElementById('stat-tasks').textContent = periodData.tasksCompleted || 0;
  document.getElementById('stat-productivity').textContent = 
    calculateProductivity(periodData) + '%';
  
  drawFocusChart();
  updateQuickStats();
}

function getPeriodData() {
  switch(state.currentPeriod) {
    case 'today': return state.stats.today;
    case 'week': return state.stats.week;
    case 'month': return state.stats.month;
    case 'all': return state.stats.total;
    default: return state.stats.today;
  }
}

function calculateProductivity(data) {
  const goal = state.settings.dailyGoal;
  if (goal === 0) return 0;
  return Math.min(100, Math.round((data.pomodoros / goal) * 100));
}

function drawFocusChart() {
  const canvas = document.getElementById('focus-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Get last 7 days data
  const last7Days = getLast7DaysData();
  const maxValue = Math.max(...last7Days.map(d => d.pomodoros), 1);
  
  // Draw bars
  const barWidth = (width - 60) / 7;
  const barSpacing = 10;
  
  last7Days.forEach((day, i) => {
    const barHeight = (day.pomodoros / maxValue) * (height - 40);
    const x = 30 + i * barWidth;
    const y = height - 30 - barHeight;
    
    // Gradient
    const gradient = ctx.createLinearGradient(0, y, 0, height - 30);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + barSpacing / 2, y, barWidth - barSpacing, barHeight);
    
    // Label
    ctx.fillStyle = '#718096';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.label, x + barWidth / 2, height - 10);
    
    // Value
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(day.pomodoros, x + barWidth / 2, y - 5);
  });
}

function getLast7DaysData() {
  const result = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = state.stats.history.find(h => h.date === dateStr) || 
                   (i === 0 ? state.stats.today : { pomodoros: 0 });
    
    result.push({
      label: i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
      pomodoros: dayData.pomodoros || 0
    });
  }
  
  return result;
}

function updateQuickStats() {
  document.getElementById('today-pomos-quick').textContent = state.stats.today.pomodoros;
  document.getElementById('focus-time-quick').textContent = 
    Math.floor(state.stats.today.focusTime / 60) + 'h';
  
  const completionRate = calculateProductivity(state.stats.today);
  document.getElementById('completion-rate-quick').textContent = completionRate + '%';
  
  // Update streak
  document.getElementById('streak-count').textContent = state.streak;
}

// Insights
function initializeInsights() {
  updateInsights();
}

function updateInsights() {
  updatePeakPerformance();
  updateWeeklyProgress();
  updateGoalTracking();
  updateSuggestions();
  updateBadges();
}

function updatePeakPerformance() {
  const history = state.stats.history.slice(-30);
  if (history.length === 0) {
    document.getElementById('insight-peak').textContent = 
      'Complete more pomodoros to discover your peak performance times!';
    return;
  }
  
  const avgPomodoros = history.reduce((sum, h) => sum + h.pomodoros, 0) / history.length;
  const bestDay = history.reduce((best, h) => h.pomodoros > best.pomodoros ? h : best);
  
  document.getElementById('insight-peak').textContent = 
    `Your average is ${avgPomodoros.toFixed(1)} pomodoros per day. Your best day was ${bestDay.pomodoros} pomodoros!`;
}

function updateWeeklyProgress() {
  const thisWeek = state.stats.week.pomodoros;
  const lastWeekData = state.stats.history.slice(-14, -7);
  const lastWeek = lastWeekData.reduce((sum, h) => sum + h.pomodoros, 0);
  
  if (lastWeek === 0) {
    document.getElementById('insight-progress').textContent = 
      `You completed ${thisWeek} pomodoros this week. Keep it up! 🎉`;
  } else {
    const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    document.getElementById('insight-progress').textContent = 
      `You completed ${thisWeek} pomodoros this week - ${Math.abs(change)}% ${change > 0 ? 'more' : 'less'} than last week! ${emoji}`;
  }
}

function updateGoalTracking() {
  const progress = calculateProductivity(state.stats.today);
  document.getElementById('goal-progress').style.width = progress + '%';
  
  const remaining = Math.max(0, state.settings.dailyGoal - state.stats.today.pomodoros);
  if (remaining === 0) {
    document.getElementById('insight-goals').textContent = 
      `🎉 Amazing! You hit your daily goal of ${state.settings.dailyGoal} pomodoros!`;
  } else {
    document.getElementById('insight-goals').textContent = 
      `You're ${remaining} pomodoro${remaining > 1 ? 's' : ''} away from your daily goal!`;
  }
}

function updateSuggestions() {
  const suggestions = [];
  
  if (state.stats.today.pomodoros > 0) {
    const avgTime = state.stats.today.focusTime / state.stats.today.pomodoros;
    if (avgTime > 30) {
      suggestions.push('Consider shorter focus sessions for better concentration');
    } else if (avgTime < 20) {
      suggestions.push('Try longer focus sessions to get into deep work');
    } else {
      suggestions.push('Your focus sessions are well-optimized at 25 minutes');
    }
  }
  
  if (state.tasks.filter(t => !t.completed).length > 10) {
    suggestions.push('You have many tasks. Try breaking them into smaller chunks');
  }
  
  if (state.stats.today.pomodoros >= state.settings.dailyGoal) {
    suggestions.push('Great job hitting your goal! Consider increasing it tomorrow');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Try taking regular breaks to maintain focus');
    suggestions.push('Schedule deep work during your peak hours');
  }
  
  document.getElementById('suggestions-list').innerHTML = 
    suggestions.map(s => `<li>${s}</li>`).join('');
}

function updateBadges() {
  const badges = [
    { id: 'first', name: 'First Pomo', icon: '🌱', earned: state.stats.total.pomodoros >= 1 },
    { id: 'ten', name: '10 Pomodoros', icon: '🔥', earned: state.stats.total.pomodoros >= 10 },
    { id: 'hundred', name: '100 Pomodoros', icon: '💯', earned: state.stats.total.pomodoros >= 100 },
    { id: 'streak3', name: '3 Day Streak', icon: '🔗', earned: state.streak >= 3 },
    { id: 'streak7', name: '7 Day Streak', icon: '⭐', earned: state.streak >= 7 },
    { id: 'streak30', name: '30 Day Streak', icon: '🏆', earned: state.streak >= 30 }
  ];
  
  document.getElementById('badges-grid').innerHTML = badges.map(badge => `
    <div class="badge ${badge.earned ? 'earned' : ''}">
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
    </div>
  `).join('');
}

// Settings
function initializeSettings() {
  const inputs = ['work-duration', 'short-break', 'long-break', 'daily-goal'];
  inputs.forEach(id => {
    const input = document.getElementById(id);
    input.value = state.settings[toCamelCase(id)];
    
    input.addEventListener('change', (e) => {
      const key = toCamelCase(id);
      state.settings[key] = parseInt(e.target.value);
      saveData(KEYS.SETTINGS);
      updateTimerDisplays();
    });
  });
  
  // Adjust buttons
  document.querySelectorAll('.btn-adjust').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const action = btn.dataset.action;
      const currentValue = parseInt(target.value);
      
      if (action === 'increase') {
        target.value = Math.min(parseInt(target.max), currentValue + 1);
      } else {
        target.value = Math.max(parseInt(target.min), currentValue - 1);
      }
      
      target.dispatchEvent(new Event('change'));
    });
  });
  
  // Checkboxes
  ['auto-start-breaks', 'auto-start-pomodoros', 'sound-enabled'].forEach(id => {
    const checkbox = document.getElementById(id);
    checkbox.checked = state.settings[toCamelCase(id)];
    
    checkbox.addEventListener('change', (e) => {
      state.settings[toCamelCase(id)] = e.target.checked;
      saveData(KEYS.SETTINGS);
    });
  });
  
  // Settings toggle
  document.getElementById('settings-toggle').addEventListener('click', () => {
    const panel = document.querySelector('.settings-panel');
    panel.classList.toggle('open');
  });
}

// Achievements
function checkAchievements() {
  const newBadges = [];
  
  // Check for new badges
  if (state.stats.total.pomodoros === 1) {
    newBadges.push('First Pomodoro! 🌱');
  } else if (state.stats.total.pomodoros === 10) {
    newBadges.push('10 Pomodoros! 🔥');
  } else if (state.stats.total.pomodoros === 100) {
    newBadges.push('100 Pomodoros! 💯');
  }
  
  if (newBadges.length > 0) {
    showAchievementNotification(newBadges[0]);
  }
}

function showAchievementNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/logo128.png',
    title: '🏆 Achievement Unlocked!',
    message: message,
    priority: 2
  });
}

// Streak
function updateStreak() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayData = state.stats.history.find(h => h.date === yesterdayStr);
  
  if (yesterdayData && yesterdayData.pomodoros > 0) {
    state.streak++;
  } else if (state.stats.today.pomodoros === 0) {
    state.streak = 0;
  }
  
  saveData(KEYS.STREAK);
}

// Utilities
function saveData(key) {
  const data = {
    [key]: key === KEYS.TASKS ? state.tasks :
           key === KEYS.PROJECTS ? state.projects :
           key === KEYS.STATS ? state.stats :
           key === KEYS.SETTINGS ? state.settings :
           key === KEYS.STREAK ? state.streak :
           state.badges
  };
  
  chrome.storage.local.set(data);
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Make functions globally available
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Add SVG gradient for progress circle
const svg = document.querySelector('.timer-svg');
if (svg) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'gradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '100%');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('style', 'stop-color:#667eea;stop-opacity:1');
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('style', 'stop-color:#764ba2;stop-opacity:1');
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);
}
