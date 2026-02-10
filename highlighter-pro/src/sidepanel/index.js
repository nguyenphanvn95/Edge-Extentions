// Sidepanel Manager
let allHighlights = [];
let filteredHighlights = [];
let currentFilter = {
    color: 'all',
    search: '',
    view: 'page'
};
let currentEditingHighlight = null;

// Auto-sync variables
let autoSyncInterval = null;
let lastSyncTime = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHighlights();
    setupEventListeners();
    setupKeyboardShortcuts();
    checkForEditRequest();
    initializeAutoSync();
});

// Check if we need to auto-open edit modal
async function checkForEditRequest() {
    const result = await chrome.storage.local.get({ editHighlightId: null });
    if (result.editHighlightId) {
        // Wait a bit for highlights to load
        setTimeout(() => {
            editHighlightByIndex(result.editHighlightId);
            // Clear the flag
            chrome.storage.local.remove('editHighlightId');
        }, 500);
    }
}

// Edit highlight by index (for auto-open from hover tool)
function editHighlightByIndex(highlightId) {
    // Find highlight by its index/id in the rendered elements
    const highlight = allHighlights.find(h => {
        // The highlightId from hover tool is the array index
        // We need to match it somehow - for now use UUID if available
        return h.uuid === highlightId || h.index === parseInt(highlightId);
    });
    
    if (highlight && highlight.uuid) {
        editHighlight(highlight.uuid);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentFilter.search = e.target.value.toLowerCase();
        filterHighlights();
    });

    // Color filters
    document.querySelectorAll('.color-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter.color = btn.dataset.color;
            filterHighlights();
        });
    });

    // View mode
    document.getElementById('viewMode').addEventListener('change', (e) => {
        currentFilter.view = e.target.value;
        loadHighlights();
    });

    // Export
    document.getElementById('exportBtn').addEventListener('click', () => {
        showModal('exportModal');
    });

    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', () => {
            exportHighlights(btn.dataset.format);
        });
    });

    // Import
    document.getElementById('importBtn').addEventListener('click', () => {
        showModal('importModal');
    });

    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = `Selected: ${file.name}`;
            document.getElementById('fileInfo').style.display = 'block';
        }
    });

    document.getElementById('importFileBtn').addEventListener('click', () => {
        importHighlights();
    });

    // Sync
    document.getElementById('syncBtn').addEventListener('click', () => {
        showModal('syncModal');
        loadSyncSettings();
    });

    document.getElementById('saveSyncSettings').addEventListener('click', saveSyncSettings);
    document.getElementById('pushToGithub').addEventListener('click', pushToGithub);
    document.getElementById('pullFromGithub').addEventListener('click', pullFromGithub);
    
    // Auto-sync toggle
    document.getElementById('autoSyncToggle').addEventListener('change', (e) => {
        const intervalGroup = document.getElementById('autoSyncIntervalGroup');
        if (e.target.checked) {
            intervalGroup.style.display = 'block';
        } else {
            intervalGroup.style.display = 'none';
            stopAutoSync();
        }
    });
    
    // View backups
    document.getElementById('viewBackups').addEventListener('click', () => {
        showBackupsModal();
    });

    // Edit modal
    document.getElementById('saveEdit').addEventListener('click', saveHighlightEdit);
    document.getElementById('cancelEdit').addEventListener('click', () => {
        hideModal('editModal');
    });

    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.closest('.modal').id);
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Setup Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Escape: Clear search or close modal
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not([style*="display: none"])');
            if (openModal) {
                hideModal(openModal.id);
            } else {
                document.getElementById('searchInput').value = '';
                currentFilter.search = '';
                filterHighlights();
            }
        }
    });
}

