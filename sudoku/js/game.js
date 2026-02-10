// Game State và Logic - Version 2.0 với tất cả tính năng mới
class SudokuGame {
    constructor() {
        // Game state
        this.puzzle = null;
        this.solution = null;
        this.currentGrid = null;
        this.fixedCells = new Set();
        this.selectedCell = null;
        this.noteMode = false;
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.history = [];
        this.mistakes = 0;
        this.hintsLeft = 3;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'medium';
        this.isPaused = false;
        this.isDailyChallenge = false;
        
        // Managers
        this.generator = new SudokuGenerator();
        this.solver = new SudokuSolver();
        this.storage = new StorageManager();
        this.statistics = new StatisticsManager();
        this.themeManager = new ThemeManager();
        this.dailyChallenge = new DailyChallengeManager();
        
        // Settings
        this.settings = {
            autoSave: true,
            sound: false,
            highlight: true,
            errorCheck: true
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.createBoard();
        this.attachEventListeners();
        this.themeManager.initEventListeners();
        
        // Thử load game đã lưu
        const savedGame = await this.storage.loadGame();
        if (savedGame) {
            const loadSaved = confirm('Bạn có muốn tiếp tục game đã lưu không?');
            if (loadSaved) {
                this.loadGameState(savedGame);
            } else {
                this.newGame();
            }
        } else {
            this.newGame();
        }
        
        // Update daily badge
        await this.dailyChallenge.updateDailyBadge();
        
        // Auto-save interval
        setInterval(() => {
            if (this.settings.autoSave && !this.isPaused) {
                this.autoSave();
            }
        }, 30000); // Every 30 seconds
    }

    // Load settings
    async loadSettings() {
        this.settings = await this.storage.loadSettings();
        this.updateSettingsUI();
    }

    // Update settings UI
    updateSettingsUI() {
        document.getElementById('auto-save-toggle').checked = this.settings.autoSave;
        document.getElementById('sound-toggle').checked = this.settings.sound;
        document.getElementById('highlight-toggle').checked = this.settings.highlight;
        document.getElementById('error-check-toggle').checked = this.settings.errorCheck;
    }

    // Save settings
    async saveSettings() {
        this.settings.autoSave = document.getElementById('auto-save-toggle').checked;
        this.settings.sound = document.getElementById('sound-toggle').checked;
        this.settings.highlight = document.getElementById('highlight-toggle').checked;
        this.settings.errorCheck = document.getElementById('error-check-toggle').checked;
        
        await this.storage.saveSettings(this.settings);
    }

    // Tạo bảng Sudoku
    createBoard() {
        const board = document.getElementById('sudoku-board');
        board.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.dataset.row = Math.floor(i / 9);
            cell.dataset.col = i % 9;
            
            cell.addEventListener('click', () => this.selectCell(i));
            board.appendChild(cell);
        }
    }

