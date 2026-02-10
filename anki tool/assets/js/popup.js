let enableAudio = true;
let enableFormatting = true;
let requireAllFields = true;
let enableTags = true;
let enableCloze = true;
let enablePreview = true;
let allAnkiTags = [];
let selectedTags = [];
let currentModelIsCloze = false;
let modelCache = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  applyI18nToPage();
  checkAnkiStatus();
  initializeTheme();
  initTagsInput();
  chrome.storage.local.get(
    ["selectedDeck", "selectedModel", "currentSelectedTags"],
    (r) => {
      if (r.selectedDeck) {
        document.getElementById("deck").value = r.selectedDeck;
      }
      if (r.selectedModel) {
        document.getElementById("model").value = r.selectedModel;
        detectAndRenderModel(r.selectedModel);
      }
      if (r.currentSelectedTags && Array.isArray(r.currentSelectedTags)) {
        selectedTags = r.currentSelectedTags;
        renderInitialTags();
      }
    }
  );
  document.getElementById("deck").addEventListener("change", function () {
    chrome.storage.local.set({ selectedDeck: this.value });
  });
  document.getElementById("model").addEventListener("change", function () {
    chrome.storage.local.set({ selectedModel: this.value });
    const m = this.value;
    if (m) {
      detectAndRenderModel(m);
    }
  });
  chrome.storage.local.get(["requireAllFields", "enableAIAutoFill"], (r) => {
    requireAllFields = r.requireAllFields !== false;
    
    // AI Auto-fill toggle
    const aiBtn = document.getElementById("aiAutoFillButton");
    if (aiBtn) {
      if (r.enableAIAutoFill === false) {
        aiBtn.style.display = "none";
      } else {
        // Restore display if it was hidden (default is usually flex via CSS, but explicit display might be needed if re-enabling without reload, though popup always reloads)
        aiBtn.style.display = ""; 
      }
    }
  });
  document.getElementById("ankiForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = document.getElementById("deck").value;
    const m = document.getElementById("model").value;
    const fC = document.getElementById("fieldsContainer");
    const f = fC.querySelectorAll(".editable-div");
    let data = {};
    f.forEach((i) => {
      data[i.id] = i.innerHTML.trim();
    });

    if (currentModelIsCloze) {
      const hasCloze = Object.values(data).some((fieldContent) =>
        /\{\{c\d+::.*?\}\}/.test(fieldContent)
      );
      if (!hasCloze) {
        alert(getMessage('CLOZE_REQUIRED_ERROR'));
        return;
      }
    }

    const aData = document.getElementById("audioData").value;
    if (aData) {
      const t = "[sound:" + aData + "]";
      const aField = document.getElementById("audioFieldSelect").value;
      if (data[aField] !== undefined) {
        data[aField] += "<br>" + t;
      } else {
        return;
      }
      chrome.storage.local.set({ selectedAudioField: aField });
    }
    chrome.storage.local.set({ selectedDeck: d, selectedModel: m });
    const tagsToSend = enableTags ? selectedTags : [];
    chrome.runtime.sendMessage(
      {
        action: "addCard",
        deck: d,
        model: m,
        fields: data,
        tags: tagsToSend,
      },
      (r) => {
        if (r && r.error) {
          console.error("Error adding card:", r.error);
        } else {
          f.forEach((i) => (i.innerHTML = ""));
          const keys = Object.keys(data);
          keys.forEach((k) => {
            chrome.storage.local.remove(k);
          });
          document.getElementById("audioData").value = "";
          document.getElementById("audioFileName").textContent = "";
          document.getElementById("audioFieldSelect").style.display = "none";
          document
            .querySelector(".audio-section")
            .classList.remove("audio-uploaded");
          document.getElementById("removeAudioButton").style.display = "none";
          document.getElementById("audioFileInput").value = "";
        }
      }
    );
  });
  initAudioUploadFeature();
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  const sB = document.getElementById("settingsButton");
  if (sB) {
    sB.addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("pages/settings.html") });
    });
  }
  const oPB = document.getElementById("openSidePanelButton");
  if (oPB) {
    oPB.addEventListener("click", async () => {
      if (typeof browser !== "undefined" && browser.sidebarAction) {
        if (browser.sidebarAction.open) {
          browser.sidebarAction.open();
          window.close();
        } else if (browser.sidebarAction.toggle) {
          browser.sidebarAction.toggle();
          window.close();
        } else {
          alert("Opening sidebar not supported in this version of Firefox.");
        }
      } else if (chrome.sidePanel && chrome.sidePanel.open) {
        try {
          const [cTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          await chrome.sidePanel.open({ windowId: cTab.windowId });
          window.close();
        } catch (err) {
          alert(getMessage('SIDE_PANEL_ERROR'));
        }
      } else {
        alert(getMessage('SIDE_PANEL_API_NOT_AVAILABLE'));
      }
    });
  }
  const createClozeBtn = document.getElementById("createClozeModelButton");
  if (createClozeBtn) {
    createClozeBtn.addEventListener("click", async () => {
      try {
        const result = await createBasicClozeModel();
        if (result && result.result) {
          await fetchDecksAndModels();
          document.getElementById("model").value = "Anki Tool Cloze";
          chrome.storage.local.set({ selectedModel: "Anki Tool Cloze" });
          await detectAndRenderModel("Anki Tool Cloze");
        }
      } catch (error) {
        alert(getMessage('CREATE_CLOZE_MODEL_FAILED') + ": " + error.message);
      }
    });
  }
  const previewBtn = document.getElementById("previewCardButton");
  if (previewBtn) {
    previewBtn.addEventListener("click", showCardPreview);
  }

  const aiAutoFillBtn = document.getElementById("aiAutoFillButton");
  if (aiAutoFillBtn) {
    aiAutoFillBtn.addEventListener("click", handleAIAutoFill);
  }

  const rateNudge = document.getElementById("rateNudge");
  if (rateNudge) {
    chrome.storage.local.get(
      [
        "hasRated",
        "rateNudgeDismissed",
        "rateNudgeDismissedDate",
        "installDate",
        "cardCount",
      ],
      (r) => {
        let h = r.hasRated;
        let d = r.rateNudgeDismissed;
        let dd = r.rateNudgeDismissedDate;
        let iD = r.installDate;
        let cC = r.cardCount || 0;
        const n = Date.now();
        const s7 = 604800000;
        const r14 = 1209600000;
        const mC = 20;
        if (!iD) {
          chrome.storage.local.set({ installDate: n });
          iD = n;
        }
        if (!h && (n - iD >= s7 || cC >= mC)) {
          if (!d) {
            rateNudge.style.display = "flex";
          } else if (dd && n - dd >= r14) {
            chrome.storage.local.remove("rateNudgeDismissed", () => {
              chrome.storage.local.remove("rateNudgeDismissedDate", () => {
                rateNudge.style.display = "flex";
              });
            });
          } else {
            rateNudge.style.display = "none";
          }
        } else {
          rateNudge.style.display = "none";
        }
      }
    );

    const rNB = document.getElementById("rateNudgeButton");
    const dNB = document.getElementById("dismissNudgeButton");
    const url =
      "https://chrome.google.com/webstore/detail/anki-tool/lpfpajiaohmafbnaidbfiolibpnclhei";
    if (rNB) {
      rNB.addEventListener("click", () => {
        chrome.tabs.create({ url });
        chrome.storage.local.set({ hasRated: true }, () => {});
        rateNudge.style.display = "none";
      });
    }
    if (dNB) {
      dNB.addEventListener("click", () => {
        chrome.storage.local.set(
          { rateNudgeDismissed: true, rateNudgeDismissedDate: Date.now() },
          () => {}
        );
        rateNudge.style.display = "none";
      });
    }
  }

  function loadTranslations() {}
  chrome.storage.local.get(
    [
      "enableAudio",
      "aiRemaining",
      "enableFormatting",
      "enableTags",
      "enableCloze",
      "enablePreview",
    ],
    (r) => {
      enableAudio = r.enableAudio !== false;
      enableFormatting = r.enableFormatting !== false;
      enableTags = r.enableTags !== false;
      enablePreview = r.enablePreview !== false;

      if (r.aiRemaining !== undefined) {
        updateAIRemainingBadge(r.aiRemaining);
      }

      if (enableFormatting === false) {
        enableCloze = false;
      } else {
        enableCloze = r.enableCloze !== false;
      }

      if (!enableAudio) {
        document.body.classList.add("audio-disabled");
      }
      if (!enableFormatting) {
        document.body.classList.add("formatting-disabled");
      }
      if (!enableTags) {
        document.body.classList.add("tags-disabled");
      }
      if (!enableCloze) {
        document.body.classList.add("cloze-disabled");
      }
      if (!enablePreview) {
        document.body.classList.add("preview-disabled");
      }
    }
  );
  const tagInputField = document.getElementById("tagInputField");
  if (tagInputField) {
    tagInputField.dataset.originalPlaceholder =
      tagInputField.placeholder || "Add tags...";
    updateTagPlaceholderVisibility();
  }
});

