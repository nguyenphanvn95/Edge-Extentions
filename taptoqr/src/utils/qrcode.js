/**
 * QR Code generation utility using local qrcode-generator library.
 */

let qrLibLoadPromise = null;

/**
 * Ensure QR library is loaded into extension page context.
 */
async function ensureQRCodeLib() {
  if (globalThis.qrcode) {
    return globalThis.qrcode;
  }

  if (qrLibLoadPromise) {
    await qrLibLoadPromise;
    return globalThis.qrcode;
  }

  qrLibLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('src/libs/qrcode-generator.js');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load QR library'));
    document.head.appendChild(script);
  });

  await qrLibLoadPromise;

  if (!globalThis.qrcode) {
    throw new Error('QR library is not available');
  }

  return globalThis.qrcode;
}

/**
 * Draw QR matrix to canvas and return PNG data URL.
 */
function renderQRToDataURL(qr, options) {
  const {
    size = 300,
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    margin = 4
  } = options;

  const moduleCount = qr.getModuleCount();
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0;
  const canvasSize = Number.isFinite(size) ? Math.max(100, size) : 300;
  const pixelSize = canvasSize / (moduleCount + safeMargin * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = foregroundColor;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) {
        continue;
      }

      const x = Math.round((col + safeMargin) * pixelSize);
      const y = Math.round((row + safeMargin) * pixelSize);
      const w = Math.ceil(pixelSize);
      const h = Math.ceil(pixelSize);
      ctx.fillRect(x, y, w, h);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generate QR code as data URL.
 */
export async function generateQRCode(text, options = {}) {
  const {
    size = 300,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    margin = 4,
    displayLogo = false
  } = options;

  try {
    const qrcode = await ensureQRCodeLib();
    const qr = qrcode(0, String(errorCorrectionLevel || 'M').toUpperCase());
    qr.addData(text);
    qr.make();

    let dataUrl = renderQRToDataURL(qr, {
      size,
      foregroundColor,
      backgroundColor,
      margin
    });

    if (displayLogo) {
      dataUrl = await addLogoToQR(dataUrl, size);
    }

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Add logo to QR code center.
 */
async function addLogoToQR(qrDataUrl, size) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 0, 0, size, size);

      const logoSize = size * 0.2;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

      const logoImage = new Image();
      logoImage.onload = () => {
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        resolve(canvas.toDataURL('image/png'));
      };
      logoImage.onerror = reject;
      logoImage.src = chrome.runtime.getURL('public/icons/ic_TapToQR_64.png');
    };
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });
}

/**
 * Generate QR code as SVG.
 */
export async function generateQRCodeSVG(text, options = {}) {
  const {
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    margin = 4
  } = options;

  try {
    const qrcode = await ensureQRCodeLib();
    const qr = qrcode(0, String(errorCorrectionLevel || 'M').toUpperCase());
    qr.addData(text);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0;
    const viewBoxSize = moduleCount + safeMargin * 2;
    const modules = [];

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          modules.push(`<rect x="${col + safeMargin}" y="${row + safeMargin}" width="1" height="1" />`);
        }
      }
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges">`,
      `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${backgroundColor}" />`,
      `<g fill="${foregroundColor}">`,
      modules.join(''),
      '</g>',
      '</svg>'
    ].join('');
  } catch (error) {
    console.error('Error generating SVG QR code:', error);
    throw error;
  }
}

/**
 * Download QR code as PNG.
 */
export async function downloadQRCode(dataUrl, filename = 'qrcode.png') {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
}

/**
 * Copy QR code to clipboard.
 */
export async function copyQRToClipboard(dataUrl) {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);

    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw error;
  }
}

/**
 * Get current tab URL.
 */
export async function getCurrentTabUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab?.url || '';
  } catch (error) {
    console.error('Error getting current tab URL:', error);
    return '';
  }
}

/**
 * Get current tab info.
 */
export async function getCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return {
      url: tab?.url || '',
      title: tab?.title || 'Untitled'
    };
  } catch (error) {
    console.error('Error getting current tab info:', error);
    return { url: '', title: 'Untitled' };
  }
}
