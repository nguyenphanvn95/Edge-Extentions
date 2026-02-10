/**
 * Photo Editor Pro - Photoshop-like Editor
 * Version 4.0.0 - Professional Edition
 */

// ==================== CORE UTILITIES ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ==================== STATE MANAGEMENT ====================
const state = {
  tool: 'move',
  document: null,
  layers: [],
  selectedLayerIds: [],
  history: [],
  historyIndex: -1,
  zoom: 1,
  canvasOffset: { x: 0, y: 0 },
  brush: {
    size: 20,
    hardness: 80,
    opacity: 100,
    flow: 100,
    color: '#000000'
  },
  selection: null,
  clipboard: null,
  isDrawing: false,
  lastPoint: null,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  adjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0
  }
};

// ==================== CANVAS SETUP ====================
const backgroundCanvas = $('#backgroundCanvas');
const mainCanvas = $('#mainCanvas');
const layerCanvas = $('#layerCanvas');
const overlayCanvas = $('#overlayCanvas');
const cursorCanvas = $('#cursorCanvas');

const backgroundCtx = backgroundCanvas.getContext('2d');
const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });
const layerCtx = layerCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');
const cursorCtx = cursorCanvas.getContext('2d');

// ==================== LAYER SYSTEM ====================
class Layer {
  constructor(type = 'raster', name = 'Layer', width = 800, height = 600) {
    this.id = Date.now() + Math.random();
    this.type = type; // raster, text, shape, adjustment
    this.name = name;
    this.visible = true;
    this.locked = false;
    this.opacity = 100;
    this.blendMode = 'normal';
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.mask = null;
    this.effects = {
      dropShadow: null,
      innerShadow: null,
      outerGlow: null,
      innerGlow: null,
      stroke: null,
      bevel: null
    };
    this.bounds = { x: 0, y: 0, width, height };
  }

  getContext() {
    return this.ctx;
  }

  getThumbnail(size = 40) {
    const thumb = document.createElement('canvas');
    thumb.width = size;
    thumb.height = size;
    const ctx = thumb.getContext('2d');
    
    const scale = Math.min(size / this.canvas.width, size / this.canvas.height);
    const w = this.canvas.width * scale;
    const h = this.canvas.height * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    
    ctx.drawImage(this.canvas, x, y, w, h);
    return thumb.toDataURL();
  }
}

function createDocument(width, height, name = 'Untitled') {
  state.document = {
    name: name,
    width: width,
    height: height,
    colorMode: 'RGB',
    bitDepth: 8
  };

  // Setup canvases
  [backgroundCanvas, mainCanvas, layerCanvas, overlayCanvas, cursorCanvas].forEach(canvas => {
    canvas.width = width;
    canvas.height = height;
  });

  // Create background layer
  const bgLayer = new Layer('raster', 'Background', width, height);
  bgLayer.ctx.fillStyle = '#ffffff';
  bgLayer.ctx.fillRect(0, 0, width, height);
  bgLayer.locked = true;
  
  state.layers = [bgLayer];
  state.selectedLayerIds = [bgLayer.id];
  
  updateDocInfo();
  updateLayersList();
  render();
  saveHistory('New Document');
}

function getSelectedLayer() {
  return state.layers.find(l => l.id === state.selectedLayerIds[0]);
}

function addLayer(type = 'raster', name) {
  const layer = new Layer(
    type,
    name || `${type} ${state.layers.length + 1}`,
    state.document.width,
    state.document.height
  );
  state.layers.push(layer);
  state.selectedLayerIds = [layer.id];
  updateLayersList();
  render();
  saveHistory('New Layer');
  return layer;
}

function deleteLayer(layerId) {
  const index = state.layers.findIndex(l => l.id === layerId);
  if (index !== -1 && state.layers.length > 1) {
    state.layers.splice(index, 1);
    if (state.selectedLayerIds.includes(layerId)) {
      state.selectedLayerIds = [state.layers[Math.max(0, index - 1)].id];
    }
    updateLayersList();
    render();
    saveHistory('Delete Layer');
  }
}