// Load Highlights
async function loadHighlights() {
    const result = await chrome.storage.local.get({ highlights: {} });
    const highlights = result.highlights;
    
    allHighlights = [];
    
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = new URL(tab.url);
    const currentDomain = currentUrl.hostname;
    
    // Process highlights based on view mode
    for (const [url, items] of Object.entries(highlights)) {
        const urlObj = new URL(url);
        
        // Filter based on view mode
        if (currentFilter.view === 'page' && url !== tab.url) continue;
        if (currentFilter.view === 'domain' && urlObj.hostname !== currentDomain) continue;
        
        items.forEach((item, index) => {
            allHighlights.push({
                ...item,
                url: url,
                index: index,
                domain: urlObj.hostname
            });
        });
    }
    
    // Sort by date (newest first)
    allHighlights.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    filterHighlights();
}

// Filter Highlights
function filterHighlights() {
    filteredHighlights = allHighlights.filter(highlight => {
        // Color filter
        if (currentFilter.color !== 'all' && highlight.color !== currentFilter.color) {
            return false;
        }
        
        // Search filter
        if (currentFilter.search) {
            const searchText = currentFilter.search;
            const inText = highlight.string?.toLowerCase().includes(searchText);
            const inNote = highlight.note?.toLowerCase().includes(searchText);
            const inTags = highlight.tags?.some(tag => tag.toLowerCase().includes(searchText));
            
            if (!inText && !inNote && !inTags) {
                return false;
            }
        }
        
        return true;
    });
    
    renderHighlights();
    updateStats();
}

// Render Highlights
function renderHighlights() {
    const container = document.getElementById('highlightsList');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredHighlights.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredHighlights.map(highlight => {
        const date = new Date(highlight.createdAt || 0);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="highlight-item ${highlight.color || 'yellow'}" data-uuid="${highlight.uuid}">
                <div class="highlight-header">
                    <div class="highlight-url">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        ${highlight.domain}
                    </div>
                    <div class="highlight-actions">
                        <button onclick="editHighlight('${highlight.uuid}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button onclick="jumpToHighlight('${highlight.uuid}')" title="Go to highlight">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                        <button onclick="deleteHighlight('${highlight.uuid}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="highlight-text">${escapeHtml(highlight.string || '')}</div>
                ${highlight.note ? `<div class="highlight-note">📝 ${escapeHtml(highlight.note)}</div>` : ''}
                ${highlight.tags && highlight.tags.length > 0 ? `
                    <div class="highlight-tags">
                        ${highlight.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="highlight-meta">
                    <span>${dateStr}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update Stats
function updateStats() {
    document.getElementById('totalCount').textContent = allHighlights.length;
    document.getElementById('filteredCount').textContent = filteredHighlights.length;
}

// Edit Highlight
window.editHighlight = function(uuid) {
    const highlight = allHighlights.find(h => h.uuid === uuid);
    if (!highlight) return;
    
    currentEditingHighlight = highlight;
    
    document.getElementById('editNote').value = highlight.note || '';
    document.getElementById('editTags').value = (highlight.tags || []).join(', ');
    
    showModal('editModal');
};

// Save Highlight Edit
async function saveHighlightEdit() {
    if (!currentEditingHighlight) return;
    
    const note = document.getElementById('editNote').value.trim();
    const tagsStr = document.getElementById('editTags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Update in storage
    const result = await chrome.storage.local.get({ highlights: {} });
    const highlights = result.highlights;
    
    if (highlights[currentEditingHighlight.url]) {
        const item = highlights[currentEditingHighlight.url][currentEditingHighlight.index];
        if (item) {
            item.note = note;
            item.tags = tags;
            item.updatedAt = Date.now();
        }
    }
    
    await chrome.storage.local.set({ highlights });
    
    hideModal('editModal');
    loadHighlights();
}

// Jump to Highlight
window.jumpToHighlight = async function(uuid) {
    const highlight = allHighlights.find(h => h.uuid === uuid);
    if (!highlight) return;
    
    // Get the tab with the highlight URL
    const tabs = await chrome.tabs.query({ url: highlight.url });
    
    if (tabs.length > 0) {
        // Switch to existing tab
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
        // Open new tab
        await chrome.tabs.create({ url: highlight.url });
    }
    
    // Send message to scroll to highlight
    setTimeout(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'scrollToHighlight',
                uuid: uuid
            });
        });
    }, 500);
};

// Delete Highlight
window.deleteHighlight = async function(uuid) {
    if (!confirm('Delete this highlight?')) return;
    
    const highlight = allHighlights.find(h => h.uuid === uuid);
    if (!highlight) return;
    
    const result = await chrome.storage.local.get({ highlights: {} });
    const highlights = result.highlights;
    
    if (highlights[highlight.url]) {
        highlights[highlight.url].splice(highlight.index, 1);
        
        // Remove URL key if empty
        if (highlights[highlight.url].length === 0) {
            delete highlights[highlight.url];
        }
    }
    
    await chrome.storage.local.set({ highlights });
    loadHighlights();
};

// Export Highlights
function exportHighlights(format) {
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(allHighlights, null, 2);
            filename = `highlights-${Date.now()}.json`;
            mimeType = 'application/json';
            break;
            
        case 'csv':
            const headers = ['Date', 'URL', 'Domain', 'Text', 'Color', 'Note', 'Tags'];
            const rows = allHighlights.map(h => [
                new Date(h.createdAt || 0).toISOString(),
                h.url,
                h.domain,
                `"${(h.string || '').replace(/"/g, '""')}"`,
                h.color || '',
                `"${(h.note || '').replace(/"/g, '""')}"`,
                (h.tags || []).join(';')
            ]);
            content = [headers, ...rows].map(row => row.join(',')).join('\n');
            filename = `highlights-${Date.now()}.csv`;
            mimeType = 'text/csv';
            break;
            
        case 'markdown':
            content = '# My Highlights\n\n';
            const byDomain = {};
            
            allHighlights.forEach(h => {
                if (!byDomain[h.domain]) byDomain[h.domain] = [];
                byDomain[h.domain].push(h);
            });
            
            for (const [domain, highlights] of Object.entries(byDomain)) {
                content += `## ${domain}\n\n`;
                highlights.forEach(h => {
                    content += `### ${new Date(h.createdAt || 0).toLocaleDateString()}\n\n`;
                    content += `> ${h.string}\n\n`;
                    if (h.note) content += `**Note:** ${h.note}\n\n`;
                    if (h.tags && h.tags.length > 0) {
                        content += `**Tags:** ${h.tags.map(t => `#${t}`).join(' ')}\n\n`;
                    }
                    content += `[Source](${h.url})\n\n---\n\n`;
                });
            }
            filename = `highlights-${Date.now()}.md`;
            mimeType = 'text/markdown';
            break;
    }
    
    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    hideModal('exportModal');
}

