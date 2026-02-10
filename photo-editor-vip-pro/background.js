chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: "editPhotoOfflineWeb",
      title: "Edit Photo (Offline Web Editor)",
      contexts: ["image"]
    });
  } catch (e) {}
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "editPhotoOfflineWeb") return;
  const srcUrl = info.srcUrl;

  let blob = null;
  try {
    const res = await fetch(srcUrl, { credentials: "include" });
    blob = await res.blob();
  } catch (e) {
    chrome.tabs.create({ url: chrome.runtime.getURL("editor/editor.html") });
    return;
  }

  try {
    const ab = await blob.arrayBuffer();
    const bytes = Array.from(new Uint8Array(ab));
    const key = `img_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
    await chrome.storage.session.set({
      [key]: { bytes, type: blob.type || "image/png", nameHint: guessName(srcUrl) }
    });
    chrome.tabs.create({ url: chrome.runtime.getURL(`editor/editor.html#k=${encodeURIComponent(key)}`) });
  } catch (e) {
    chrome.tabs.create({ url: chrome.runtime.getURL("editor/editor.html") });
  }
});

function guessName(url) {
  try {
    const u = new URL(url);
    const p = (u.pathname.split("/").pop() || "image").split("?")[0].split("#")[0];
    if (p && p.includes(".")) return p;
    return "image.png";
  } catch {
    return "image.png";
  }
}