function duplicateLayer(layerId) {
  const layer = state.layers.find(l => l.id === layerId);
  if (!layer) return;
  
  const newLayer = new Layer(layer.type, layer.name + ' copy', layer.canvas.width, layer.canvas.height);
  newLayer.ctx.drawImage(layer.canvas, 0, 0);
  newLayer.opacity = layer.opacity;
  newLayer.blendMode = layer.blendMode;
  
  const index = state.layers.indexOf(layer);
  state.layers.splice(index + 1, 0, newLayer);
  state.selectedLayerIds = [newLayer.id];
  
  updateLayersList();
  render();
  saveHistory('Duplicate Layer');
}

function mergeDown() {
  if (state.selectedLayerIds.length === 0) return;
  
  const layer = getSelectedLayer();
  const index = state.layers.indexOf(layer);
  if (index === 0) return;
  
  const below = state.layers[index - 1];
  
  below.ctx.save();
  below.ctx.globalAlpha = layer.opacity / 100;
  below.ctx.globalCompositeOperation = layer.blendMode;
  below.ctx.drawImage(layer.canvas, 0, 0);
  below.ctx.restore();
  
  state.layers.splice(index, 1);
  state.selectedLayerIds = [below.id];
  
  updateLayersList();
  render();
  saveHistory('Merge Down');
}

function updateLayersList() {
  const list = $('#layersList');
  list.innerHTML = '';
  
  [...state.layers].reverse().forEach(layer => {
    const item = document.createElement('div');
    item.className = 'layer-item' + (state.selectedLayerIds.includes(layer.id) ? ' selected' : '');
    item.onclick = () => selectLayer(layer.id);
    
    const thumb = document.createElement('div');
    thumb.className = 'layer-thumbnail';
    const thumbImg = document.createElement('img');
    thumbImg.src = layer.getThumbnail(40);
    thumbImg.style.maxWidth = '100%';
    thumbImg.style.maxHeight = '100%';
    thumb.appendChild(thumbImg);
    
    const info = document.createElement('div');
    info.className = 'layer-info';
    
    const name = document.createElement('div');
    name.className = 'layer-name';
    name.textContent = layer.name;
    
    const type = document.createElement('div');
    type.className = 'layer-type';
    type.textContent = layer.type;
    
    info.appendChild(name);
    info.appendChild(type);
    
    const icons = document.createElement('div');
    icons.className = 'layer-icons';
    icons.innerHTML = `
      ${layer.visible ? '👁️' : '🚫'}
      ${layer.locked ? '🔒' : ''}
    `;
    
    item.appendChild(thumb);
    item.appendChild(info);
    item.appendChild(icons);
    list.appendChild(item);
  });
  
  updateLayerControls();
}

function selectLayer(layerId, addToSelection = false) {
  if (addToSelection) {
    if (state.selectedLayerIds.includes(layerId)) {
      state.selectedLayerIds = state.selectedLayerIds.filter(id => id !== layerId);
    } else {
      state.selectedLayerIds.push(layerId);
    }
  } else {
    state.selectedLayerIds = [layerId];
  }
  updateLayersList();
}

function updateLayerControls() {
  const layer = getSelectedLayer();
  if (!layer) return;
  
  $('#blendMode').value = layer.blendMode;
  $('#layerOpacity').value = layer.opacity;
  $('#opacityValue').textContent = layer.opacity + '%';
}

// ==================== RENDERING ====================
function render() {
  // Clear canvases
  mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  layerCtx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  // Render all visible layers
  state.layers.forEach(layer => {
    if (!layer.visible) return;
    
    const ctx = mainCtx;
    ctx.save();
    ctx.globalAlpha = layer.opacity / 100;
    ctx.globalCompositeOperation = layer.blendMode;
    ctx.drawImage(layer.canvas, layer.bounds.x, layer.bounds.y);
    ctx.restore();
  });
  
  // Apply adjustments
  if (hasAdjustments()) {
    applyAdjustments();
  }
  
  renderOverlay();
}

function hasAdjustments() {
  return Object.values(state.adjustments).some(v => v !== 0);
}

