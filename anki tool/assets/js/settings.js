const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/anki-tool/lpfpajiaohmafbnaidbfiolibpnclhei";

document.addEventListener("DOMContentLoaded", () => {
  // Apply translations using the standard i18n API
  applyI18nToPage();
  
  document.getElementById("rateButton").addEventListener("click", () => {
    window.open(CHROME_WEB_STORE_URL, "_blank");
  });

  // Set current year in footer
  const yearElement = document.getElementById("copyright-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Load feature toggles
  chrome.storage.local.get(
    [
      "enableAIAutoFill",
      "enableAudio",
      "enableFormatting",
      "requireAllFields",
      "enableTags",
      "enableCloze",
      "enablePreview",
      "enableHighlightPopup",
    ],
    (res) => {
      document.getElementById("enableAIAutoFill").checked = res.enableAIAutoFill !== false;
      document.getElementById("enableAudio").checked = res.enableAudio !== false;
      document.getElementById("enableFormatting").checked = res.enableFormatting !== false;
      document.getElementById("requireAllFields").checked = res.requireAllFields !== false;
      document.getElementById("enableTags").checked = res.enableTags !== false;
      document.getElementById("enableCloze").checked = res.enableCloze !== false;
      document.getElementById("enablePreview").checked = res.enablePreview !== false;
      document.getElementById("enableHighlightPopup").checked = res.enableHighlightPopup !== false;
    }
  );

  // Feature toggle handlers
  document.getElementById("enableAIAutoFill").addEventListener("change", function () {
    chrome.storage.local.set({ enableAIAutoFill: this.checked });
  });

  document.getElementById("enableAudio").addEventListener("change", function () {
    chrome.storage.local.set({ enableAudio: this.checked });
  });

  document.getElementById("enableFormatting").addEventListener("change", function () {
    const isEnabled = this.checked;
    chrome.storage.local.set({ enableFormatting: isEnabled });
    if (!isEnabled) {
      chrome.storage.local.set({ enableCloze: false });
      document.getElementById("enableCloze").checked = false;
    }
  });

  document.getElementById("requireAllFields").addEventListener("change", function () {
    chrome.storage.local.set({ requireAllFields: this.checked });
  });

  document.getElementById("enableTags").addEventListener("change", function () {
    chrome.storage.local.set({ enableTags: this.checked });
  });

  document.getElementById("enableCloze").addEventListener("change", function () {
    const isEnabled = this.checked;
    if (isEnabled) {
      chrome.storage.local.get("enableFormatting", (res) => {
        if (res.enableFormatting === false) {
          chrome.storage.local.set({ enableFormatting: true, enableCloze: true });
          document.getElementById("enableFormatting").checked = true;
        } else {
          chrome.storage.local.set({ enableCloze: true });
        }
      });
    } else {
      chrome.storage.local.set({ enableCloze: false });
    }
  });

  document.getElementById("enablePreview").addEventListener("change", function () {
    chrome.storage.local.set({ enablePreview: this.checked });
  });

  document.getElementById("enableHighlightPopup").addEventListener("change", function () {
    chrome.storage.local.set({ enableHighlightPopup: this.checked });
  });
});