// Import Highlights
async function importHighlights() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Get current highlights
            const result = await chrome.storage.local.get({ highlights: {} });
            const highlights = result.highlights;
            
            // Merge highlights (avoid duplicates by UUID)
            const existingUUIDs = new Set();
            for (const items of Object.values(highlights)) {
                items.forEach(item => {
                    if (item.uuid) existingUUIDs.add(item.uuid);
                });
            }
            
            let addedCount = 0;
            imported.forEach(item => {
                if (!item.uuid || !existingUUIDs.has(item.uuid)) {
                    const url = item.url;
                    if (!highlights[url]) highlights[url] = [];
                    
                    // Ensure UUID
                    if (!item.uuid) item.uuid = crypto.randomUUID();
                    
                    highlights[url].push(item);
                    addedCount++;
                }
            });
            
            await chrome.storage.local.set({ highlights });
            
            alert(`Imported ${addedCount} new highlights!`);
            hideModal('importModal');
            loadHighlights();
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Load Sync Settings
async function loadSyncSettings() {
    const result = await chrome.storage.local.get({ 
        syncSettings: {},
        autoSyncEnabled: true,
        autoSyncInterval: 5
    });
    const settings = result.syncSettings;
    
    if (settings.githubToken) {
        document.getElementById('githubToken').value = settings.githubToken;
    }
    if (settings.githubRepo) {
        document.getElementById('githubRepo').value = settings.githubRepo;
    }
    if (settings.githubFile) {
        document.getElementById('githubFile').value = settings.githubFile;
    }
    
    // Load auto-sync settings
    document.getElementById('autoSyncToggle').checked = result.autoSyncEnabled;
    document.getElementById('autoSyncInterval').value = result.autoSyncInterval;
    
    const intervalGroup = document.getElementById('autoSyncIntervalGroup');
    intervalGroup.style.display = result.autoSyncEnabled ? 'block' : 'none';
    
    // Enable push/pull buttons if settings exist
    if (settings.githubToken && settings.githubRepo) {
        document.getElementById('pushToGithub').disabled = false;
        document.getElementById('pullFromGithub').disabled = false;
    }
}

