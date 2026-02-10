// Storage Manager - Quản lý lưu trữ game
class StorageManager {
    constructor() {
        this.autoSave = true;
    }

    // Lưu game hiện tại
    async saveGame(gameState, slotName = null) {
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString(),
            slotName: slotName || `Game ${new Date().toLocaleString('vi-VN')}`
        };

        try {
            if (!slotName) {
                // Auto-save vào slot mặc định
                await chrome.storage.local.set({ currentGame: saveData });
            } else {
                // Lưu vào slot có tên
                const { savedGames = {} } = await chrome.storage.local.get('savedGames');
                savedGames[slotName] = saveData;
                await chrome.storage.local.set({ savedGames });
            }
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    // Tải game đã lưu
    async loadGame(slotName = null) {
        try {
            if (!slotName) {
                const { currentGame } = await chrome.storage.local.get('currentGame');
                return currentGame || null;
            } else {
                const { savedGames = {} } = await chrome.storage.local.get('savedGames');
                return savedGames[slotName] || null;
            }
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    // Lấy danh sách game đã lưu
    async getSavedGames() {
        try {
            const { savedGames = {} } = await chrome.storage.local.get('savedGames');
            return Object.entries(savedGames).map(([name, data]) => ({
                name,
                ...data
            }));
        } catch (error) {
            console.error('Error getting saved games:', error);
            return [];
        }
    }

    // Xóa game đã lưu
    async deleteSavedGame(slotName) {
        try {
            const { savedGames = {} } = await chrome.storage.local.get('savedGames');
            delete savedGames[slotName];
            await chrome.storage.local.set({ savedGames });
            return true;
        } catch (error) {
            console.error('Error deleting saved game:', error);
            return false;
        }
    }

    // Export game thành string
    exportGame(gameState) {
        const exportData = {
            puzzle: gameState.puzzle,
            solution: gameState.solution,
            currentGrid: gameState.currentGrid,
            difficulty: gameState.difficulty,
            notes: gameState.notes.map(row => 
                row.map(cell => Array.from(cell))
            ),
            timer: gameState.timer,
            mistakes: gameState.mistakes,
            hintsLeft: gameState.hintsLeft,
            exportedAt: new Date().toISOString()
        };
        return btoa(JSON.stringify(exportData));
    }

    // Import game từ string
    importGame(dataString) {
        try {
            const data = JSON.parse(atob(dataString));
            
            // Convert notes arrays back to Sets
            if (data.notes) {
                data.notes = data.notes.map(row => 
                    row.map(cell => new Set(cell))
                );
            }
            
            return data;
        } catch (error) {
            console.error('Error importing game:', error);
            return null;
        }
    }

    // Lấy/set auto-save setting
    async getAutoSave() {
        try {
            const { autoSave = true } = await chrome.storage.local.get('autoSave');
            this.autoSave = autoSave;
            return autoSave;
        } catch (error) {
            return true;
        }
    }

    async setAutoSave(enabled) {
        this.autoSave = enabled;
        try {
            await chrome.storage.local.set({ autoSave: enabled });
        } catch (error) {
            console.error('Error setting auto-save:', error);
        }
    }

    // Lưu settings
    async saveSettings(settings) {
        try {
            await chrome.storage.local.set({ settings });
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Tải settings
    async loadSettings() {
        try {
            const { settings = {} } = await chrome.storage.local.get('settings');
            return {
                autoSave: settings.autoSave !== false,
                sound: settings.sound || false,
                highlight: settings.highlight !== false,
                errorCheck: settings.errorCheck !== false,
                ...settings
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                autoSave: true,
                sound: false,
                highlight: true,
                errorCheck: true
            };
        }
    }
}