async function detectAndRenderModel(modelName) {
  const isCloze = await isTrueClozeModel(modelName);
  currentModelIsCloze = isCloze;
  chrome.storage.local.set({ currentModelIsCloze: isCloze });
  fetchAndRenderFields(modelName);
  if (isCloze && enableCloze) {
    showClozeHelper();
  } else {
    hideClozeHelper();
  }
}

async function isTrueClozeModel(modelName) {
  try {
    const response = await fetchAnkiData("modelTemplates", {
      modelName: modelName,
    });
    if (response && response.result) {
      const templates = Object.values(response.result);
      return templates.some((template) => {
        const front = template.Front || "";
        const back = template.Back || "";
        return front.includes("{{cloze:") || back.includes("{{cloze:");
      });
    }
    return false;
  } catch (error) {
    console.error("Error detecting cloze model:", error);
    return false;
  }
}

async function createBasicClozeModel() {
  return await fetchAnkiData("createModel", {
    modelName: "Anki Tool Cloze",
    inOrderFields: ["Text", "Extra"],
    css: `.card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } .cloze { font-weight: bold; color: blue; } .nightMode .cloze { color: lightblue; }`,
    isCloze: true,
    cardTemplates: [
      {
        Name: "Cloze",
        Front: "{{cloze:Text}}",
        Back: "{{cloze:Text}}<br>{{Extra}}",
      },
    ],
  });
}