// Save Sync Settings
async function saveSyncSettings() {
    const settings = {
        githubToken: document.getElementById('githubToken').value.trim(),
        githubRepo: document.getElementById('githubRepo').value.trim(),
        githubFile: document.getElementById('githubFile').value.trim() || 'highlights.json'
    };
    
    if (!settings.githubToken || !settings.githubRepo) {
        showSyncStatus('Please fill in all required fields', 'error');
        return;
    }
    
    // Get auto-sync settings
    const autoSyncEnabled = document.getElementById('autoSyncToggle').checked;
    const autoSyncInterval = parseInt(document.getElementById('autoSyncInterval').value);
    
    await chrome.storage.local.set({ 
        syncSettings: settings,
        autoSyncEnabled: autoSyncEnabled,
        autoSyncInterval: autoSyncInterval
    });
    
    document.getElementById('pushToGithub').disabled = false;
    document.getElementById('pullFromGithub').disabled = false;
    
    // Restart auto-sync with new settings
    if (autoSyncEnabled) {
        startAutoSync(autoSyncInterval);
        showSyncStatus(`Settings saved! Auto-sync enabled (every ${autoSyncInterval} min)`, 'success');
    } else {
        stopAutoSync();
        showSyncStatus('Settings saved! Auto-sync disabled', 'success');
    }
}

// Push to GitHub
async function pushToGithub() {
    showSyncStatus('Pushing to GitHub...', '');
    
    const result = await chrome.storage.local.get({ highlights: {}, syncSettings: {} });
    const highlights = result.highlights;
    const settings = result.syncSettings;
    
    // Convert to export format
    const exportData = [];
    for (const [url, items] of Object.entries(highlights)) {
        items.forEach(item => {
            exportData.push({
                ...item,
                url: url
            });
        });
    }
    
    try {
        // Get current file SHA if exists
        let sha = null;
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
                {
                    headers: {
                        'Authorization': `token ${settings.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
        } catch (e) {
            // File doesn't exist yet, that's okay
        }
        
        // Create or update file
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(exportData, null, 2))));
        
        const response = await fetch(
            `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${settings.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update highlights - ${new Date().toISOString()}`,
                    content: content,
                    sha: sha
                })
            }
        );
        
        if (response.ok) {
            showSyncStatus(`✅ Successfully pushed ${exportData.length} highlights to GitHub!`, 'success');
        } else {
            const error = await response.json();
            showSyncStatus(`❌ Error: ${error.message}`, 'error');
        }
    } catch (error) {
        showSyncStatus(`❌ Error: ${error.message}`, 'error');
    }
}

// Pull from GitHub
async function pullFromGithub() {
    showSyncStatus('Pulling from GitHub...', '');
    
    const result = await chrome.storage.local.get({ syncSettings: {} });
    const settings = result.syncSettings;
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
            {
                headers: {
                    'Authorization': `token ${settings.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('File not found on GitHub');
        }
        
        const data = await response.json();
        const content = decodeURIComponent(escape(atob(data.content)));
        const imported = JSON.parse(content);
        
        // Get current highlights
        const currentResult = await chrome.storage.local.get({ highlights: {} });
        const highlights = currentResult.highlights;
        
        // Merge highlights (avoid duplicates by UUID)
        const existingUUIDs = new Set();
        for (const items of Object.values(highlights)) {
            items.forEach(item => {
                if (item.uuid) existingUUIDs.add(item.uuid);
            });
        }
        
        let addedCount = 0;
        imported.forEach(item => {
            if (!item.uuid || !existingUUIDs.has(item.uuid)) {
                const url = item.url;
                if (!highlights[url]) highlights[url] = [];
                
                // Ensure UUID
                if (!item.uuid) item.uuid = crypto.randomUUID();
                
                highlights[url].push(item);
                addedCount++;
            }
        });
        
        await chrome.storage.local.set({ highlights });
        
        showSyncStatus(`✅ Successfully pulled and merged ${addedCount} new highlights from GitHub!`, 'success');
        loadHighlights();
    } catch (error) {
        showSyncStatus(`❌ Error: ${error.message}`, 'error');
    }
}

// Show Sync Status
function showSyncStatus(message, type) {
    const statusDiv = document.getElementById('syncStatus');
    statusDiv.textContent = message;
    statusDiv.className = `sync-status ${type}`;
}

// Modal Helpers
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.highlights) {
        loadHighlights();
    }
});

