// Sudoku Solver
class SudokuSolver {
    // Giải Sudoku sử dụng backtracking
    solve(grid) {
        const puzzle = grid.map(row => [...row]);
        
        if (this.solveSudoku(puzzle)) {
            return puzzle;
        }
        return null;
    }

    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Kiểm tra tính hợp lệ
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

    // Kiểm tra puzzle có giải pháp duy nhất không
    hasUniqueSolution(grid) {
        const solutions = [];
        this.countSolutions(grid.map(row => [...row]), solutions, 2);
        return solutions.length === 1;
    }

    countSolutions(grid, solutions, limit) {
        if (solutions.length >= limit) return;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            this.countSolutions(grid, solutions, limit);
                            grid[row][col] = 0;
                            
                            if (solutions.length >= limit) return;
                        }
                    }
                    return;
                }
            }
        }
        
        // Tìm thấy một giải pháp
        solutions.push(grid.map(row => [...row]));
    }

    // Kiểm tra puzzle đã hoàn thành chưa
    isComplete(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return false;
                if (!this.isValid(grid, row, col, grid[row][col])) return false;
            }
        }
        return true;
    }

    // Kiểm tra số hiện tại có hợp lệ không
    isCurrentValid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) {
                    const num = grid[row][col];
                    grid[row][col] = 0;
                    if (!this.isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        return false;
                    }
                    grid[row][col] = num;
                }
            }
        }
        return true;
    }
}