function applyAdjustments() {
  const imageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
  const data = imageData.data;
  
  const bright = state.adjustments.brightness * 2.55;
  const contrast = (state.adjustments.contrast + 100) / 100;
  const satMod = state.adjustments.saturation / 100;
  const expMod = Math.pow(2, state.adjustments.exposure / 100);
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Brightness
    r += bright;
    g += bright;
    b += bright;
    
    // Contrast
    r = ((r - 128) * contrast) + 128;
    g = ((g - 128) * contrast) + 128;
    b = ((b - 128) * contrast) + 128;
    
    // Exposure
    r *= expMod;
    g *= expMod;
    b *= expMod;
    
    // Saturation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * (1 + satMod);
    g = gray + (g - gray) * (1 + satMod);
    b = gray + (b - gray) * (1 + satMod);
    
    data[i] = clamp(r, 0, 255);
    data[i + 1] = clamp(g, 0, 255);
    data[i + 2] = clamp(b, 0, 255);
  }
  
  mainCtx.putImageData(imageData, 0, 0);
}

function renderOverlay() {
  if (state.selection) {
    overlayCtx.strokeStyle = '#3385ff';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([5, 5]);
    overlayCtx.strokeRect(
      state.selection.x,
      state.selection.y,
      state.selection.width,
      state.selection.height
    );
    overlayCtx.setLineDash([]);
  }
}

// ==================== FILTERS ====================
const Filters = {
  gaussianBlur(ctx, width, height, radius = 5) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const blurred = this.boxBlur(imageData, width, height, radius);
    ctx.putImageData(blurred, 0, 0);
  },
  
  boxBlur(imageData, width, height, radius) {
    const data = imageData.data;
    const output = new ImageData(width, height);
    const outData = output.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = x + kx;
            const py = y + ky;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }
        }
        
        const idx = (y * width + x) * 4;
        outData[idx] = r / count;
        outData[idx + 1] = g / count;
        outData[idx + 2] = b / count;
        outData[idx + 3] = a / count;
      }
    }
    
    return output;
  },
  
  sharpen(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    this.applyConvolution(imageData, kernel, width, height);
    ctx.putImageData(imageData, 0, 0);
  },
  
  applyConvolution(imageData, kernel, width, height) {
    const data = imageData.data;
    const temp = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const k = kernel[(ky + 1) * 3 + (kx + 1)];
            r += temp[idx] * k;
            g += temp[idx + 1] * k;
            b += temp[idx + 2] * k;
          }
        }
        
        const idx = (y * width + x) * 4;
        data[idx] = clamp(r, 0, 255);
        data[idx + 1] = clamp(g, 0, 255);
        data[idx + 2] = clamp(b, 0, 255);
      }
    }
  }
};

// ==================== HISTORY ====================
function saveHistory(action) {
  const snapshot = {
    action: action,
    timestamp: Date.now(),
    layers: state.layers.map(l => ({
      id: l.id,
      name: l.name,
      visible: l.visible,
      locked: l.locked,
      opacity: l.opacity,
      blendMode: l.blendMode,
      imageData: l.ctx.getImageData(0, 0, l.canvas.width, l.canvas.height)
    }))
  };
  
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex++;
  
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }
  
  updateHistoryList();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    restoreHistory(state.history[state.historyIndex]);
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    restoreHistory(state.history[state.historyIndex]);
  }
}

function restoreHistory(snapshot) {
  state.layers = snapshot.layers.map(l => {
    const layer = new Layer(l.type, l.name);
    layer.id = l.id;
    layer.visible = l.visible;
    layer.locked = l.locked;
    layer.opacity = l.opacity;
    layer.blendMode = l.blendMode;
    if (l.imageData) {
      layer.ctx.putImageData(l.imageData, 0, 0);
    }
    return layer;
  });
  
  updateLayersList();
  render();
}

function updateHistoryList() {
  const list = $('#historyList');
  list.innerHTML = '';
  
  state.history.forEach((item, index) => {
    const histItem = document.createElement('div');
    histItem.className = 'history-item' + (index === state.historyIndex ? ' active' : '');
    histItem.textContent = item.action;
    histItem.onclick = () => {
      state.historyIndex = index;
      restoreHistory(item);
    };
    list.appendChild(histItem);
  });
}

