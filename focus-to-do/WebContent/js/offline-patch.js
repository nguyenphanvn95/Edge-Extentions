/**
 * Offline Patch for Focus Timer
 * This file overrides all user authentication and sync features
 * All data is stored locally in Chrome storage
 */

(function() {
    'use strict';
    
    console.log('Offline Patch loaded');
    
    // Override localStorage wrapper để đảm bảo tất cả lưu trong local storage
    window.OfflineStorage = {
        // Get data from local storage
        get: function(keys) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(keys, function(result) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
        },
        
        // Set data to local storage
        set: function(data) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(data, function() {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        },
        
        // Remove data from local storage
        remove: function(keys) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.remove(keys, function() {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        },
        
        // Clear all data
        clear: function() {
            return new Promise((resolve, reject) => {
                chrome.storage.local.clear(function() {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }
    };
    
    // Mock user object - always logged in locally
    window.OfflineUser = {
        isLoggedIn: true,
        userId: 'offline-user',
        email: 'offline@local',
        isPremium: true, // Give all premium features
        username: 'Offline User',
        
        // Mock login (always succeeds locally)
        login: function() {
            return Promise.resolve({
                success: true,
                user: this
            });
        },
        
        // Mock logout (just clears some UI state)
        logout: function() {
            return Promise.resolve({
                success: true
            });
        },
        
        // Check login status (always true)
        checkAuth: function() {
            return Promise.resolve(true);
        }
    };
    
    // Mock sync functions (do nothing or save locally)
    window.OfflineSync = {
        // Upload to server (disabled - save locally instead)
        upload: function(data) {
            console.log('Sync disabled - saving locally');
            return window.OfflineStorage.set(data);
        },
        
        // Download from server (disabled - load from local)
        download: function() {
            console.log('Sync disabled - loading locally');
            return window.OfflineStorage.get(null);
        },
        
        // Auto-sync (disabled)
        autoSync: function() {
            console.log('Auto-sync disabled in offline mode');
            return Promise.resolve();
        },
        
        // Check sync status (always up to date)
        checkStatus: function() {
            return Promise.resolve({
                synced: true,
                lastSync: Date.now(),
                pending: 0
            });
        }
    };
    
    // Mock payment/premium functions (all features enabled)
    window.OfflinePremium = {
        isPremium: function() {
            return true;
        },
        
        checkFeature: function(feature) {
            return true; // All features enabled
        },
        
        purchase: function() {
            console.log('Payment disabled in offline mode - all features free');
            return Promise.resolve({
                success: true,
                message: 'All features are free in offline mode'
            });
        }
    };
    
    // Mock group/team features (disabled)
    window.OfflineGroup = {
        create: function() {
            console.log('Group features disabled in offline mode');
            return Promise.reject('Group features not available offline');
        },
        
        join: function() {
            console.log('Group features disabled in offline mode');
            return Promise.reject('Group features not available offline');
        },
        
        leave: function() {
            return Promise.resolve();
        },
        
        list: function() {
            return Promise.resolve([]);
        }
    };
    
    // Helper function to initialize offline mode
    window.initOfflineMode = function() {
        console.log('Initializing offline mode...');
        
        // Hide login/signup UI elements
        const loginElements = document.querySelectorAll(
            '[data-login], [data-signup], [data-sync], [data-premium], [data-group]'
        );
        loginElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Set offline indicator
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.textContent = 'Offline Mode';
        offlineIndicator.style.cssText = `
            position: fixed;
            top: 5px;
            right: 5px;
            background: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 10000;
            opacity: 0.8;
        `;
        document.body.appendChild(offlineIndicator);
        
        // Initialize default data structure if needed
        window.OfflineStorage.get(null).then(data => {
            if (!data || Object.keys(data).length === 0) {
                console.log('Initializing default data structure');
                const defaultData = {
                    tasks: [],
                    projects: [],
                    folders: [],
                    tags: [],
                    pomoHistory: [],
                    settings: {
                        theme: 'light',
                        language: 'vi',
                        sounds: {
                            enabled: true,
                            volume: 50
                        },
                        timer: {
                            focusTime: 25,
                            shortBreak: 5,
                            longBreak: 15,
                            autoStartBreaks: false,
                            autoStartPomodoros: false
                        }
                    },
                    stats: {
                        totalFocusTime: 0,
                        completedTasks: 0,
                        trees: []
                    },
                    initialized: true,
                    version: '7.1.1-offline'
                };
                
                return window.OfflineStorage.set(defaultData);
            }
        }).then(() => {
            console.log('Offline mode initialized successfully');
        }).catch(err => {
            console.error('Error initializing offline mode:', err);
        });
    };
    
    // Export utilities for backup/restore
    window.OfflineBackup = {
        export: function() {
            return window.OfflineStorage.get(null).then(data => {
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focustimer-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                return data;
            });
        },
        
        import: function(jsonData) {
            try {
                const data = typeof jsonData === 'string' 
                    ? JSON.parse(jsonData) 
                    : jsonData;
                return window.OfflineStorage.set(data).then(() => {
                    alert('Data imported successfully! Please reload the page.');
                    return data;
                });
            } catch (e) {
                console.error('Import error:', e);
                alert('Error importing data: ' + e.message);
                return Promise.reject(e);
            }
        },
        
        clear: function() {
            if (confirm('Are you sure you want to delete all data? This cannot be undone!')) {
                return window.OfflineStorage.clear().then(() => {
                    alert('All data cleared! Please reload the page.');
                });
            }
            return Promise.reject('Cancelled');
        }
    };
    
    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initOfflineMode);
    } else {
        window.initOfflineMode();
    }
    
})();

// Console utilities for users
console.log('%c🚀 Focus Timer - Offline Version', 'color: #28a745; font-size: 16px; font-weight: bold;');
console.log('%cUtilities available:', 'color: #007bff; font-weight: bold;');
console.log('  • OfflineBackup.export() - Export all data');
console.log('  • OfflineBackup.import(jsonData) - Import data');
console.log('  • OfflineBackup.clear() - Clear all data');
console.log('  • OfflineStorage.get(null) - View all stored data');
console.log('%cAll features are free in offline mode! 🎉', 'color: #28a745;');
