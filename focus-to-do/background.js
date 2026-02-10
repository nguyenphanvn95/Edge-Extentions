'use strict';

// Offline Version - All data stored locally
function createWindow(left, top, width, height) {
	chrome.windows.create(
		{
			url: chrome.runtime.getURL("WebContent/index.html"),
			type: "popup",
			left, top,
			width, height
		}, 
		function(window) {
			// Save window info to local storage only
			chrome.storage.local.set({'wid': window.id});
		}
	);
}

async function getWindow() {
	let result = await chrome.storage.local.get(["wid"]);
	let wid = parseInt(result.wid);
	if (wid) {
		let windows = await chrome.windows.getAll({windowTypes: ['popup']});
		for (let w of windows) {
			if (w.id === wid) {
				return w;
			}
		}
	}
	return null;
}

chrome.windows.onRemoved.addListener(async (wid) => {
	let window = await getWindow();
	if (!window) {
		chrome.storage.local.set({'wid': ""});
		chrome.action.setBadgeText({text: ""});
	}
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
	let window = await getWindow();
	if (window && notificationId.startsWith(`net.focustodo`)) {
		let info = { focused: true };
		chrome.windows.update(window.id, info);
		chrome.notifications.clear(notificationId);
	}
});

chrome.action.onClicked.addListener(async () => {
	let window = await getWindow();
	if (window) {
		let info = { focused: true };
		chrome.windows.update(window.id, info);
	} else {
		// Default window size
		let left = 100;
		let top = 100;
		let width = 1000;
		let height = 598;
		
		// Try to restore saved window size from local storage
		let result = await chrome.storage.local.get(['windowSize']);
		if (result.windowSize) {
			width = parseInt(result.windowSize.width);
			height = parseInt(result.windowSize.height);
		}
		
		width = Math.max(width, 1000);
		height = Math.max(height, 598);
		
		if (chrome.system && chrome.system.display) {
			let displays = await chrome.system.display.getInfo();
			if (displays.length > 0) {
				let display = displays[0];
				let bounds = display.bounds;
				width = Math.min(bounds.width, width);
				height = Math.min(bounds.height, height);
				left = parseInt((bounds.width - width) / 2);
				top = parseInt((bounds.height - height) / 2);
				createWindow(left, top, width, height);
			} else {
				createWindow(left, top, width, height);
			}
		} else {
			createWindow(left, top, width, height);
		}
	}
});

console.log(`background.js loaded - Offline Version`);