function showClozeHelper() {
  const helper = document.getElementById("clozeHelper");
  if (helper) {
    helper.classList.remove("hidden");
    const buttons = helper.querySelectorAll(".cloze-quick-btn");
    buttons.forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });
    helper.querySelectorAll(".cloze-quick-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const clozeNum = e.target.dataset.cloze;
        const focused = document.activeElement;
        if (focused && focused.classList.contains("editable-div")) {
          if (clozeNum === "auto") {
            wrapSelectionWithAutoCloze(focused);
          } else {
            wrapSelectionWithCloze(parseInt(clozeNum), focused);
          }
        }
      });
    });
  }
}

function hideClozeHelper() {
  const helper = document.getElementById("clozeHelper");
  if (helper) {
    helper.classList.add("hidden");
  }
}

function wrapSelectionWithCloze(num, targetElement) {
  targetElement.focus();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (selectedText) {
    const clozeText = `{{c${num}::${selectedText}}}`;
    document.execCommand("insertText", false, clozeText);
  }
}

function wrapSelectionWithAutoCloze(targetElement) {
  const content = targetElement.textContent || "";
  const regex = /{{c(\d+)::/g;
  let maxNum = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (num > maxNum) maxNum = num;
  }
  const nextNum = maxNum + 1;
  wrapSelectionWithCloze(nextNum, targetElement);
}

async function showCardPreview() {
  const modelName = document.getElementById("model").value;
  if (!modelName) {
    alert(getMessage('SELECT_CARD_TYPE_FIRST'));
    return;
  }

  const fieldsContainer = document.getElementById("fieldsContainer");
  const fieldDivs = fieldsContainer.querySelectorAll(".editable-div");
  let fieldData = {};
  fieldDivs.forEach((div) => {
    fieldData[div.id] = div.innerHTML;
  });

  let templates, css;

  if (modelCache.has(modelName)) {
    const cached = modelCache.get(modelName);
    templates = cached.templates;
    css = cached.css;
  } else {
    const [templatesResponse, stylingResponse] = await Promise.all([
      fetchAnkiData("modelTemplates", { modelName: modelName }),
      fetchAnkiData("modelStyling", { modelName: modelName }),
    ]);
    templates = templatesResponse?.result || {};
    css = stylingResponse?.result?.css || "";
    modelCache.set(modelName, { templates, css });
  }



  const isCloze = Object.values(templates).some((template) => {
    const front = template.Front || "";
    const back = template.Back || "";
    return front.includes("{{cloze:") || back.includes("{{cloze:");
  });

  let previewHTML = "";

  if (isCloze) {
    const clozeNumbers = new Set();
    for (let fieldName in fieldData) {
      const fieldContent = fieldData[fieldName];
      const textContent =
        new DOMParser().parseFromString(fieldContent, "text/html").body
          .textContent || "";
      let match;
      const regex = /{{c(\d+)::([^}]+)}}/g;
      while ((match = regex.exec(textContent)) !== null) {
        clozeNumbers.add(parseInt(match[1]));
      }
    }

    if (clozeNumbers.size === 0) {
      alert(getMessage('NO_CLOZE_DELETIONS_FOUND'));
      return;
    }

    const sortedClozeNumbers = Array.from(clozeNumbers).sort((a, b) => a - b);

    sortedClozeNumbers.forEach((clozeNum) => {
      const firstTemplate = Object.values(templates)[0];
      let frontTemplate = firstTemplate.Front || "";
      let backTemplate = firstTemplate.Back || "";

      for (let fieldName in fieldData) {
        let fieldContent = fieldData[fieldName];

        const processedContent = fieldContent.replace(
          /\{\{c(\d+)::([^}]+)\}\}/g,
          (match, num, text) => {
            return parseInt(num) === clozeNum
              ? `<span class="cloze-preview-placeholder">[...]</span>`
              : text;
          }
        );

        const backProcessedContent = fieldContent.replace(
          /\{\{c(\d+)::([^}]+)\}\}/g,
          (match, num, text) => {
            return parseInt(num) === clozeNum
              ? `<span class="cloze">${text}</span>`
              : text;
          }
        );

        const fieldRegex = new RegExp(`\\{\\{cloze:${fieldName}\\}\\}`, "g");
        frontTemplate = frontTemplate.replace(fieldRegex, processedContent);
        backTemplate = backTemplate.replace(fieldRegex, backProcessedContent);

        const plainFieldRegex = new RegExp(`\\{\\{${fieldName}\\}\\}`, "g");
        frontTemplate = frontTemplate.replace(plainFieldRegex, fieldContent);
        backTemplate = backTemplate.replace(plainFieldRegex, fieldContent);
      }

      backTemplate = backTemplate.replace(/\{\{FrontSide\}\}/g, frontTemplate);

      previewHTML += `
        <div class="preview-card">
          <div class="preview-card-sides">
            <div class="preview-side">
              <h4>${getMessage('PREVIEW_FRONT')}</h4>
              <div class="card-content card">${frontTemplate}</div>
            </div>
            <div class="preview-side">
              <h4>${getMessage('PREVIEW_BACK')}</h4>
              <div class="card-content card">${backTemplate}</div>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    for (let templateName in templates) {
      const template = templates[templateName];
      let frontHTML = template.Front || "";
      let backHTML = template.Back || "";

      for (let fieldName in fieldData) {
        const fieldContent = fieldData[fieldName];
        const fieldRegex = new RegExp(`\\{\\{${fieldName}\\}\\}`, "g");
        frontHTML = frontHTML.replace(fieldRegex, fieldContent);
        backHTML = backHTML.replace(fieldRegex, fieldContent);
      }

      backHTML = backHTML.replace(/\{\{FrontSide\}\}/g, frontHTML);

      previewHTML += `
        <div class="preview-card">
          <div class="preview-card-sides">
            <div class="preview-side">
              <h4>${getMessage('PREVIEW_FRONT')}</h4>
              <div class="card-content card">${frontHTML}</div>
            </div>
            <div class="preview-side">
              <h4>${getMessage('PREVIEW_BACK')}</h4>
              <div class="card-content card">${backHTML}</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  let previewContainer = document.getElementById("previewContainer");
  if (!previewContainer) {
    previewContainer = document.createElement("div");
    previewContainer.id = "previewContainer";
    document
      .getElementById("ankiForm")
      .parentNode.appendChild(previewContainer);
  }

  previewContainer.innerHTML = `
    <div class="preview-header">
      <h2>${getMessage('CARD_PREVIEW_TITLE')}</h2>
      <button class="preview-close-button">${getMessage('BACK_TO_FORM')}</button>
    </div>
    <div class="preview-content">
      <style>
        ${css}
        .cloze-preview-placeholder {
          font-weight: bold;
          color: blue;
        }
        body.dark-mode .cloze-preview-placeholder {
          color: lightblue;
        }
      </style>
      <div class="preview-cards">
        ${previewHTML}
      </div>
    </div>
  `;

  document.getElementById("ankiForm").classList.add("hidden");

  const rateNudge = document.getElementById("rateNudge");
  if (rateNudge) {
    rateNudge.classList.add("hidden");
  }

  previewContainer.classList.add("active");

  previewContainer
    .querySelector(".preview-close-button")
    .addEventListener("click", closePreview);
}

function closePreview() {
  const previewContainer = document.getElementById("previewContainer");
  if (previewContainer) {
    previewContainer.classList.remove("active");
  }
  document.getElementById("ankiForm").classList.remove("hidden");
  const rateNudge = document.getElementById("rateNudge");
  if (rateNudge && rateNudge.style.display === "flex") {
    rateNudge.classList.remove("hidden");
  }
}

async function handleAIAutoFill() {
  const aiBtn = document.getElementById("aiAutoFillButton");
  const deckName = document.getElementById("deck").value;
  const modelName = document.getElementById("model").value;

  if (!deckName || !modelName) {
    alert(getMessage("AI_SELECT_DECK_MODEL") || "Please select a deck and model first.");
    return;
  }

  const fieldsContainer = document.getElementById("fieldsContainer");
  const fieldDivs = fieldsContainer.querySelectorAll(".editable-div");
  
  if (fieldDivs.length === 0) {
    alert(getMessage("AI_NO_FIELDS") || "No fields available to fill.");
    return;
  }

  // Gather field data - separate filled and empty fields
  const fieldNames = [];
  const filledFields = {};
  const emptyFields = [];

  fieldDivs.forEach((div) => {
    const fieldName = div.id;
    fieldNames.push(fieldName);
    
    const content = div.innerHTML.trim();
    const textContent = div.textContent.trim();
    
    // Consider a field "filled" if it has meaningful content
    if (textContent && textContent.length > 0) {
      filledFields[fieldName] = content;
    } else {
      emptyFields.push(fieldName);
    }
  });

  if (emptyFields.length === 0) {
    alert(getMessage("AI_ALL_FIELDS_FILLED") || "All fields are already filled.");
    return;
  }

  // Show loading state and lock fields
  aiBtn.classList.add("loading");
  aiBtn.disabled = true;
  disableInputs(true);

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "aiAutoFill",
          deckName,
          modelName,
          fieldNames,
          filledFields,
          emptyFields,
        },
        (resp) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(resp);
        }
      );
    });

    if (response.error) {
      if (response.error === "Daily limit reached") {
        alert(getMessage("AI_RATE_LIMIT") || response.message || "Daily AI limit reached. Try again tomorrow.");
      } else {
        alert(getMessage("AI_ERROR") || "AI Error: " + response.error);
      }
      return;
    }

    // Populate empty fields with AI-generated content
    if (response.fields) {
      for (const [fieldName, content] of Object.entries(response.fields)) {
        const fieldDiv = document.getElementById(fieldName);
        if (fieldDiv && emptyFields.includes(fieldName)) {
          fieldDiv.innerHTML = content;
          // Trigger storage update
          chrome.storage.local.set({ [fieldName]: content });
        }
      }
    }

    // Show remaining requests badge if available and not full
    if (response.remaining !== undefined) {
      updateAIRemainingBadge(response.remaining);
    }

  } catch (error) {
    console.error("AI Auto-fill error:", error);
    alert(getMessage("AI_CONNECTION_ERROR") || "Failed to connect to AI service. Please try again later.");
  } finally {
    // Remove loading state and unlock fields
    aiBtn.classList.remove("loading");
    aiBtn.disabled = false;
    disableInputs(false);
  }
}

