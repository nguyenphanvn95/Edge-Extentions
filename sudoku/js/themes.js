// Theme Manager - Quản lý themes
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = ['default', 'dark', 'ocean', 'forest', 'sunset', 'purple'];
        this.loadTheme();
    }

    // Tải theme từ storage
    async loadTheme() {
        try {
            const { theme = 'default' } = await chrome.storage.local.get('theme');
            this.setTheme(theme);
        } catch (error) {
            console.error('Error loading theme:', error);
            this.setTheme('default');
        }
    }

    // Set theme
    setTheme(themeName) {
        if (!this.themes.includes(themeName)) {
            themeName = 'default';
        }
        
        this.currentTheme = themeName;
        document.body.setAttribute('data-theme', themeName);
        
        // Cập nhật active state trong theme modal
        document.querySelectorAll('.theme-card').forEach(card => {
            if (card.dataset.theme === themeName) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Lưu vào storage
        this.saveTheme();
    }

    // Lưu theme
    async saveTheme() {
        try {
            await chrome.storage.local.set({ theme: this.currentTheme });
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    // Toggle dark mode (phím tắt D)
    toggleDarkMode() {
        if (this.currentTheme === 'dark') {
            this.setTheme('default');
        } else {
            this.setTheme('dark');
        }
    }

    // Cycle qua các themes
    nextTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Khởi tạo event listeners
    initEventListeners() {
        // Theme cards click
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                this.setTheme(card.dataset.theme);
            });
        });
    }
}
