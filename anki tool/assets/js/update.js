document.addEventListener("DOMContentLoaded", function () {
  // Apply update page specific translations from uptranslations.js
  applyUpdateTranslations();
  
  initClozeAnimation();

  const openSettingsBtn = document.getElementById("openSettingsBtn");
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime) {
        chrome.tabs.create({
          url: chrome.runtime.getURL("pages/settings.html"),
        });
      }
    });
  }

  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.close();
    });
  }

  animateToggles();

  // Set current year in footer
  const yearElement = document.getElementById("footer-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

function applyUpdateTranslations() {
  // Safety check if uptranslations.js failed to load
  if (typeof translations === "undefined") {
    console.warn("uptranslations.js not loaded");
    return;
  }

  let lang = "en";
  if (typeof chrome !== "undefined" && chrome.i18n) {
    const uiLang = chrome.i18n.getUILanguage();
    if (uiLang) {
      if (translations[uiLang]) {
        lang = uiLang;
      } else if (translations[uiLang.split("-")[0]]) {
        lang = uiLang.split("-")[0];
      }
    }
  }

  const langData = translations[lang] || translations["en"];

  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    if (langData[key]) {
      if (elem.tagName === 'INPUT' && elem.type !== 'checkbox') {
        elem.value = langData[key];
      } else {
        elem.textContent = langData[key];
      }
    }
  });
}

function animateToggles() {
  const toggles = document.querySelectorAll(".settings-demo .toggle-switch");

  setInterval(() => {
    toggles.forEach((toggle, index) => {
      setTimeout(() => {
        toggle.classList.toggle("active");
      }, index * 300);
    });
  }, 3000);
}

function initClozeAnimation() {
  const widget = document.querySelector(".cloze-animation-widget");
  if (!widget) return;

  const field = document.getElementById("clozeAnimField");
  const preview = document.getElementById("clozeAnimPreview");
  const front = document.getElementById("clozeAnimFront");
  const back = document.getElementById("clozeAnimBack");

  if (!field || !preview || !front || !back) return;

  const cursor = document.createElement("div");
  cursor.className = "widget-cursor";
  field.parentElement.appendChild(cursor);

  const selection = document.createElement("div");
  selection.className = "widget-selection";
  field.parentElement.appendChild(selection);

  const mousePointer = document.createElement("div");
  mousePointer.className = "widget-mouse-pointer";
  widget.appendChild(mousePointer);

  const originalText = "Paris is the capital of France";
  let step = 0;
  let animationTimeout;
  let isInView = false;
  let hasAnimationStarted = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;

        if (!isInView) {
          clearTimeout(animationTimeout);
        } else if (!hasAnimationStarted) {
          hasAnimationStarted = true;
          setTimeout(() => {
            step = 0;
            animate();
          }, 500);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(widget);

  function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font || "14px Inter";
    return context.measureText(text).width;
  }

  function animate() {
    if (!isInView) {
      animationTimeout = setTimeout(() => animate(), 100);
      return;
    }

    step++;

    widget.querySelectorAll(".widget-btn-cloze").forEach((btn) => {
      btn.classList.remove("widget-btn-active");
    });

    if (step === 1) {
      field.innerHTML = originalText;
      preview.style.display = "none";
      cursor.style.display = "block";
      cursor.classList.add("blinking");
      selection.classList.remove("active");
      selection.style.width = "0px";
      mousePointer.classList.remove("visible");
    } else if (step === 2) {
      cursor.classList.remove("blinking");

      const fieldRect = field.getBoundingClientRect();
      const widgetRect = widget.getBoundingClientRect();

      const relativeLeft = fieldRect.left - widgetRect.left + 12;
      const relativeTop = fieldRect.top - widgetRect.top + 14;

      mousePointer.style.left = relativeLeft + "px";
      mousePointer.style.top = relativeTop + "px";
      mousePointer.classList.add("visible");

      cursor.style.display = "none";
      selection.style.left = "12px";
      selection.style.width = "0px";
      selection.classList.add("active");

      setTimeout(() => {
        mousePointer.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        selection.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        const parisWidth = getTextWidth("Paris", "14px Inter");
        mousePointer.style.left = relativeLeft + parisWidth + "px";
        selection.style.width = parisWidth + "px";
      }, 100);
    } else if (step === 3) {
      mousePointer.style.transition = "";
      selection.style.transition = "";
    } else if (step === 4) {
      const c1Btn = widget.querySelector('.widget-btn-cloze[data-num="1"]');
      if (c1Btn) {
        const btnRect = c1Btn.getBoundingClientRect();
        const widgetRect = widget.getBoundingClientRect();

        const relativeLeft =
          btnRect.left - widgetRect.left + btnRect.width / 2 - 10;
        const relativeTop =
          btnRect.top - widgetRect.top + btnRect.height / 2 - 10;

        mousePointer.style.transition = "all 0.6s ease";
        mousePointer.style.left = relativeLeft + "px";
        mousePointer.style.top = relativeTop + "px";
      }
    } else if (step === 5) {
      const c1Btn = widget.querySelector('.widget-btn-cloze[data-num="1"]');
      if (c1Btn) {
        c1Btn.classList.add("widget-btn-active");

        setTimeout(() => {
          c1Btn.classList.remove("widget-btn-active");
        }, 300);
      }
    } else if (step === 6) {
      field.innerHTML =
        '<span class="widget-cloze">{{c1::Paris}}</span> is the capital of France';
      selection.classList.remove("active");
      mousePointer.classList.remove("visible");
      cursor.style.display = "none";
    } else if (step === 7) {
      preview.style.display = "grid";
      front.innerHTML =
        '<span class="widget-cloze-hidden">[...]</span> is the capital of France';
      back.innerHTML =
        '<span class="widget-cloze-revealed">Paris</span> is the capital of France';
    } else if (step === 8) {
      setTimeout(() => {
        step = 0;
        animate();
      }, 3500);
      return;
    }

    const delays = [0, 1500, 2000, 1000, 1200, 1000, 800, 1500];
    animationTimeout = setTimeout(animate, delays[step] || 1000);
  }

  widget.addEventListener("mouseenter", () => {
    clearTimeout(animationTimeout);
    step = 0;
    if (isInView) {
      animate();
    }
  });

  window.addEventListener("beforeunload", () => {
    observer.disconnect();
  });
}