// ==================== AUTO SYNC ====================

// Initialize Auto Sync
async function initializeAutoSync() {
    const result = await chrome.storage.local.get({ 
        syncSettings: {},
        autoSyncEnabled: true,
        autoSyncInterval: 5 // minutes
    });
    
    const settings = result.syncSettings;
    
    // Only enable auto-sync if GitHub is configured
    if (settings.githubToken && settings.githubRepo && result.autoSyncEnabled) {
        startAutoSync(result.autoSyncInterval);
    }
}

// Start Auto Sync
function startAutoSync(intervalMinutes = 5) {
    // Clear existing interval
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    console.log(`🔄 Auto-sync started: every ${intervalMinutes} minutes`);
    
    // Run immediately on start
    performAutoSync();
    
    // Then run every N minutes
    autoSyncInterval = setInterval(() => {
        performAutoSync();
    }, intervalMinutes * 60 * 1000);
}

// Stop Auto Sync
function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
        console.log('⏸️ Auto-sync stopped');
    }
}

// Perform Auto Sync
async function performAutoSync() {
    try {
        const result = await chrome.storage.local.get({ 
            syncSettings: {},
            highlights: {},
            lastSyncMetadata: null
        });
        
        const settings = result.syncSettings;
        
        if (!settings.githubToken || !settings.githubRepo) {
            console.log('⚠️ Auto-sync: GitHub not configured');
            return;
        }
        
        console.log('🔄 Auto-sync: Checking for updates...');
        
        // Get local highlights metadata
        const localHighlights = result.highlights;
        const localData = convertHighlightsToArray(localHighlights);
        const localTimestamp = getLatestTimestamp(localData);
        
        // Get GitHub file metadata (without downloading content)
        const githubMetadata = await getGitHubFileMetadata(settings);
        
        if (!githubMetadata) {
            // File doesn't exist on GitHub, push local data
            console.log('📤 Auto-sync: No remote file, pushing local data');
            await pushToGithubSilent(settings, localData);
            await saveLastSyncMetadata(localTimestamp, 'push');
            return;
        }
        
        // Compare timestamps
        const lastSync = result.lastSyncMetadata;
        
        if (!lastSync) {
            // First time sync - need to pull and compare
            console.log('🔄 Auto-sync: First time, performing smart merge');
            await performSmartSync(settings, localData, localTimestamp);
        } else {
            // Check if local is newer
            if (localTimestamp > lastSync.timestamp) {
                // Local has new data, push to GitHub
                console.log('📤 Auto-sync: Local is newer, pushing to GitHub');
                await pushToGithubSilent(settings, localData);
                await saveLastSyncMetadata(localTimestamp, 'push');
            } else {
                // Check if GitHub has new data
                const githubData = await getGitHubFileContent(settings);
                const githubTimestamp = getLatestTimestamp(githubData);
                
                if (githubTimestamp > lastSync.timestamp) {
                    // GitHub has new data, backup local and pull
                    console.log('📥 Auto-sync: Remote is newer, backing up local and pulling');
                    await backupLocalHighlights(localData);
                    await pullFromGithubSilent(settings);
                    await saveLastSyncMetadata(githubTimestamp, 'pull');
                } else {
                    console.log('✅ Auto-sync: Already in sync');
                }
            }
        }
        
        lastSyncTime = Date.now();
        updateSyncStatusIndicator('success', new Date().toLocaleTimeString());
        
    } catch (error) {
        console.error('❌ Auto-sync error:', error);
        updateSyncStatusIndicator('error', error.message);
    }
}