// ==================== TOOLS ====================
function setTool(toolName) {
  state.tool = toolName;
  $$('.tool-btn').forEach(btn => btn.classList.remove('active'));
  const btn = $(`.tool-btn[data-tool="${toolName}"]`);
  if (btn) btn.classList.add('active');
  updateOptionsBar();
  updateDocInfo();
}

function updateOptionsBar() {
  const bar = $('#optionsBar');
  bar.innerHTML = '';
  
  switch(state.tool) {
    case 'brush':
      bar.innerHTML = `
        <label style="font-size:11px;color:#a0a0a0">Size:</label>
        <input type="range" id="brushSize" min="1" max="200" value="${state.brush.size}" style="width:100px" />
        <span id="brushSizeVal" style="font-size:11px;color:#d4d4d4;min-width:40px">${state.brush.size}px</span>
        <label style="font-size:11px;color:#a0a0a0;margin-left:12px">Hardness:</label>
        <input type="range" id="brushHardness" min="0" max="100" value="${state.brush.hardness}" style="width:100px" />
        <span id="brushHardnessVal" style="font-size:11px;color:#d4d4d4;min-width:40px">${state.brush.hardness}%</span>
        <label style="font-size:11px;color:#a0a0a0;margin-left:12px">Opacity:</label>
        <input type="range" id="brushOpacity" min="1" max="100" value="${state.brush.opacity}" style="width:100px" />
        <span id="brushOpacityVal" style="font-size:11px;color:#d4d4d4;min-width:40px">${state.brush.opacity}%</span>
      `;
      
      $('#brushSize').oninput = (e) => {
        state.brush.size = parseInt(e.target.value);
        $('#brushSizeVal').textContent = state.brush.size + 'px';
      };
      $('#brushHardness').oninput = (e) => {
        state.brush.hardness = parseInt(e.target.value);
        $('#brushHardnessVal').textContent = state.brush.hardness + '%';
      };
      $('#brushOpacity').oninput = (e) => {
        state.brush.opacity = parseInt(e.target.value);
        $('#brushOpacityVal').textContent = state.brush.opacity + '%';
      };
      break;
      
    case 'text':
      bar.innerHTML = `
        <input type="text" placeholder="Type text here..." style="padding:4px 8px;background:#1e1e1e;border:1px solid #525252;color:#d4d4d4;font-size:11px;width:200px;border-radius:2px" />
        <select style="background:#1e1e1e;border:1px solid #525252;color:#d4d4d4;padding:4px 8px;font-size:11px;margin-left:8px;border-radius:2px">
          <option>Arial</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Georgia</option>
          <option>Verdana</option>
        </select>
        <input type="number" value="48" min="8" max="200" style="width:60px;padding:4px 8px;background:#1e1e1e;border:1px solid #525252;color:#d4d4d4;font-size:11px;margin-left:8px;border-radius:2px" />
      `;
      break;
      
    default:
      bar.innerHTML = '<div class="options-empty">Select a tool to see options</div>';
  }
}

