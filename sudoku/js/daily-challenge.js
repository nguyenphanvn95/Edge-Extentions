// Daily Challenge Manager
class DailyChallengeManager {
    constructor() {
        this.dailySeed = null;
        this.isDailyChallenge = false;
        this.todayDate = new Date().toDateString();
    }

    // Sinh seed từ ngày hiện tại
    getDailySeed() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + 
                     (today.getMonth() + 1) * 100 + 
                     today.getDate();
        return seed;
    }

    // Sinh Sudoku từ seed (deterministic)
    generateFromSeed(seed, difficulty = 'medium') {
        // Sử dụng seed để tạo random nhưng consistent
        const seededRandom = (function(seed) {
            let state = seed;
            return function() {
                state = (state * 1103515245 + 12345) & 0x7fffffff;
                return state / 0x7fffffff;
            };
        })(seed);

        // Override Math.random tạm thời
        const originalRandom = Math.random;
        Math.random = seededRandom;

        const generator = new SudokuGenerator();
        const puzzle = generator.createPuzzleFast(difficulty);

        // Restore Math.random
        Math.random = originalRandom;

        return puzzle;
    }

    // Lấy daily challenge
    async getDailyChallenge() {
        const seed = this.getDailySeed();
        const { dailyCompleted, dailyCompletedDate } = await chrome.storage.local.get([
            'dailyCompleted', 
            'dailyCompletedDate'
        ]);

        // Kiểm tra đã hoàn thành daily hôm nay chưa
        const isCompleted = dailyCompletedDate === this.todayDate && dailyCompleted;

        return {
            seed,
            puzzle: this.generateFromSeed(seed, 'medium'),
            isCompleted,
            date: this.todayDate
        };
    }

    // Đánh dấu daily đã hoàn thành
    async markDailyCompleted() {
        await chrome.storage.local.set({
            dailyCompleted: true,
            dailyCompletedDate: this.todayDate
        });
    }

    // Kiểm tra đã hoàn thành daily hôm nay chưa
    async isDailyCompletedToday() {
        const { dailyCompleted, dailyCompletedDate } = await chrome.storage.local.get([
            'dailyCompleted',
            'dailyCompletedDate'
        ]);
        return dailyCompletedDate === this.todayDate && dailyCompleted;
    }

    // Start daily challenge
    async startDailyChallenge() {
        const daily = await this.getDailyChallenge();
        
        if (daily.isCompleted) {
            alert('Bạn đã hoàn thành Daily Challenge hôm nay! ✓\nQuay lại vào ngày mai nhé!');
            return null;
        }

        this.isDailyChallenge = true;
        return daily.puzzle;
    }

    // Set daily badge
    async updateDailyBadge() {
        const badge = document.getElementById('daily-badge');
        const isCompleted = await this.isDailyCompletedToday();
        
        if (isCompleted) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}
