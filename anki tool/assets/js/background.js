function getFeatureVersion(versionString) {
  if (!versionString) return "0.0";
  const parts = versionString.split(".");
  const major = parts[0] || "0";
  const minor = parts[1] || "0";
  return `${major}.${minor}`;
}

function compareVersions(v1, v2) {
  const parts1 = (v1 || "0.0").split(".").map(Number);
  const parts2 = (v2 || "0.0").split(".").map(Number);
  if (parts1[0] !== parts2[0]) {
    return parts1[0] - parts2[0];
  }
  return parts1[1] - parts2[1];
}

chrome.runtime.onInstalled.addListener((details) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const currentFeatureVersion = getFeatureVersion(currentVersion);

  if (details.reason === "update") {
    chrome.storage.local.get("lastSeenUpdateFeatureVersion", (result) => {
      const lastSeenFeatureVersion = result.lastSeenUpdateFeatureVersion;

      if (compareVersions(currentFeatureVersion, lastSeenFeatureVersion) > 0) {
        chrome.tabs.create({ url: "pages/update.html" });
        chrome.storage.local.set({
          lastSeenUpdateFeatureVersion: currentFeatureVersion,
        });
      }
    });
  } else if (details.reason === "install") {
    chrome.storage.local.set({
      installDate: Date.now(),
      cardCount: 0,
      lastSeenUpdateFeatureVersion: currentFeatureVersion,
    });
    console.log("Anki Tool Extension Installed");
  }

  if (chrome.sidePanel && chrome.sidePanel.setOptions) {
    chrome.sidePanel
      .setOptions({
        path: "pages/sidepanel.html",
        enabled: true,
      })
      .catch((err) => {
        console.warn(
          "Side Panel setOptions failed (not supported in older Chrome or Firefox):",
          err
        );
      });
  }
});

const CHROME_WEB_STORE_URL =
  "https://chrome.google.com/webstore/detail/anki-tool/lpfpajiaohmafbnaidbfiolibpnclhei";

function isEmpty(value) {
  const cleaned = value
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  return cleaned === "";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addCard") {
    const fields = message.fields;
    const tags = message.tags || [];
    chrome.storage.local.get("requireAllFields", (result) => {
      const requireAllFields = result.requireAllFields !== false;
      if (requireAllFields && Object.values(fields).some(isEmpty)) {
        sendResponse({ error: "Cannot create note because it is empty" });
        sendNotification("Error", "Cannot create note because it is empty.");
        return;
      }
      fetchAnkiData("addNote", {
        note: {
          deckName: message.deck,
          modelName: message.model,
          fields: fields,
          tags: tags,
        },
      })
        .then((data) => {
          if (data.error) {
            if (
              data.error.includes(
                "cannot create note because it is a duplicate"
              )
            ) {
              sendNotification(
                "Duplicate Error",
                "Cannot create note because it is a duplicate."
              );
            } else {
              sendNotification("Anki Error", data.error);
            }
          } else {
            sendNotification("Success", "Card Added Successfully.");
            chrome.storage.local.get("cardCount", (result) => {
              let cardCount = result.cardCount || 0;
              cardCount += 1;
              chrome.storage.local.set({ cardCount: cardCount });
            });
          }
          sendResponse(data);
        })
        .catch((error) => {
          sendResponse({ error: error.message });
          sendNotification("Anki Error", error.message);
        });
    });
    return true;
  } else if (message.action === "fetchAnkiData") {
    fetchAnkiData(message.ankiAction, message.params)
      .then((response) => {
        sendResponse(response);
      })
      .catch((error) => {
        sendResponse(null);
      });
    return true;
  } else if (message.action === "checkAnkiStatus") {
    fetchAnkiData("version", {}, 500) // 500ms timeout for improved responsiveness
      .then((response) => {
        if (response && response.result) {
          sendResponse({ status: "running" });
        } else {
          sendResponse({ status: "not running" });
        }
      })
      .catch((error) => {
        sendResponse({ status: "not running" });
      });
    return true;
  } else if (message.action === "addAudio") {
    const { filename, data } = message;
    if (!filename || !data) {
      sendResponse({ success: false, error: "Invalid audio data" });
      sendNotification("Error", "Invalid audio data provided for upload.");
      return true;
    }
    fetchAnkiData("storeMediaFile", {
      filename: filename,
      data: data,
    })
      .then((response) => {
        if (response.error) {
          sendResponse({ success: false, error: response.error });
          sendNotification("Audio Upload Error", response.error);
        } else {
          sendResponse({ success: true });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
        sendNotification("Audio Upload Error", error.message);
      });
    return true;
  } else if (message.action === "getFields") {
    // Get field names for the currently selected model
    chrome.storage.local.get("selectedModel", (result) => {
      const selectedModel = result.selectedModel;
      if (!selectedModel) {
        sendResponse({ fields: null });
        return;
      }
      fetchAnkiData("modelFieldNames", { modelName: selectedModel })
        .then((response) => {
          if (response && response.result) {
            sendResponse({ fields: response.result });
          } else {
            sendResponse({ fields: null });
          }
        })
        .catch(() => {
          sendResponse({ fields: null });
        });
    });
    return true;
  } else if (message.action === "sendToField") {
    // Store the selected text for a specific field
    const { field, text } = message;
    if (field && text) {
      chrome.storage.local.set({ [field]: text }, () => {
        chrome.action.openPopup();
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, error: "Invalid field or text" });
    }
    return true;
  } else if (message.action === "aiAutoFill") {
    // AI Auto-fill handler
    const { deckName, modelName, fieldNames, filledFields, emptyFields } = message;
    
    // Get extension ID for rate limiting
    const extensionId = chrome.runtime.id;
    
    // Call the Cloudflare Worker
    const AI_SERVER_URL = "https://ankitool-ai.basslawand.workers.dev/api/autofill";
    
    fetch(AI_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Extension-Id": extensionId,
      },
      body: JSON.stringify({
        deckName,
        modelName,
        fieldNames,
        filledFields,
        emptyFields,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.remaining !== "undefined") {
          chrome.storage.local.set({ aiRemaining: data.remaining });
        }
        if (data.error) {
          sendResponse({ 
            error: data.error, 
            message: data.message,
            remaining: data.remaining 
          });
          if (data.error === "Daily limit reached") {
            sendNotification("Rate Limit", data.message || "Daily AI limit reached. Try again tomorrow.");
          }
        } else {
          sendResponse({ 
            fields: data.fields, 
            remaining: data.remaining 
          });
        }
      })
      .catch((error) => {
        console.error("AI Auto-fill error:", error);
        sendResponse({ error: error.message });
        sendNotification("AI Error", "Failed to connect to AI service.");
      });
    return true;
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_anki_tool") {
    chrome.action.openPopup();
  } else if (command === "open_side_panel") {
    openSidePanel();
  } else if (command === "close_side_panel") {
    closeSidePanel();
  }
});