    // Game mới
    newGame(isDaily = false) {
        let data;
        
        if (isDaily) {
            // Daily challenge
            this.isDailyChallenge = true;
            const seed = this.dailyChallenge.getDailySeed();
            data = this.dailyChallenge.generateFromSeed(seed, 'medium');
        } else {
            // Normal game
            this.isDailyChallenge = false;
            data = this.generator.createPuzzleFast(this.difficulty);
        }
        
        this.puzzle = data.puzzle;
        this.solution = data.solution;
        this.currentGrid = this.puzzle.map(row => [...row]);
        
        this.fixedCells.clear();
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.history = [];
        this.mistakes = 0;
        this.hintsLeft = 3;
        this.selectedCell = null;
        this.noteMode = false;
        this.isPaused = false;
        
        // Đánh dấu ô cố định
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.puzzle[row][col] !== 0) {
                    this.fixedCells.add(`${row}-${col}`);
                }
            }
        }
        
        // Record game start
        this.statistics.recordGameStart();
        
        this.updateDisplay();
        this.updateGameInfo();
        this.startTimer();
        
        // Ẩn modal
        document.getElementById('win-modal').classList.add('hidden');
        
        // Show daily badge if daily challenge
        if (isDaily) {
            document.getElementById('daily-badge').style.display = 'flex';
        } else {
            document.getElementById('daily-badge').style.display = 'none';
        }
        
        // Auto-save initial state
        if (this.settings.autoSave) {
            setTimeout(() => this.autoSave(), 1000);
        }
    }

    // Chọn ô
    selectCell(index) {
        if (this.isPaused) return;
        
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        if (this.fixedCells.has(`${row}-${col}`)) {
            this.selectedCell = { row, col, index };
            this.updateDisplay();
            return;
        }
        
        this.selectedCell = { row, col, index };
        this.updateDisplay();
    }

    // Nhập số
    inputNumber(num) {
        if (!this.selectedCell || this.isPaused) return;
        
        const { row, col } = this.selectedCell;
        
        if (this.fixedCells.has(`${row}-${col}`)) return;
        
        // Lưu lịch sử
        this.saveHistory();
        
        if (this.noteMode) {
            // Chế độ ghi chú
            if (this.notes[row][col].has(num)) {
                this.notes[row][col].delete(num);
            } else {
                this.notes[row][col].add(num);
            }
        } else {
            // Chế độ điền số
            this.currentGrid[row][col] = num;
            this.notes[row][col].clear();
            
            // Kiểm tra lỗi nếu setting bật
            if (this.settings.errorCheck && this.solution[row][col] !== num) {
                this.mistakes++;
                this.updateGameInfo();
                
                if (this.mistakes >= 3) {
                    this.gameOver();
                    return;
                }
            }
            
            // Kiểm tra thắng
            if (this.checkWin()) {
                this.gameWin();
                return;
            }
        }
        
        this.updateDisplay();
    }

    // Xóa ô
    eraseCell() {
        if (!this.selectedCell || this.isPaused) return;
        
        const { row, col } = this.selectedCell;
        
        if (this.fixedCells.has(`${row}-${col}`)) return;
        
        this.saveHistory();
        this.currentGrid[row][col] = 0;
        this.notes[row][col].clear();
        this.updateDisplay();
    }

    // Undo
    undo() {
        if (this.history.length === 0 || this.isPaused) return;
        
        const state = this.history.pop();
        this.currentGrid = state.grid;
        this.notes = state.notes;
        this.mistakes = state.mistakes;
        
        this.updateDisplay();
        this.updateGameInfo();
    }

    // Lưu lịch sử
    saveHistory() {
        this.history.push({
            grid: this.currentGrid.map(row => [...row]),
            notes: this.notes.map(row => row.map(cell => new Set(cell))),
            mistakes: this.mistakes
        });
        
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    // Gợi ý
    giveHint() {
        if (this.hintsLeft <= 0 || !this.selectedCell || this.isPaused) return;
        
        const { row, col } = this.selectedCell;
        
        if (this.fixedCells.has(`${row}-${col}`)) return;
        
        this.saveHistory();
        this.currentGrid[row][col] = this.solution[row][col];
        this.notes[row][col].clear();
        this.hintsLeft--;
        
        const cells = document.querySelectorAll('.cell');
        cells[this.selectedCell.index].classList.add('correct-hint');
        setTimeout(() => {
            cells[this.selectedCell.index].classList.remove('correct-hint');
        }, 500);
        
        this.updateDisplay();
        this.updateGameInfo();
        
        if (this.checkWin()) {
            this.gameWin();
        }
    }

    // Giải Sudoku
    solvePuzzle() {
        if (!confirm('Bạn có chắc muốn giải Sudoku này?')) return;
        
        this.currentGrid = this.solution.map(row => [...row]);
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.updateDisplay();
        
        setTimeout(() => {
            this.gameWin();
        }, 500);
    }

    // Pause/Resume
    togglePause() {
        this.isPaused = !this.isPaused;
        
        const pauseBtn = document.getElementById('pause-btn');
        if (this.isPaused) {
            this.stopTimer();
            pauseBtn.textContent = '▶️';
            pauseBtn.title = 'Resume';
            document.body.classList.add('paused');
            
            // Blur board
            document.querySelectorAll('.cell').forEach(cell => {
                cell.style.filter = 'blur(8px)';
            });
        } else {
            this.startTimer();
            pauseBtn.textContent = '⏸️';
            pauseBtn.title = 'Pause';
            document.body.classList.remove('paused');
            
            // Unblur board
            document.querySelectorAll('.cell').forEach(cell => {
                cell.style.filter = '';
            });
        }
    }

    // Kiểm tra thắng
    checkWin() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.currentGrid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Game over
    gameOver() {
        this.stopTimer();
        alert(`Game Over! Bạn đã mắc ${this.mistakes} lỗi.`);
        this.newGame();
    }

    // Thắng game
    async gameWin() {
        this.stopTimer();
        
        // Record win
        const isNewRecord = this.statistics.recordGameWin(this.difficulty, this.timer);
        
        // Daily challenge
        if (this.isDailyChallenge) {
            await this.dailyChallenge.markDailyCompleted();
            await this.statistics.recordDailyComplete();
            await this.dailyChallenge.updateDailyBadge();
        }
        
        // Show win modal
        const modal = document.getElementById('win-modal');
        const finalTime = document.getElementById('final-time');
        const newRecordMsg = document.getElementById('new-record');
        
        finalTime.textContent = this.formatTime(this.timer);
        
        if (isNewRecord && !this.isDailyChallenge) {
            newRecordMsg.style.display = 'block';
        } else {
            newRecordMsg.style.display = 'none';
        }
        
        modal.classList.remove('hidden');
        
        // Clear auto-save
        await this.storage.saveGame(null);
        
        // Show saved indicator
        this.showSavedIndicator(false);
    }

    // Cập nhật hiển thị
    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.currentGrid[row][col];
            
            cell.className = 'cell';
            cell.innerHTML = '';
            
            if (this.fixedCells.has(`${row}-${col}`)) {
                cell.classList.add('fixed');
            } else if (value !== 0) {
                cell.classList.add('user-input');
            }
            
            if (this.selectedCell && this.selectedCell.index === index) {
                cell.classList.add('selected');
            }
            
            if (this.settings.highlight && this.selectedCell) {
                const selRow = this.selectedCell.row;
                const selCol = this.selectedCell.col;
                
                if (row === selRow || col === selCol) {
                    cell.classList.add('highlighted');
                }
                
                const boxRow = Math.floor(row / 3);
                const boxCol = Math.floor(col / 3);
                const selBoxRow = Math.floor(selRow / 3);
                const selBoxCol = Math.floor(selCol / 3);
                
                if (boxRow === selBoxRow && boxCol === selBoxCol) {
                    cell.classList.add('highlighted');
                }
                
                if (value !== 0 && value === this.currentGrid[selRow][selCol]) {
                    cell.classList.add('same-number');
                }
            }
            
            if (value !== 0) {
                cell.textContent = value;
                
                if (this.settings.errorCheck && !this.fixedCells.has(`${row}-${col}`) && 
                    value !== this.solution[row][col]) {
                    cell.classList.add('error');
                }
            } else if (this.notes[row][col].size > 0) {
                const notesDiv = document.createElement('div');
                notesDiv.className = 'cell-notes';
                
                for (let i = 1; i <= 9; i++) {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'note';
                    if (this.notes[row][col].has(i)) {
                        noteSpan.textContent = i;
                    }
                    notesDiv.appendChild(noteSpan);
                }
                
                cell.appendChild(notesDiv);
            }
        });
        
        const noteBtn = document.getElementById('note-btn');
        noteBtn.classList.toggle('active', this.noteMode);
        
        this.updateNumberButtons();
    }

    updateNumberButtons() {
        const numButtons = document.querySelectorAll('.num-btn');
        
        numButtons.forEach(btn => {
            const num = parseInt(btn.dataset.num);
            let count = 0;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.currentGrid[row][col] === num) {
                        count++;
                    }
                }
            }
            
            btn.classList.toggle('completed', count >= 9);
        });
    }

    updateGameInfo() {
        document.getElementById('mistakes').textContent = this.mistakes;
        document.getElementById('hints-left').textContent = this.hintsLeft;
    }

    // Timer
    startTimer() {
        this.stopTimer();
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.formatTime(this.timer);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Di chuyển cell
    moveSelection(direction) {
        if (!this.selectedCell) {
            this.selectCell(0);
            return;
        }
        
        let { row, col } = this.selectedCell;
        
        switch(direction) {
            case 'up':
                row = (row - 1 + 9) % 9;
                break;
            case 'down':
                row = (row + 1) % 9;
                break;
            case 'left':
                col = (col - 1 + 9) % 9;
                break;
            case 'right':
                col = (col + 1) % 9;
                break;
        }
        
        this.selectCell(row * 9 + col);
    }

    toggleNoteMode() {
        this.noteMode = !this.noteMode;
        this.updateDisplay();
    }

    setDifficulty(level) {
        this.difficulty = level;
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
    }

    // Save/Load game
    async autoSave() {
        if (this.timer === 0) return; // Don't save empty game
        
        const gameState = this.getGameState();
        await this.storage.saveGame(gameState);
        this.showSavedIndicator(true);
    }

    async manualSave() {
        const slotName = prompt('Tên game (để trống = tự động):', 
            `Game ${new Date().toLocaleString('vi-VN')}`);
        
        if (slotName === null) return;
        
        const gameState = this.getGameState();
        const success = await this.storage.saveGame(gameState, slotName || null);
        
        if (success) {
            alert(slotName ? `Đã lưu "${slotName}"!` : 'Đã lưu game!');
            this.showSavedIndicator(true);
        } else {
            alert('Lỗi khi lưu game!');
        }
    }

    async showLoadGameModal() {
        const modal = document.getElementById('saved-games-modal');
        const list = document.getElementById('saved-games-list');
        
        const savedGames = await this.storage.getSavedGames();
        
        if (savedGames.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">Chưa có game nào được lưu</p>';
        } else {
            list.innerHTML = savedGames.map(game => `
                <div class="saved-game-item" data-name="${game.name}">
                    <div class="saved-game-info">
                        <h4>${game.slotName || game.name}</h4>
                        <p>Độ khó: ${this.getDifficultyName(game.difficulty)} • 
                           Thời gian: ${this.formatTime(game.timer)} • 
                           ${new Date(game.savedAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div class="saved-game-actions">
                        <button class="btn-primary load-game" data-name="${game.name}">Tải</button>
                        <button class="btn-danger delete-game" data-name="${game.name}">Xóa</button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            list.querySelectorAll('.load-game').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const name = btn.dataset.name;
                    const game = await this.storage.loadGame(name);
                    if (game) {
                        this.loadGameState(game);
                        modal.classList.add('hidden');
                    }
                });
            });
            
            list.querySelectorAll('.delete-game').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm('Xóa game này?')) {
                        await this.storage.deleteSavedGame(btn.dataset.name);
                        this.showLoadGameModal();
                    }
                });
            });
        }
        
        modal.classList.remove('hidden');
    }

    getDifficultyName(difficulty) {
        const names = {
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó',
            expert: 'Chuyên gia'
        };
        return names[difficulty] || difficulty;
    }

    getGameState() {
        return {
            puzzle: this.puzzle,
            solution: this.solution,
            currentGrid: this.currentGrid.map(row => [...row]),
            difficulty: this.difficulty,
            notes: this.notes.map(row => row.map(cell => Array.from(cell))),
            timer: this.timer,
            mistakes: this.mistakes,
            hintsLeft: this.hintsLeft,
            fixedCells: Array.from(this.fixedCells),
            isDailyChallenge: this.isDailyChallenge
        };
    }

    loadGameState(state) {
        this.puzzle = state.puzzle;
        this.solution = state.solution;
        this.currentGrid = state.currentGrid;
        this.difficulty = state.difficulty;
        this.notes = state.notes.map(row => row.map(cell => new Set(cell)));
        this.timer = state.timer;
        this.mistakes = state.mistakes;
        this.hintsLeft = state.hintsLeft;
        this.fixedCells = new Set(state.fixedCells);
        this.isDailyChallenge = state.isDailyChallenge || false;
        
        this.setDifficulty(this.difficulty);
        this.updateDisplay();
        this.updateGameInfo();
        this.startTimer();
        
        if (this.isDailyChallenge) {
            document.getElementById('daily-badge').style.display = 'flex';
        }
    }

    showSavedIndicator(show) {
        const indicator = document.getElementById('saved-indicator');
        if (show) {
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        } else {
            indicator.style.display = 'none';
        }
    }

    // Export/Import
    exportGame() {
        const state = this.getGameState();
        const exported = this.storage.exportGame(state);
        
        const modal = document.getElementById('import-export-modal');
        const textarea = document.getElementById('puzzle-data');
        const title = document.getElementById('ie-modal-title');
        
        title.textContent = '📤 Export Puzzle';
        textarea.value = exported;
        textarea.select();
        
        modal.classList.remove('hidden');
        
        // Setup copy button
        const copyBtn = document.getElementById('copy-export');
        copyBtn.style.display = 'block';
        copyBtn.onclick = () => {
            textarea.select();
            document.execCommand('copy');
            alert('Đã copy vào clipboard!');
        };
        
        document.getElementById('confirm-import').style.display = 'none';
    }

    showImportModal() {
        const modal = document.getElementById('import-export-modal');
        const textarea = document.getElementById('puzzle-data');
        const title = document.getElementById('ie-modal-title');
        
        title.textContent = '📥 Import Puzzle';
        textarea.value = '';
        textarea.placeholder = 'Paste puzzle data here...';
        
        modal.classList.remove('hidden');
        
        document.getElementById('copy-export').style.display = 'none';
        const importBtn = document.getElementById('confirm-import');
        importBtn.style.display = 'block';
        importBtn.onclick = () => {
            const data = textarea.value.trim();
            if (data) {
                const imported = this.storage.importGame(data);
                if (imported) {
                    this.loadGameState(imported);
                    modal.classList.add('hidden');
                    alert('Import thành công!');
                } else {
                    alert('Dữ liệu không hợp lệ!');
                }
            }
        };
    }

    // Event listeners
    attachEventListeners() {
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.level);
            });
        });

        // New game
        document.getElementById('new-game').addEventListener('click', () => {
            if (this.timer > 0) {
                if (!confirm('Bắt đầu game mới? Game hiện tại sẽ không được lưu.')) {
                    return;
                }
            }
            this.newGame();
        });

        // Daily challenge
        document.getElementById('daily-challenge-btn').addEventListener('click', async () => {
            const isCompleted = await this.dailyChallenge.isDailyCompletedToday();
            if (isCompleted) {
                alert('Bạn đã hoàn thành Daily Challenge hôm nay! ✓\nQuay lại vào ngày mai nhé!');
                return;
            }
            
            if (this.timer > 0) {
                if (!confirm('Bắt đầu Daily Challenge? Game hiện tại sẽ không được lưu.')) {
                    return;
                }
            }
            this.newGame(true);
        });

        // Save/Load
        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.manualSave();
        });

        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.showLoadGameModal();
        });

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportGame();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            this.showImportModal();
        });

        // Number buttons
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                this.inputNumber(num);
            });
        });

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('erase-btn').addEventListener('click', () => {
            this.eraseCell();
        });

        document.getElementById('note-btn').addEventListener('click', () => {
            this.toggleNoteMode();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.giveHint();
        });

        document.getElementById('solve-btn').addEventListener('click', () => {
            this.solvePuzzle();
        });

        // Pause
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Modals
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.statistics.updateStatsDisplay();
            document.getElementById('stats-modal').classList.remove('hidden');
        });

        document.getElementById('theme-btn').addEventListener('click', () => {
            document.getElementById('theme-modal').classList.remove('hidden');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('hidden');
        });

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.modal).classList.add('hidden');
            });
        });

        // Win modal
        document.getElementById('new-game-modal').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('view-stats-btn').addEventListener('click', () => {
            document.getElementById('win-modal').classList.add('hidden');
            this.statistics.updateStatsDisplay();
            document.getElementById('stats-modal').classList.remove('hidden');
        });

        // Reset stats
        document.getElementById('reset-stats-btn').addEventListener('click', async () => {
            if (confirm('Bạn có chắc muốn reset tất cả thống kê?')) {
                await this.statistics.resetStats();
                this.statistics.updateStatsDisplay();
                alert('Đã reset thống kê!');
            }
        });

        // Settings toggles
        document.querySelectorAll('#settings-modal input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.saveSettings();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
            }
        });
    }

    // Xử lý phím tắt
    handleKeyPress(e) {
        // Don't handle shortcuts if typing in textarea
        if (e.target.tagName === 'TEXTAREA') return;

        const preventKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', ' '];
        if (preventKeys.includes(e.key)) {
            e.preventDefault();
        }

        // Arrow keys
        if (e.key === 'ArrowUp') this.moveSelection('up');
        if (e.key === 'ArrowDown') this.moveSelection('down');
        if (e.key === 'ArrowLeft') this.moveSelection('left');
        if (e.key === 'ArrowRight') this.moveSelection('right');

        // Tab
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                this.moveSelection('left');
            } else {
                this.moveSelection('right');
            }
        }

        // Numbers
        if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            
            if (e.shiftKey) {
                const wasNoteMode = this.noteMode;
                this.noteMode = true;
                this.inputNumber(num);
                this.noteMode = wasNoteMode;
            } else if (e.altKey) {
                const wasNoteMode = this.noteMode;
                this.noteMode = false;
                this.inputNumber(num);
                this.noteMode = wasNoteMode;
            } else {
                this.inputNumber(num);
            }
        }

        // Delete/Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.eraseCell();
        }

        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === 'z') {
            this.undo();
        }

        // Ctrl+S - Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.manualSave();
        }

        // Ctrl+O - Load
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.showLoadGameModal();
        }

        // - (Minus) - Undo
        if (e.key === '-') {
            this.undo();
        }

        // X - Toggle note mode
        if (e.key === 'x' || e.key === 'X') {
            this.toggleNoteMode();
        }

        // C - Digit mode
        if (e.key === 'c' || e.key === 'C') {
            this.noteMode = false;
            this.updateDisplay();
        }

        // D - Dark mode
        if (e.key === 'd' || e.key === 'D') {
            this.themeManager.toggleDarkMode();
        }

        // H - Hint
        if (e.key === 'h' || e.key === 'H') {
            this.giveHint();
        }

        // N - New game
        if (e.key === 'n' || e.key === 'N') {
            if (this.timer > 0) {
                if (!confirm('Bắt đầu game mới?')) return;
            }
            this.newGame();
        }

        // S - Solve (without Ctrl)
        if (!e.ctrlKey && (e.key === 's' || e.key === 'S')) {
            this.solvePuzzle();
        }

        // P - Pause
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
        }

        // Escape - Close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    }
}

// Khởi tạo game khi load
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SudokuGame();
});