// ==================== BRUSH DRAWING ====================
function drawBrush(x, y) {
  const layer = getSelectedLayer();
  if (!layer || layer.locked) return;
  
  const ctx = layer.ctx;
  const size = state.brush.size;
  const hardness = state.brush.hardness / 100;
  const opacity = state.brush.opacity / 100;
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
  const color = state.foregroundColor;
  const rgb = hexToRgb(color);
  
  gradient.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`);
  gradient.addColorStop(hardness, `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity * 0.5})`);
  gradient.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  render();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// ==================== FILE OPERATIONS ====================
function openFile() {
  $('#fileInput').click();
}

$('#fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      createDocument(img.width, img.height, file.name);
      const layer = state.layers[0];
      layer.ctx.drawImage(img, 0, 0);
      render();
      updateDocInfo();
      saveHistory('Open');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

function exportImage() {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.document.width;
  exportCanvas.height = state.document.height;
  const exportCtx = exportCanvas.getContext('2d');
  
  exportCtx.drawImage(mainCanvas, 0, 0);
  
  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.document.name}_export.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ==================== UI UPDATES ====================
function updateDocInfo() {
  if (state.document) {
    $('#docInfo').textContent = `${state.document.name} (${state.document.width}×${state.document.height})`;
  } else {
    $('#docInfo').textContent = 'No document';
  }
}

function updateZoom() {
  $('#zoomInfo').textContent = Math.round(state.zoom * 100) + '%';
  const transform = `translate(-50%, -50%) scale(${state.zoom})`;
  [backgroundCanvas, mainCanvas, layerCanvas, overlayCanvas, cursorCanvas].forEach(canvas => {
    canvas.style.transform = transform;
  });
}

// ==================== EVENT LISTENERS ====================

// Tool buttons
$$('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTool(btn.dataset.tool);
  });
});

// Menu actions
$$('.menu-option').forEach(opt => {
  opt.addEventListener('click', (e) => {
    const action = opt.dataset.action;
    if (!action) return;
    
    switch(action) {
      case 'new':
        createDocument(1920, 1080, 'Untitled');
        break;
      case 'open':
        openFile();
        break;
      case 'save':
      case 'export':
        exportImage();
        break;
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'new-layer':
        addLayer('raster', 'New Layer');
        break;
      case 'duplicate-layer':
        if (state.selectedLayerIds[0]) duplicateLayer(state.selectedLayerIds[0]);
        break;
      case 'delete-layer':
        if (state.selectedLayerIds[0]) deleteLayer(state.selectedLayerIds[0]);
        break;
      case 'merge-down':
        mergeDown();
        break;
      case 'auto-tone':
      case 'auto-contrast':
      case 'auto-color':
        alert('Auto adjustments coming soon!');
        break;
      case 'zoom-in':
        state.zoom = Math.min(state.zoom * 1.2, 10);
        updateZoom();
        break;
      case 'zoom-out':
        state.zoom = Math.max(state.zoom / 1.2, 0.1);
        updateZoom();
        break;
      case 'fit-screen':
        state.zoom = 1;
        updateZoom();
        break;
    }
  });
});

// Color swatches
$('#foregroundColor').addEventListener('click', () => $('#fgColorPicker').click());
$('#backgroundColor').addEventListener('click', () => $('#bgColorPicker').click());

$('#fgColorPicker').addEventListener('input', (e) => {
  state.foregroundColor = e.target.value;
  $('#foregroundColor').style.background = e.target.value;
  state.brush.color = e.target.value;
});

$('#bgColorPicker').addEventListener('input', (e) => {
  state.backgroundColor = e.target.value;
  $('#backgroundColor').style.background = e.target.value;
});

$('.swatch-swap').addEventListener('click', () => {
  const temp = state.foregroundColor;
  state.foregroundColor = state.backgroundColor;
  state.backgroundColor = temp;
  $('#foregroundColor').style.background = state.foregroundColor;
  $('#backgroundColor').style.background = state.backgroundColor;
  $('#fgColorPicker').value = state.foregroundColor;
  $('#bgColorPicker').value = state.backgroundColor;
});

$('.swatch-reset').addEventListener('click', () => {
  state.foregroundColor = '#000000';
  state.backgroundColor = '#ffffff';
  $('#foregroundColor').style.background = state.foregroundColor;
  $('#backgroundColor').style.background = state.backgroundColor;
  $('#fgColorPicker').value = state.foregroundColor;
  $('#bgColorPicker').value = state.backgroundColor;
});

// Layer controls
$('#btnNewLayer').addEventListener('click', () => addLayer());
$('#btnDeleteLayer').addEventListener('click', () => {
  if (state.selectedLayerIds[0]) deleteLayer(state.selectedLayerIds[0]);
});

$('#layerOpacity').addEventListener('input', (e) => {
  const layer = getSelectedLayer();
  if (layer) {
    layer.opacity = parseInt(e.target.value);
    $('#opacityValue').textContent = layer.opacity + '%';
    render();
  }
});

$('#blendMode').addEventListener('change', (e) => {
  const layer = getSelectedLayer();
  if (layer) {
    layer.blendMode = e.target.value;
    render();
  }
});

// Adjustments
['brightness', 'contrast', 'saturation', 'exposure'].forEach(adj => {
  const input = $(`#${adj}`);
  if (input) {
    input.addEventListener('input', (e) => {
      state.adjustments[adj] = parseInt(e.target.value);
      $(`#${adj}Val`).textContent = state.adjustments[adj];
      render();
    });
  }
});

