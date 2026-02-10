/**
 * Anki Tool - Content Script
 * Shows a floating popup with field names when text is highlighted on any webpage.
 * Clicking a field button sends the selected text to that field.
 */

(function () {
  "use strict";

  // Avoid re-injection
  if (window.__ankiToolContentScriptLoaded) return;
  window.__ankiToolContentScriptLoaded = true;

  let popup = null;
  let cachedFields = null;
  let isEnabled = true;

  // Helper to check if extension context is still valid
  function isContextValid() {
    return (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      !!chrome.runtime.id
    );
  }

  // Create the popup element with Shadow DOM for style isolation
  function createPopup() {
    const container = document.createElement("div");
    container.id = "anki-tool-popup-container";
    const shadow = container.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap');
      
      .anki-tool-popup {
        position: fixed;
        z-index: 2147483647;
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04);
        padding: 4px;
        display: flex;
        flex-direction: column;
        max-width: 280px;
        min-width: 140px;
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
        transition: opacity 0.15s ease, transform 0.15s ease;
        font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow: hidden;
      }
      
      .anki-tool-popup.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      .anki-tool-popup.dark {
        background: #2a2a2a;
        border-color: rgba(255,255,255,0.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .anki-tool-header-row {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 4px 8px;
        margin-bottom: 2px;
      }
      
      .anki-tool-logo-img {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        object-fit: contain;
      }
      
      .anki-tool-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        color: #888;
        text-transform: uppercase;
        flex-grow: 1;
      }
      
      .dark .anki-tool-title {
        color: #aaa;
      }

      .anki-tool-fields {
        padding: 2px 4px 4px 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      
      .anki-tool-field-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        font-size: 13px;
        font-weight: 400;
        color: #333;
        background: #f0f2f5;
        border: 1px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.1s ease;
        white-space: nowrap;
        font-family: inherit;
        flex-grow: 1;
        text-align: center;
      }
      
      .anki-tool-field-btn:hover {
        background: #d89822;
        color: #fff;
        border-color: #d89822;
      }
      
      .anki-tool-field-btn:active {
        transform: scale(0.98);
      }
      
      .dark .anki-tool-field-btn {
        background: #3a3a3a;
        color: #e0e0e0;
      }
      
      .dark .anki-tool-field-btn:hover {
        background: #d89822;
        color: #fff;
      }
      
      .anki-tool-message {
        padding: 8px 12px;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      
      .dark .anki-tool-message {
        color: #999;
      }
    `;

    const popupEl = document.createElement("div");
    popupEl.className = "anki-tool-popup";

    shadow.appendChild(style);
    shadow.appendChild(popupEl);
    document.body.appendChild(container);

    return { container, shadow, popupEl };
  }

  // Get or create the popup
  function getPopup() {
    if (!popup) {
      popup = createPopup();
    }
    return popup;
  }

  // Hide the popup
  function hidePopup() {
    if (popup) {
      popup.popupEl.classList.remove("visible");
      setTimeout(() => {
        if (popup && !popup.popupEl.classList.contains("visible")) {
          popup.popupEl.style.display = "none";
        }
      }, 150);
    }
  }

  // Show the popup at position
  function showPopup(x, y, fields, selectedText) {
    const { popupEl } = getPopup();

    // Detect dark mode preference
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    popupEl.classList.toggle("dark", isDark);

    // Build content
    popupEl.innerHTML = "";

    // Minimal Header with Icon
    const headerRow = document.createElement("div");
    headerRow.className = "anki-tool-header-row";
    
    const logo = document.createElement("img");
    logo.className = "anki-tool-logo-img";
    logo.alt = "Anki Tool Logo";
    if (isContextValid()) {
      logo.src = chrome.runtime.getURL("/assets/images/icon.png");
    }
    
    const title = document.createElement("span");
    title.className = "anki-tool-title";
    title.textContent = "Anki Tool";
    
    headerRow.appendChild(logo);
    headerRow.appendChild(title);
    popupEl.appendChild(headerRow);

    if (!fields || fields.length === 0) {
      const msg = document.createElement("div");
      msg.className = "anki-tool-message";
      msg.textContent = "Select a model first";
      popupEl.appendChild(msg);
    } else {
      const fieldsContainer = document.createElement("div");
      fieldsContainer.className = "anki-tool-fields";
      
      fields.forEach((field) => {
        const btn = document.createElement("button");
        btn.className = "anki-tool-field-btn";
        btn.textContent = field;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          sendToField(field, selectedText);
          hidePopup();
        });
        fieldsContainer.appendChild(btn);
      });
      
      popupEl.appendChild(fieldsContainer);
    }

    // Position the popup
    popupEl.style.display = "flex";
    popupEl.style.left = "0";
    popupEl.style.top = "0";
    popupEl.classList.remove("visible");

    // Force reflow to get dimensions
    const rect = popupEl.getBoundingClientRect();
    const popupWidth = rect.width;
    const popupHeight = rect.height;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position (prefer below and to the right of selection)
    let left = x;
    let top = y + 10;

    // Adjust if overflowing right
    if (left + popupWidth > viewportWidth - 10) {
      left = viewportWidth - popupWidth - 10;
    }

    // Adjust if overflowing left
    if (left < 10) {
      left = 10;
    }

    // Adjust if overflowing bottom - show above instead
    if (top + popupHeight > viewportHeight - 10) {
      top = y - popupHeight - 10;
    }

    // Ensure not above viewport
    if (top < 10) {
      top = 10;
    }

    popupEl.style.left = `${left}px`;
    popupEl.style.top = `${top}px`;

    // Trigger animation
    requestAnimationFrame(() => {
      popupEl.classList.add("visible");
    });
  }

  // Send text to a specific field
  function sendToField(fieldName, text) {
    if (!isContextValid()) {
      console.warn("Anki Tool: Extension context invalidated. Please refresh the page.");
      return;
    }
    chrome.runtime.sendMessage(
      {
        action: "sendToField",
        field: fieldName,
        text: text,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Anki Tool:", chrome.runtime.lastError.message);
        }
      }
    );
  }

  // Fetch fields from background script
  function fetchFields() {
    return new Promise((resolve) => {
      if (!isContextValid()) {
        resolve(null);
        return;
      }
      chrome.runtime.sendMessage({ action: "getFields" }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response?.fields || null);
      });
    });
  }

  // Handle text selection
  async function handleSelection(e) {
    if (!isEnabled) return;

    // Small delay to let selection finalize
    await new Promise((r) => setTimeout(r, 10));

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText || selectedText.length < 1) {
      hidePopup();
      return;
    }

    // Don't show popup if clicking inside our own popup
    if (popup && popup.container.contains(e.target)) {
      return;
    }

    // Get fields (use cache or fetch)
    if (!cachedFields) {
      cachedFields = await fetchFields();
    }

    // Show popup near the selection end
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.right;
    const y = rect.bottom;

    showPopup(x, y, cachedFields, selectedText);
  }

  // Handle clicks outside popup
  function handleClickOutside(e) {
    if (popup && !popup.container.contains(e.target)) {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText) {
        hidePopup();
      }
    }
  }

  // Listen for model changes to invalidate cache
  if (isContextValid()) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.selectedModel) {
        cachedFields = null; // Invalidate cache
      }
      if (areaName === "local" && changes.enableHighlightPopup !== undefined) {
        isEnabled = changes.enableHighlightPopup.newValue !== false;
      }
    });

    // Check if feature is enabled
    chrome.storage.local.get("enableHighlightPopup", (result) => {
      isEnabled = result.enableHighlightPopup !== false;
    });
  }

  // Event listeners
  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("mousedown", handleClickOutside);

  // Clean up on page unload
  window.addEventListener("unload", () => {
    if (popup) {
      popup.container.remove();
      popup = null;
    }
  });
})();