function openSidePanel() {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.windows.getCurrent({ populate: false }, (window) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error getting current window:",
          chrome.runtime.lastError
        );
        return;
      }
      chrome.sidePanel.open({ windowId: window.id }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error opening side panel:", chrome.runtime.lastError);
        } else {
          console.log("Side panel opened successfully.");
        }
      });
    });
  } else if (
    typeof browser !== "undefined" &&
    browser.sidebarAction &&
    browser.sidebarAction.open
  ) {
    browser.sidebarAction.open().catch((err) => {
      console.warn("Sidebar open failed:", err);
    });
  } else if (
    typeof browser !== "undefined" &&
    browser.sidebarAction &&
    browser.sidebarAction.toggle
  ) {
    browser.sidebarAction.toggle().catch((err) => {
      console.warn("Sidebar toggle failed:", err);
    });
  } else {
    console.warn("Side Panel API is not available.");
  }
}

function closeSidePanel() {
  if (chrome.sidePanel && chrome.sidePanel.setOptions) {
    chrome.sidePanel
      .setOptions({ enabled: false })
      .then(() => {
        return chrome.sidePanel.setOptions({
          path: "pages/sidepanel.html",
          enabled: true,
        });
      })
      .catch((err) => {
        console.warn("Side Panel close operation failed:", err);
      });
  } else if (
    typeof browser !== "undefined" &&
    browser.sidebarAction &&
    browser.sidebarAction.close
  ) {
    browser.sidebarAction.close();
  }
}

function sendNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/images/icon.png",
    title: title,
    message: message,
    priority: 2,
  });
}

async function fetchAnkiData(action, params, timeout = 0) {
  const ankiConnectUrl = "http://localhost:8765";
  const payload = {
    action: action,
    version: 6,
    params: params,
  };

  const controller = new AbortController();
  let id;
  if (timeout > 0) {
    id = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(ankiConnectUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: timeout > 0 ? controller.signal : undefined,
    });
    
    if (timeout > 0) clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (timeout > 0) clearTimeout(id);
    console.error(`Fetch Error: ${error}`);
    throw error;
  }
}