function updateAIRemainingBadge(remaining) {
  const subtitle = document.getElementById("aiUsageSubtitle");
  
  // Default to 10 if undefined
  if (remaining === undefined) remaining = 10;
  
  if (subtitle) {
    subtitle.textContent = `${remaining}/10`;
    subtitle.title = `${remaining} AI uses remaining today`;
  }
}

function disableInputs(disable) {
  const fields = document.querySelectorAll(".editable-div");
  const inputs = document.querySelectorAll("input, select, button:not(#aiAutoFillButton)");
  
  if (disable) {
    fields.forEach(f => {
      f.contentEditable = "false";
      f.classList.add("input-disabled");
    });
    inputs.forEach(i => i.disabled = true);
  } else {
    fields.forEach(f => {
      f.contentEditable = "true";
      f.classList.remove("input-disabled");
    });
    inputs.forEach(i => i.disabled = false);
  }
}

function fetchAndRenderFields(m) {
  fetchAnkiData("modelFieldNames", { modelName: m })
    .then((r) => {
      if (r.result) {
        renderFields(r.result);
      }
    })
    .catch((e) => {});
}

function renderFields(fs) {
  const c = document.getElementById("fieldsContainer");
  c.innerHTML = "";
  fs.forEach((f) => {
    const d = document.createElement("div");
    d.className = "form-group";
    const l = document.createElement("label");
    l.textContent = f + ":";
    l.setAttribute("for", f);
    l.setAttribute("data-i18n", f.toUpperCase());
    const iDiv = document.createElement("div");
    iDiv.className = "input-container";
    const bar = createFormattingToolbar();
    const inp = document.createElement("div");
    inp.id = f;
    inp.contentEditable = "true";
    inp.className = "editable-div";
    iDiv.appendChild(bar);
    iDiv.appendChild(inp);
    d.appendChild(l);
    d.appendChild(iDiv);
    c.appendChild(d);
    chrome.storage.local.get(f, (r) => {
      if (r[f]) {
        inp.innerHTML = r[f];
      }
    });
    inp.addEventListener("input", () => {
      chrome.storage.local.set({ [f]: inp.innerHTML });
    });
    inp.addEventListener("focus", () => {
      d.classList.add("focused");
    });
    inp.addEventListener("blur", () => {
      d.classList.remove("focused");
    });
  });
  populateAudioFieldSelect(fs);
}

