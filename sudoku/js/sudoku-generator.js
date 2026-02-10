// Sudoku Generator
class SudokuGenerator {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
    }

    // Sinh một Sudoku hoàn chỉnh
    generate() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillGrid();
        return this.grid;
    }

    // Kiểm tra số có hợp lệ tại vị trí không
    isValid(grid, row, col, num) {
        // Kiểm tra hàng
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // Kiểm tra cột
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // Kiểm tra box 3x3
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    // Điền số vào grid
    fillGrid() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    // Shuffle numbers
                    const shuffled = numbers.sort(() => Math.random() - 0.5);
                    
                    for (let num of shuffled) {
                        if (this.isValid(this.grid, row, col, num)) {
                            this.grid[row][col] = num;
                            
                            if (this.fillGrid()) {
                                return true;
                            }
                            
                            this.grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Tạo puzzle với độ khó
    createPuzzle(difficulty = 'medium') {
        const complete = this.generate();
        const puzzle = complete.map(row => [...row]);
        
        // Số ô cần xóa dựa trên độ khó
        const cellsToRemove = {
            'easy': 35,
            'medium': 45,
            'hard': 52,
            'expert': 58
        }[difficulty] || 45;

        let removed = 0;
        const attempts = cellsToRemove * 3; // Giới hạn số lần thử

        for (let i = 0; i < attempts && removed < cellsToRemove; i++) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);

            if (puzzle[row][col] !== 0) {
                const backup = puzzle[row][col];
                puzzle[row][col] = 0;
                
                // Đảm bảo puzzle vẫn có duy nhất một lời giải
                const solver = new SudokuSolver();
                if (solver.hasUniqueSolution(puzzle)) {
                    removed++;
                } else {
                    puzzle[row][col] = backup;
                }
            }
        }

        return {
            puzzle: puzzle,
            solution: complete
        };
    }

    // Tạo puzzle đơn giản hơn (nhanh hơn)
    createPuzzleFast(difficulty = 'medium') {
        const complete = this.generate();
        const puzzle = complete.map(row => [...row]);
        
        const cellsToRemove = {
            'easy': 35,
            'medium': 45,
            'hard': 52,
            'expert': 58
        }[difficulty] || 45;

        let removed = 0;

        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);

            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }

        return {
            puzzle: puzzle,
            solution: complete
        };
    }
}
