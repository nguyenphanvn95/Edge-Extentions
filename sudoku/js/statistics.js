// Statistics Manager - Quản lý thống kê
class StatisticsManager {
    constructor() {
        this.stats = {
            totalGames: 0,
            gamesWon: 0,
            totalTime: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null,
                expert: null
            },
            dailyChallengesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0
        };
        this.loadStats();
    }

    // Tải thống kê từ storage
    async loadStats() {
        try {
            const { statistics } = await chrome.storage.local.get('statistics');
            if (statistics) {
                this.stats = { ...this.stats, ...statistics };
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Lưu thống kê
    async saveStats() {
        try {
            await chrome.storage.local.set({ statistics: this.stats });
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    // Ghi nhận game mới
    recordGameStart() {
        this.stats.totalGames++;
        this.saveStats();
    }

    // Ghi nhận game thắng
    recordGameWin(difficulty, time) {
        this.stats.gamesWon++;
        this.stats.totalTime += time;

        // Cập nhật best time
        if (!this.stats.bestTimes[difficulty] || time < this.stats.bestTimes[difficulty]) {
            this.stats.bestTimes[difficulty] = time;
        }

        this.saveStats();
        
        // Kiểm tra có phá kỷ lục không
        return !this.stats.bestTimes[difficulty] || time === this.stats.bestTimes[difficulty];
    }

    // Ghi nhận daily challenge hoàn thành
    async recordDailyComplete() {
        this.stats.dailyChallengesCompleted++;
        
        // Cập nhật streak
        const today = new Date().toDateString();
        const { lastDailyDate } = await chrome.storage.local.get('lastDailyDate');
        
        if (lastDailyDate) {
            const lastDate = new Date(lastDailyDate);
            const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                this.stats.currentStreak++;
            } else if (diffDays > 1) {
                this.stats.currentStreak = 1;
            }
        } else {
            this.stats.currentStreak = 1;
        }
        
        if (this.stats.currentStreak > this.stats.longestStreak) {
            this.stats.longestStreak = this.stats.currentStreak;
        }
        
        await chrome.storage.local.set({ lastDailyDate: today });
        await this.saveStats();
    }

    // Lấy thống kê
    getStats() {
        return {
            ...this.stats,
            winRate: this.stats.totalGames > 0 
                ? Math.round((this.stats.gamesWon / this.stats.totalGames) * 100)
                : 0
        };
    }

    // Format thời gian
    formatTime(seconds) {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Format tổng thời gian (có thể > 60 phút)
    formatTotalTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    // Reset thống kê
    async resetStats() {
        this.stats = {
            totalGames: 0,
            gamesWon: 0,
            totalTime: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null,
                expert: null
            },
            dailyChallengesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0
        };
        await this.saveStats();
    }

    // Cập nhật UI thống kê
    updateStatsDisplay() {
        const stats = this.getStats();
        
        document.getElementById('total-games').textContent = stats.totalGames;
        document.getElementById('games-won').textContent = stats.gamesWon;
        document.getElementById('win-rate').textContent = stats.winRate + '%';
        document.getElementById('total-time').textContent = this.formatTotalTime(stats.totalTime);
        
        document.getElementById('best-easy').textContent = this.formatTime(stats.bestTimes.easy);
        document.getElementById('best-medium').textContent = this.formatTime(stats.bestTimes.medium);
        document.getElementById('best-hard').textContent = this.formatTime(stats.bestTimes.hard);
        document.getElementById('best-expert').textContent = this.formatTime(stats.bestTimes.expert);
    }
}