function createFormattingToolbar() {
  const t = document.createElement("div");
  t.className = "field-formatting-toolbar";
  if (!enableFormatting) {
    t.style.display = "none";
  }
  const cmds = [
    { cmd: "bold", icon: '<i class="fas fa-bold"></i>' },
    { cmd: "italic", icon: '<i class="fas fa-italic"></i>' },
    { cmd: "underline", icon: '<i class="fas fa-underline"></i>' },
    { cmd: "subscript", icon: '<i class="fas fa-subscript"></i>' },
    { cmd: "superscript", icon: '<i class="fas fa-superscript"></i>' },
    { cmd: "removeFormat", icon: '<i class="fas fa-eraser"></i>' },
  ];
  cmds.forEach((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "format-button";
    b.innerHTML = o.icon;
    b.setAttribute("data-command", o.cmd);
    b.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.execCommand(o.cmd, false, null);
    });
    t.appendChild(b);
  });
  if (currentModelIsCloze && enableCloze) {
    t.classList.add("has-cloze");
    const separator = document.createElement("span");
    separator.className = "toolbar-separator";
    t.appendChild(separator);
    [1, 2, 3].forEach((num) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "format-button cloze-button";
      b.innerHTML = `C${num}`;
      b.title = getMessage('CLOZE_DELETION_TITLE').replace('$num$', num) || `Cloze deletion ${num}`;
      b.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const parentFormGroup = e.target.closest(".form-group");
        if (parentFormGroup) {
          const editableDiv = parentFormGroup.querySelector(".editable-div");
          if (editableDiv) {
            wrapSelectionWithCloze(num, editableDiv);
          }
        }
      });
      t.appendChild(b);
    });
    const autoBtn = document.createElement("button");
    autoBtn.type = "button";
    autoBtn.className = "format-button cloze-button cloze-auto";
    autoBtn.innerHTML = "C+";
    autoBtn.title = getMessage('CLOZE_AUTO_INCREMENT_TITLE');
    autoBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const parentFormGroup = e.target.closest(".form-group");
      if (parentFormGroup) {
        const editableDiv = parentFormGroup.querySelector(".editable-div");
        if (editableDiv) {
          wrapSelectionWithAutoCloze(editableDiv);
        }
      }
    });
    t.appendChild(autoBtn);
    const helpBtn = document.createElement("button");
    helpBtn.type = "button";
    helpBtn.className = "format-button cloze-help-button";
    helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpBtn.title = getMessage('CLOZE_HELP_TITLE');
    helpBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      toggleClozeTooltip(helpBtn);
    });
    t.appendChild(helpBtn);
  }
  return t;
}

