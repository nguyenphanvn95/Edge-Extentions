/**
 * i18n Helper - Wrapper for chrome.i18n.getMessage with fallback support
 * This module provides a convenient way to get localized messages with
 * automatic fallback to default English messages.
 */

/**
 * Get a localized message by key.
 * @param {string} key - The message key (e.g., 'EXT_NAME')
 * @param {string|string[]} [substitutions] - Optional substitutions for placeholders
 * @returns {string} The localized message or the key if not found
 */
function getMessage(key, substitutions) {
  const message = chrome.i18n.getMessage(key, substitutions);
  return message || key;
}

/**
 * Apply translations to all elements with data-i18n attributes.
 * This function should be called on DOMContentLoaded.
 */
function applyI18nToPage() {
  const elements = document.querySelectorAll(
    "[data-i18n], [data-i18n-title], [data-i18n-aria-label], [data-i18n-placeholder]"
  );

  elements.forEach((elem) => {
    const textKey = elem.getAttribute("data-i18n");
    const titleKey = elem.getAttribute("data-i18n-title");
    const ariaLabelKey = elem.getAttribute("data-i18n-aria-label");
    const placeholderKey = elem.getAttribute("data-i18n-placeholder");

    if (textKey) {
      const message = getMessage(textKey);
      if (message && message !== textKey) {
        if (
          elem.tagName.toLowerCase() === "input" &&
          elem.type !== "checkbox" &&
          elem.type !== "text"
        ) {
          elem.value = message;
        } else if (elem.tagName.toLowerCase() !== "input") {
          elem.innerHTML = message;
        }
      }
    }

    if (titleKey) {
      const message = getMessage(titleKey);
      if (message && message !== titleKey) {
        elem.title = message;
      }
    }

    if (ariaLabelKey) {
      const message = getMessage(ariaLabelKey);
      if (message && message !== ariaLabelKey) {
        elem.setAttribute("aria-label", message);
      }
    }

    if (placeholderKey) {
      const message = getMessage(placeholderKey);
      if (message && message !== placeholderKey) {
        elem.placeholder = message;
      }
    }
  });
}