// Canvas drawing
let isDrawing = false;
let lastPoint = null;

overlayCanvas.addEventListener('mousedown', (e) => {
  const rect = overlayCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (overlayCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (overlayCanvas.height / rect.height);
  
  isDrawing = true;
  lastPoint = { x, y };
  
  if (state.tool === 'brush') {
    drawBrush(x, y);
  }
});

overlayCanvas.addEventListener('mousemove', (e) => {
  const rect = overlayCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (overlayCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (overlayCanvas.height / rect.height);
  
  $('#posInfo').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
  
  if (isDrawing && state.tool === 'brush' && lastPoint) {
    const dist = distance(lastPoint.x, lastPoint.y, x, y);
    const steps = Math.max(1, Math.floor(dist / 2));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ix = lastPoint.x + (x - lastPoint.x) * t;
      const iy = lastPoint.y + (y - lastPoint.y) * t;
      drawBrush(ix, iy);
    }
    
    lastPoint = { x, y };
  }
});

overlayCanvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    lastPoint = null;
    saveHistory('Brush');
  }
});

overlayCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
  lastPoint = null;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key.toLowerCase()) {
      case 'z':
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        break;
      case 'y':
        e.preventDefault();
        redo();
        break;
      case 'n':
        e.preventDefault();
        if (e.shiftKey) addLayer();
        else createDocument(1920, 1080);
        break;
      case 'o':
        e.preventDefault();
        openFile();
        break;
      case 's':
        e.preventDefault();
        exportImage();
        break;
      case 'j':
        e.preventDefault();
        if (state.selectedLayerIds[0]) duplicateLayer(state.selectedLayerIds[0]);
        break;
    }
  } else {
    // Tool shortcuts
    const toolKeys = {
      'v': 'move',
      'm': 'select',
      'l': 'lasso',
      'w': 'magic-wand',
      'c': 'crop',
      'i': 'eyedropper',
      'j': 'spot-heal',
      'b': 'brush',
      's': 'clone',
      'e': 'eraser',
      'g': 'gradient',
      'o': 'dodge',
      'p': 'pen',
      't': 'text',
      'u': 'rectangle',
      'h': 'hand',
      'z': 'zoom',
      'x': 'swap-colors',
      'd': 'reset-colors'
    };
    
    if (toolKeys[e.key.toLowerCase()]) {
      e.preventDefault();
      if (e.key === 'x') {
        $('.swatch-swap').click();
      } else if (e.key === 'd') {
        $('.swatch-reset').click();
      } else {
        setTool(toolKeys[e.key.toLowerCase()]);
      }
    }
  }
});

// Panel collapse
$$('.panel-header').forEach(header => {
  header.addEventListener('click', (e) => {
    if (e.target.classList.contains('panel-collapse')) return;
    const content = header.nextElementSibling;
    const collapse = header.querySelector('.panel-collapse');
    if (content.style.display === 'none') {
      content.style.display = 'block';
      collapse.textContent = '−';
    } else {
      content.style.display = 'none';
      collapse.textContent = '+';
    }
  });
});

// Initialize
$('#foregroundColor').style.background = state.foregroundColor;
$('#backgroundColor').style.background = state.backgroundColor;
updateDocInfo();
updateZoom();
setTool('move');

// Create welcome document
createDocument(1920, 1080, 'Untitled-1');

console.log('Photo Editor Pro initialized');
console.log('Shortcuts: Ctrl+N (new), Ctrl+O (open), Ctrl+S (save), Ctrl+Z (undo), Ctrl+Shift+Z (redo)');
console.log('Tools: V (move), B (brush), E (eraser), T (text), M (select), L (lasso), etc.');