function toggleClozeTooltip(button) {
  const tooltip = document.getElementById("clozeTooltip");
  const isHidden = tooltip.classList.contains("hidden");

  if (isHidden) {
    tooltip.classList.remove("hidden");
    button.classList.add("active");
  } else {
    tooltip.classList.add("hidden");
    button.classList.remove("active");
  }
}

function populateAudioFieldSelect(fs) {
  const sel = document.getElementById("audioFieldSelect");
  sel.innerHTML = "";
  fs.forEach((f) => {
    const op = document.createElement("option");
    op.value = f;
    op.textContent = f;
    sel.appendChild(op);
  });
  chrome.storage.local.get("selectedAudioField", (r) => {
    if (r.selectedAudioField && fs.includes(r.selectedAudioField)) {
      sel.value = r.selectedAudioField;
    } else {
      const first = fs[0];
      sel.value = first;
      chrome.storage.local.set({ selectedAudioField: first });
    }
  });
  sel.addEventListener("change", function () {
    chrome.storage.local.set({ selectedAudioField: sel.value });
  });
}

async function fetchAnkiData(a, p = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "fetchAnkiData", ankiAction: a, params: p },
      (resp) => {
        if (resp && typeof resp === "object") {
          resolve(resp);
        } else {
          console.error("Invalid response structure from background:", resp);
          reject(
            new Error("Failed to fetch Anki data or invalid response structure")
          );
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener((m, s, se) => {
  if (m.action === "notify") {
    sendNotification(m.title, m.message);
  }
});

function sendNotification(t, m) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/images/icon.png",
    title: getMessage(t) || t,
    message: getMessage(m) || m,
    priority: 2,
  });
}

function checkAnkiStatus() {
  chrome.runtime.sendMessage({ action: "checkAnkiStatus" }, (r) => {
    if (r?.status === "running") {
      document.getElementById("ankiMessage").classList.add("hidden");
      document.getElementById("ankiForm").classList.remove("hidden");
      fetchDecksAndModels();
      fetchAnkiTags();
    } else {
      document.getElementById("ankiMessage").classList.remove("hidden");
      document.getElementById("ankiForm").classList.add("hidden");
    }
  });
}

function fetchDecksAndModels() {
  Promise.all([fetchAnkiData("deckNames"), fetchAnkiData("modelNames")])
    .then(([d, m]) => {
      if (d && d.result) {
        populateSelect("deck", d.result);
        chrome.storage.local.get("selectedDeck", (r) => {
          if (r.selectedDeck) {
            document.getElementById("deck").value = r.selectedDeck;
          }
        });
      }
      if (m && m.result) {
        populateSelect("model", m.result);
        chrome.storage.local.get("selectedModel", (r) => {
          if (r.selectedModel) {
            document.getElementById("model").value = r.selectedModel;
            detectAndRenderModel(r.selectedModel);
          }
        });
      }
    })
    .catch((e) => {});
}

