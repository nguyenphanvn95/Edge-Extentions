// Floating timer strip
let timerState = {
  isRunning: false,
  timeLeft: 1500,
  totalTime: 1500,
  mode: "work"
};

let refocusTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  syncWithBackground();
  setInterval(syncWithBackground, 1000);
  setupFocusRetention();
});

function setupEventListeners() {
  document.getElementById("floating-pause").addEventListener("click", togglePauseResume);
  document.getElementById("floating-stop").addEventListener("click", stopTimer);
  document.getElementById("close-floating").addEventListener("click", closeWindow);
}

function togglePauseResume() {
  if (timerState.isRunning) {
    chrome.runtime.sendMessage({ action: "pauseTimer" });
    updateControls(false);
    return;
  }

  chrome.runtime.sendMessage({
    action: "startTimer",
    mode: timerState.mode || "work",
    timeLeft: timerState.timeLeft || 1500
  });
  updateControls(true);
}

function stopTimer() {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  updateControls(false);
}

function closeWindow() {
  window.close();
}

function setupFocusRetention() {
  window.addEventListener("blur", () => {
    if (!timerState.isRunning) return;
    if (refocusTimer) clearTimeout(refocusTimer);
    refocusTimer = setTimeout(() => {
      chrome.windows.getCurrent((currentWindow) => {
        if (!currentWindow || !currentWindow.id) return;
        chrome.windows.update(currentWindow.id, { focused: true }, () => {
          void chrome.runtime.lastError;
        });
      });
    }, 120);
  });
}

function updateControls(running) {
  const pauseBtn = document.getElementById("floating-pause");
  pauseBtn.textContent = running ? "Tạm dừng" : "Tiếp tục";
}

function syncWithBackground() {
  chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
    if (!response) return;
    timerState = response;
    updateDisplay();
    updateControls(response.isRunning);
  });
}

function updateDisplay() {
  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  document.getElementById("floating-timer-display").textContent = timeString;

  const floatingTimer = document.querySelector(".floating-timer");
  floatingTimer.classList.remove("work-mode", "short-break-mode", "long-break-mode");

  if (timerState.mode === "work") {
    floatingTimer.classList.add("work-mode");
    document.getElementById("floating-timer-label").textContent = "Session: Tập trung";
  } else if (timerState.mode === "shortBreak") {
    floatingTimer.classList.add("short-break-mode");
    document.getElementById("floating-timer-label").textContent = "Session: Nghỉ ngắn";
  } else {
    floatingTimer.classList.add("long-break-mode");
    document.getElementById("floating-timer-label").textContent = "Session: Nghỉ dài";
  }

  document.title = `${timeString} - Pomodoro`;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "timerUpdate") {
    timerState.timeLeft = message.timeLeft;
    updateDisplay();
  } else if (message.action === "sessionComplete") {
    const wrap = document.querySelector(".floating-timer");
    wrap.classList.add("alert");
    setTimeout(() => wrap.classList.remove("alert"), 500);
  }
});
