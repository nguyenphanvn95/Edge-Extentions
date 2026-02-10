// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Sudoku Master Pro installed!');
    
    // Set up daily challenge alarm
    chrome.alarms.create('dailyReset', {
        when: getNextMidnight(),
        periodInMinutes: 24 * 60
    });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        // Reset daily challenge
        chrome.storage.local.set({
            dailyCompleted: false
        });
    }
});

// Helper to get next midnight
function getNextMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

// Auto-save interval (every 30 seconds)
setInterval(async () => {
    // Notify content script to auto-save if needed
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'autoSave' }).catch(() => {
            // Ignore errors for tabs that don't have the extension
        });
    });
}, 30000);