function fetchAnkiTags() {
  fetchAnkiData("getTags")
    .then((response) => {
      if (response && response.result) {
        allAnkiTags = response.result.sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
      } else {
        allAnkiTags = [];
        console.warn("Could not fetch Anki tags:", response?.error);
      }
    })
    .catch((error) => {
      allAnkiTags = [];
      console.error("Error fetching Anki tags:", error);
    });
}

function populateSelect(id, it) {
  const s = document.getElementById(id);
  s.innerHTML = "";
  const defOpt = document.createElement("option");
  defOpt.value = "";
  defOpt.disabled = true;
  defOpt.selected = true;
  const k = "SELECT_" + id.toUpperCase();
  defOpt.textContent = getMessage(k) || "Select " + id.charAt(0).toUpperCase() + id.slice(1);
  s.appendChild(defOpt);
  it.forEach((i) => {
    const op = document.createElement("option");
    op.value = i;
    op.textContent = i;
    s.appendChild(op);
  });
}

function initAudioUploadFeature() {
  const uInline = document.getElementById("uploadButtonInline");
  const af = document.getElementById("audioFileInput");
  const n = document.getElementById("audioFileName");
  const sel = document.getElementById("audioFieldSelect");
  const sec = document.querySelector(".audio-section");
  const rem = document.getElementById("removeAudioButton");
  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.id = "audioData";
  document.getElementById("ankiForm").appendChild(hidden);

  if (uInline) {
    uInline.addEventListener("click", () => {
      const isFirefox = typeof browser !== "undefined";
      
      if (isFirefox) {
        // Firefox closes the popup when choosing a file. 
        // We open a separate window to handle the upload if not already in one.
        browser.windows.getCurrent().then(currentWindow => {
           if (document.body.classList.contains("sidepanel")) {
               af.click();
               return;
           }

           if (window.innerWidth > 500 && window.innerHeight > 500) { 
               af.click();
               return;
           }

           browser.windows.create({
              url: chrome.runtime.getURL("pages/popup.html"),
              type: "popup",
              width: 450,
              height: 600
           }).then(() => {
              window.close();
           });
        });
        
        return;
      }
      
      af.click();
    });
  }
  af.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      const r = new FileReader();
      r.onloadend = function (x) {
        const base64 = x.target.result.split(",")[1];
        chrome.runtime.sendMessage(
          {
            action: "addAudio",
            filename: file.name,
            data: base64,
          },
          (resp) => {
            if (resp && resp.success) {
              document.getElementById("audioData").value = file.name;
              n.textContent = file.name;
              n.title = file.name;
              sel.style.display = "inline-block";
              sec.classList.add("audio-uploaded");
              rem.style.display = "inline-block";
            } else {
              alert(getMessage('UPLOAD_AUDIO_FAILED') + ": " + resp.error);
            }
          }
        );
      };
      r.readAsDataURL(file);
    } else {
      alert(getMessage('SELECT_VALID_AUDIO_FILE'));
    }
  });
  rem.addEventListener("click", () => {
    document.getElementById("audioData").value = "";
    n.textContent = "";
    n.title = "";
    sel.style.display = "none";
    sec.classList.remove("audio-uploaded");
    af.value = "";
    rem.style.display = "none";
  });
  rem.style.display = "none";
}

function initializeTheme() {
  chrome.storage.local.get(["theme"], (r) => {
    if (r.theme === "dark") {
      document.body.classList.add("dark-mode");
      updateToggleIcon(true);
    } else {
      document.body.classList.remove("dark-mode");
      updateToggleIcon(false);
    }
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const d = document.body.classList.contains("dark-mode");
  chrome.storage.local.set({ theme: d ? "dark" : "light" }, () => {
    updateToggleIcon(d);
  });
}

function updateToggleIcon(d) {
  const b = document.getElementById("themeToggle");
  const i = b.querySelector("i");
  if (d) {
    i.classList.remove("fa-moon");
    i.classList.add("fa-sun");
  } else {
    i.classList.remove("fa-sun");
    i.classList.add("fa-moon");
  }
}

function shortenTagName(tagName) {
  if (tagName.includes("::")) {
    var parts = tagName.split("::");
    var first = parts[0];
    var last = parts[parts.length - 1];
    var shortFirst = first.length > 5 ? first.substring(0, 5) : first;
    return shortFirst + "...::" + last;
  }
  return tagName;
}

function initTagsInput() {
  const tagsContainer = document.getElementById("tagsContainer");
  const tagsInputArea = tagsContainer.querySelector(".tags-input-area");
  const tagInputField = document.getElementById("tagInputField");
  const tagSuggestions = document.getElementById("tagSuggestions");
  tagsInputArea.addEventListener("click", () => {
    tagInputField.focus();
  });
  tagInputField.addEventListener("input", handleTagInput);
  tagInputField.addEventListener("keydown", handleTagKeyDown);
  tagsInputArea.addEventListener("click", handleRemoveTagClick);
  tagSuggestions.addEventListener("click", handleSuggestionClick);
  document.addEventListener("click", (e) => {
    if (!tagsContainer.contains(e.target)) {
      tagSuggestions.style.display = "none";
    }
  });
}

function handleTagInput(e) {
  const tagInputField = e.target;
  const inputValue = tagInputField.value.trim();
  const tagSuggestions = document.getElementById("tagSuggestions");
  if (inputValue.length === 0) {
    tagSuggestions.style.display = "none";
    tagSuggestions.innerHTML = "";
    return;
  }
  const suggestions = allAnkiTags
    .filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()))
    .filter((tag) => !selectedTags.includes(tag))
    .slice(0, 10);
  renderSuggestions(suggestions);
  updateTagPlaceholderVisibility();
}