// Perform Smart Sync (first time)
async function performSmartSync(settings, localData, localTimestamp) {
    try {
        const githubData = await getGitHubFileContent(settings);
        const githubTimestamp = getLatestTimestamp(githubData);
        
        if (githubTimestamp > localTimestamp) {
            // GitHub is newer, backup local and pull
            await backupLocalHighlights(localData);
            await pullFromGithubSilent(settings);
            await saveLastSyncMetadata(githubTimestamp, 'pull');
        } else {
            // Local is newer or same, push
            await pushToGithubSilent(settings, localData);
            await saveLastSyncMetadata(localTimestamp, 'push');
        }
    } catch (error) {
        throw error;
    }
}

// Get GitHub File Metadata (without content)
async function getGitHubFileMetadata(settings) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
            {
                method: 'HEAD',
                headers: {
                    'Authorization': `token ${settings.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.ok) {
            return { exists: true };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Get GitHub File Content
async function getGitHubFileContent(settings) {
    const response = await fetch(
        `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
        {
            headers: {
                'Authorization': `token ${settings.githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch from GitHub');
    }
    
    const data = await response.json();
    const content = decodeURIComponent(escape(atob(data.content)));
    return JSON.parse(content);
}

// Push to GitHub (Silent)
async function pushToGithubSilent(settings, data) {
    // Get current SHA if file exists
    let sha = null;
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
            {
                headers: {
                    'Authorization': `token ${settings.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
    } catch (e) {
        // File doesn't exist yet
    }
    
    // Create or update file
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    const response = await fetch(
        `https://api.github.com/repos/${settings.githubRepo}/contents/${settings.githubFile}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${settings.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `[Auto-sync] Update highlights - ${new Date().toISOString()}`,
                content: content,
                sha: sha
            })
        }
    );
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }
}

// Pull from GitHub (Silent)
async function pullFromGithubSilent(settings) {
    const githubData = await getGitHubFileContent(settings);
    
    // Get current highlights
    const result = await chrome.storage.local.get({ highlights: {} });
    const highlights = result.highlights;
    
    // Merge highlights (avoid duplicates by UUID)
    const existingUUIDs = new Set();
    for (const items of Object.values(highlights)) {
        items.forEach(item => {
            if (item.uuid) existingUUIDs.add(item.uuid);
        });
    }
    
    let addedCount = 0;
    githubData.forEach(item => {
        if (!item.uuid || !existingUUIDs.has(item.uuid)) {
            const url = item.url;
            if (!highlights[url]) highlights[url] = [];
            
            // Ensure UUID
            if (!item.uuid) item.uuid = crypto.randomUUID();
            
            highlights[url].push(item);
            addedCount++;
        }
    });
    
    await chrome.storage.local.set({ highlights });
    
    if (addedCount > 0) {
        console.log(`✅ Auto-sync: Merged ${addedCount} new highlights from GitHub`);
    }
}

// Backup Local Highlights
async function backupLocalHighlights(localData) {
    const timestamp = Date.now();
    const backupKey = `backup_${timestamp}`;
    
    // Store backup
    await chrome.storage.local.set({
        [backupKey]: {
            timestamp: timestamp,
            data: localData,
            count: localData.length
        }
    });
    
    // Keep only last 5 backups
    const allKeys = await chrome.storage.local.get(null);
    const backupKeys = Object.keys(allKeys)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();
    
    if (backupKeys.length > 5) {
        const keysToRemove = backupKeys.slice(5);
        await chrome.storage.local.remove(keysToRemove);
    }
    
    console.log(`💾 Backup created: ${new Date(timestamp).toLocaleString()}`);
}

// Convert Highlights to Array
function convertHighlightsToArray(highlights) {
    const result = [];
    for (const [url, items] of Object.entries(highlights)) {
        items.forEach(item => {
            result.push({
                ...item,
                url: url
            });
        });
    }
    return result;
}

// Get Latest Timestamp from highlights
function getLatestTimestamp(highlights) {
    if (!highlights || highlights.length === 0) return 0;
    
    let latest = 0;
    highlights.forEach(h => {
        const timestamp = h.updatedAt || h.createdAt || 0;
        if (timestamp > latest) latest = timestamp;
    });
    
    return latest;
}

// Save Last Sync Metadata
async function saveLastSyncMetadata(timestamp, action) {
    await chrome.storage.local.set({
        lastSyncMetadata: {
            timestamp: timestamp,
            action: action,
            date: new Date().toISOString()
        }
    });
}

// Update Sync Status Indicator
function updateSyncStatusIndicator(status, message) {
    // Add a small indicator in the header
    const syncIndicator = document.getElementById('syncIndicator');
    if (syncIndicator) {
        const icon = status === 'success' ? '✅' : '⚠️';
        syncIndicator.textContent = `${icon} Last sync: ${message}`;
        syncIndicator.className = `sync-indicator ${status}`;
    }
}

// Show Backups Modal
async function showBackupsModal() {
    const allKeys = await chrome.storage.local.get(null);
    const backups = Object.keys(allKeys)
        .filter(key => key.startsWith('backup_'))
        .map(key => ({
            key: key,
            ...allKeys[key]
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    
    const backupsList = document.getElementById('backupsList');
    const noBackups = document.getElementById('noBackups');
    
    if (backups.length === 0) {
        backupsList.innerHTML = '';
        noBackups.style.display = 'block';
    } else {
        noBackups.style.display = 'none';
        backupsList.innerHTML = backups.map(backup => {
            const date = new Date(backup.timestamp);
            return `
                <div class="backup-item">
                    <div class="backup-info-section">
                        <div class="backup-date">${date.toLocaleString()}</div>
                        <div class="backup-stats">${backup.count} highlights</div>
                    </div>
                    <div class="backup-actions">
                        <button class="restore-backup" onclick="restoreBackup('${backup.key}')">
                            Restore
                        </button>
                        <button class="delete-backup" onclick="deleteBackup('${backup.key}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    showModal('backupsModal');
}

// Restore Backup
window.restoreBackup = async function(backupKey) {
    if (!confirm('Restore this backup? Current highlights will be backed up first.')) {
        return;
    }
    
    try {
        // Get the backup data
        const result = await chrome.storage.local.get([backupKey, 'highlights']);
        const backup = result[backupKey];
        
        if (!backup) {
            alert('Backup not found!');
            return;
        }
        
        // Backup current highlights first
        const currentHighlights = convertHighlightsToArray(result.highlights || {});
        await backupLocalHighlights(currentHighlights);
        
        // Restore backup
        const highlights = {};
        backup.data.forEach(item => {
            const url = item.url;
            if (!highlights[url]) highlights[url] = [];
            highlights[url].push(item);
        });
        
        await chrome.storage.local.set({ highlights });
        
        alert(`✅ Restored ${backup.count} highlights from backup!`);
        hideModal('backupsModal');
        loadHighlights();
    } catch (error) {
        alert('Error restoring backup: ' + error.message);
    }
};

// Delete Backup
window.deleteBackup = async function(backupKey) {
    if (!confirm('Delete this backup?')) {
        return;
    }
    
    await chrome.storage.local.remove(backupKey);
    showBackupsModal(); // Refresh the list
};


