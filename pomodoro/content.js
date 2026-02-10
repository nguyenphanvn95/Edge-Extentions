// Content script: website blocking + inline timer strip
let isBlocking = false;
let ultraFocus = false;
let blacklist = [];
let whitelist = [];

let stripSyncTimer = null;

initialize();

function initialize() {
  loadBlockedSites();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateBlockingState") {
      isBlocking = message.isBlocking;
      ultraFocus = message.ultraFocus;

      if (isBlocking) checkAndBlockSite();
      else removeBlockOverlay();

      sendResponse({ success: true });
      return;
    }

    if (message.action === "showTimerStrip") {
      showInlineTimerStrip();
      sendResponse({ success: true });
      return;
    }

    if (message.action === "hideTimerStrip") {
      removeInlineTimerStrip();
      sendResponse({ success: true });
      return;
    }

    if (message.action === "timerUpdate") {
      syncInlineTimerStrip();
      sendResponse({ success: true });
      return;
    }

    if (message.action === "sessionComplete") {
      const strip = document.getElementById("pomodoro-inline-strip");
      if (strip) {
        strip.classList.add("alert");
        setTimeout(() => strip.classList.remove("alert"), 500);
      }
    }
  });

  chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
    if (!response) return;
    if (response.isRunning && response.mode === "work") {
      isBlocking = true;
      checkAndBlockSite();
    }
    // Auto show strip if timer is running
    if (response.isRunning) {
      showInlineTimerStrip();
    }
  });
}

function loadBlockedSites() {
  chrome.storage.local.get(["blacklist", "whitelist", "ultraFocus"], (result) => {
    blacklist = result.blacklist || [];
    whitelist = result.whitelist || [];
    ultraFocus = result.ultraFocus || false;

    if (isBlocking) checkAndBlockSite();
  });
}

function checkAndBlockSite() {
  const currentDomain = extractDomain(window.location.hostname);
  const isBlacklisted = blacklist.some((site) => currentDomain.includes(site) || site.includes(currentDomain));
  const isWhitelisted = whitelist.some((site) => currentDomain.includes(site) || site.includes(currentDomain));

  if (isBlacklisted && !isWhitelisted) showBlockOverlay();
  else if (isWhitelisted) removeBlockOverlay();
}

function extractDomain(hostname) {
  return hostname.replace(/^www\./, "");
}

function showBlockOverlay() {
  if (document.getElementById("pomodoro-block-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "pomodoro-block-overlay";
  overlay.className = "pomodoro-overlay";

  overlay.innerHTML = `
    <div class="pomodoro-block-content">
      <div class="pomodoro-tomato">🍅</div>
      <h1>Website bị chặn</h1>
      <p>Bạn đang trong phiên tập trung Pomodoro</p>
      <p class="pomodoro-message">
        ${ultraFocus ? "🔥 Chế độ siêu tập trung đang được kích hoạt!" : "Hãy tập trung vào công việc của bạn!"}
      </p>
      <div class="pomodoro-tips">
        <p>💡 <strong>Mẹo:</strong></p>
        <ul>
          <li>Tắt thông báo điện thoại</li>
          <li>Chuẩn bị đồ uống trước khi bắt đầu</li>
          <li>Làm việc trong môi trường yên tĩnh</li>
        </ul>
      </div>
      <div class="pomodoro-buttons">
        <button class="pomodoro-btn pomodoro-btn-primary" id="pomodoro-back-btn">🔙 Quay lại làm việc</button>
      </div>
      <p class="pomodoro-footer">Powered by Pomodoro Grande 🍅</p>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("pomodoro-back-btn").addEventListener("click", () => {
    window.history.back();
  });

  document.body.style.overflow = "hidden";
}

function removeBlockOverlay() {
  const overlay = document.getElementById("pomodoro-block-overlay");
  if (!overlay) return;
  overlay.remove();
  document.body.style.overflow = "";
}

function showInlineTimerStrip() {
  if (!document.getElementById("pomodoro-inline-strip")) {
    const strip = document.createElement("div");
    strip.id = "pomodoro-inline-strip";
    strip.className = "pomodoro-inline-strip work";
    strip.innerHTML = `
      <div class="pomodoro-inline-main">
        <div class="pomodoro-inline-time" id="pomodoro-inline-time">25:00</div>
        <div class="pomodoro-inline-session" id="pomodoro-inline-session">Session: Tập trung</div>
      </div>
      <div class="pomodoro-inline-actions">
        <button type="button" class="pomodoro-inline-btn" id="pomodoro-inline-pause">Tạm dừng</button>
        <button type="button" class="pomodoro-inline-btn stop" id="pomodoro-inline-stop">Dừng</button>
        <button type="button" class="pomodoro-inline-close" id="pomodoro-inline-close">×</button>
      </div>
    `;
    document.body.appendChild(strip);

    document.getElementById("pomodoro-inline-pause").addEventListener("click", togglePauseResume);
    document.getElementById("pomodoro-inline-stop").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "stopTimer" }, () => {
        syncInlineTimerStrip();
      });
    });
    document.getElementById("pomodoro-inline-close").addEventListener("click", removeInlineTimerStrip);
  }

  syncInlineTimerStrip();

  if (stripSyncTimer) clearInterval(stripSyncTimer);
  stripSyncTimer = setInterval(syncInlineTimerStrip, 1000);
}

function removeInlineTimerStrip() {
  const strip = document.getElementById("pomodoro-inline-strip");
  if (strip) strip.remove();
  if (stripSyncTimer) {
    clearInterval(stripSyncTimer);
    stripSyncTimer = null;
  }
}

function togglePauseResume() {
  chrome.runtime.sendMessage({ action: "getTimerState" }, (state) => {
    if (!state) return;

    if (state.isRunning) {
      chrome.runtime.sendMessage({ action: "pauseTimer" }, syncInlineTimerStrip);
    } else {
      chrome.runtime.sendMessage(
        {
          action: "startTimer",
          mode: state.mode || "work",
          timeLeft: state.timeLeft || 1500
        },
        syncInlineTimerStrip
      );
    }
  });
}

function syncInlineTimerStrip() {
  const strip = document.getElementById("pomodoro-inline-strip");
  if (!strip) return;

  chrome.runtime.sendMessage({ action: "getTimerState" }, (state) => {
    if (!state) return;

    const minutes = Math.floor((state.timeLeft || 0) / 60);
    const seconds = (state.timeLeft || 0) % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const timeEl = document.getElementById("pomodoro-inline-time");
    const sessionEl = document.getElementById("pomodoro-inline-session");
    const pauseBtn = document.getElementById("pomodoro-inline-pause");
    if (!timeEl || !sessionEl || !pauseBtn) return;

    timeEl.textContent = timeString;
    pauseBtn.textContent = state.isRunning ? "Tạm dừng" : "Tiếp tục";

    strip.classList.remove("work", "short-break", "long-break");
    if (state.mode === "work") {
      strip.classList.add("work");
      sessionEl.textContent = "Session: Tập trung";
    } else if (state.mode === "shortBreak") {
      strip.classList.add("short-break");
      sessionEl.textContent = "Session: Nghỉ ngắn";
    } else {
      strip.classList.add("long-break");
      sessionEl.textContent = "Session: Nghỉ dài";
    }
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blacklist || changes.whitelist || changes.ultraFocus) {
    loadBlockedSites();
  }
});