function handleTagKeyDown(e) {
  const tagInputField = e.target;
  const inputValue = tagInputField.value.trim();
  if (["Enter", "Tab", " "].includes(e.key)) {
    if (inputValue) {
      e.preventDefault();
      addTag(inputValue);
      tagInputField.value = "";
      hideSuggestions();
      updateTagPlaceholderVisibility();
    }
  } else if (e.key === "Backspace" && tagInputField.value === "") {
    if (selectedTags.length > 0) {
      const lastTag = selectedTags[selectedTags.length - 1];
      removeTagByName(lastTag);
      updateTagPlaceholderVisibility();
    }
  }
}

function handleRemoveTagClick(e) {
  if (e.target.classList.contains("remove-tag")) {
    const tagToken = e.target.closest(".tag-token");
    if (tagToken) {
      const tagName = tagToken.getAttribute("title");
      removeTagByName(tagName);
    }
  }
}

function handleSuggestionClick(e) {
  if (e.target.classList.contains("suggestion-item")) {
    const tagName = e.target.textContent;
    addTag(tagName);
    document.getElementById("tagInputField").value = "";
    hideSuggestions();
  }
}

function addTag(tagName) {
  tagName = tagName.trim();
  if (!tagName || selectedTags.includes(tagName)) {
    return;
  }
  selectedTags.push(tagName);
  renderTagToken(tagName);
  saveSelectedTags();
  updateTagPlaceholderVisibility();
}

function removeTagByName(tagName) {
  selectedTags = selectedTags.filter((t) => t !== tagName);
  const tagsInputArea = document.querySelector(".tags-input-area");
  const tagTokens = tagsInputArea.querySelectorAll(".tag-token");
  tagTokens.forEach((token) => {
    if (token.getAttribute("title") === tagName) {
      tagsInputArea.removeChild(token);
    }
  });
  saveSelectedTags();
  updateTagPlaceholderVisibility();
}

function renderTagToken(tagName) {
  const tagsInputArea = document.querySelector(".tags-input-area");
  const tagInputField = document.getElementById("tagInputField");
  const token = document.createElement("span");
  token.setAttribute("title", tagName);
  token.className = "tag-token";
  token.textContent = shortenTagName(tagName);
  const removeBtn = document.createElement("span");
  removeBtn.className = "remove-tag";
  removeBtn.innerHTML = "×";
  token.appendChild(removeBtn);
  tagsInputArea.insertBefore(token, tagInputField);
}

function renderInitialTags() {
  const tagsInputArea = document.querySelector(".tags-input-area");
  const tagInputField = document.getElementById("tagInputField");
  tagsInputArea
    .querySelectorAll(".tag-token")
    .forEach((token) => token.remove());
  selectedTags.forEach((tag) => renderTagToken(tag));
  updateTagPlaceholderVisibility();
}

function renderSuggestions(suggestions) {
  const tagSuggestions = document.getElementById("tagSuggestions");
  tagSuggestions.innerHTML = "";
  if (suggestions.length === 0) {
    tagSuggestions.style.display = "none";
    return;
  }
  suggestions.forEach((tag) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = tag;
    tagSuggestions.appendChild(item);
  });
  tagSuggestions.style.display = "block";
}

function hideSuggestions() {
  const tagSuggestions = document.getElementById("tagSuggestions");
  tagSuggestions.style.display = "none";
  tagSuggestions.innerHTML = "";
}

function saveSelectedTags() {
  chrome.storage.local.set({ currentSelectedTags: selectedTags });
}

function updateTagPlaceholderVisibility() {
  const tagInputField = document.getElementById("tagInputField");
  if (!tagInputField) return;
  if (!tagInputField.dataset.originalPlaceholder) {
    tagInputField.dataset.originalPlaceholder =
      tagInputField.placeholder || "Add tags...";
  }
  if (selectedTags.length > 0) {
    tagInputField.placeholder = "";
  } else {
    tagInputField.placeholder = tagInputField.dataset.originalPlaceholder;
  }
}
