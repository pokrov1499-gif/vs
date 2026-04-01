import { BOARD_SIZE, TILE_COLORS, ELITE_COLOR, ELITE_SPAWN_CHANCE, TILE_ICONS, ANIMATION_DURATION } from './config.js';

export class Board {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.size = BOARD_SIZE;
    this.grid = [];
    this.selectedTile = null;
    this.isAnimating = false;
    this.onMatchCallback = null;
  }

  initialize() {
    this.container.innerHTML = '';
    this.grid = [];
    
    // Create grid without initial matches
    for (let row = 0; row < this.size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        const color = this.getRandomColorWithoutMatch(row, col);
        this.grid[row][col] = { color, element: null };
      }
    }
    
    this.renderBoard();
  }

  getRandomColorWithoutMatch(row, col) {
    let availableColors = [...TILE_COLORS];
    
    // Check horizontal
    if (col >= 2) {
      const prev1 = this.grid[row][col - 1]?.color;
      const prev2 = this.grid[row][col - 2]?.color;
      if (prev1 === prev2 && prev1 !== ELITE_COLOR) {
        availableColors = availableColors.filter(c => c !== prev1);
      }
    }
    
    // Check vertical
    if (row >= 2) {
      const prev1 = this.grid[row - 1][col]?.color;
      const prev2 = this.grid[row - 2][col]?.color;
      if (prev1 === prev2 && prev1 !== ELITE_COLOR) {
        availableColors = availableColors.filter(c => c !== prev1);
      }
    }
    
    // Small chance for elite tile
    if (Math.random() < ELITE_SPAWN_CHANCE) {
      return ELITE_COLOR;
    }
    
    return availableColors.length > 0 
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
  }

  renderBoard() {
    this.container.innerHTML = '';
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const tile = this.grid[row][col];
        const tileElement = document.createElement('div');
        tileElement.className = `tile ${tile.color}`;
        tileElement.textContent = TILE_ICONS[tile.color];
        tileElement.dataset.row = row;
        tileElement.dataset.col = col;
        
        tileElement.addEventListener('click', () => this.handleTileClick(row, col));
        
        this.container.appendChild(tileElement);
        tile.element = tileElement;
      }
    }
  }

  handleTileClick(row, col) {
    if (this.isAnimating) return;
    
    const clickedTile = { row, col };
    
    if (!this.selectedTile) {
      // First selection
      this.selectedTile = clickedTile;
      this.grid[row][col].element.classList.add('selected');
    } else {
      // Second selection - check if adjacent
      const isAdjacent = this.areAdjacent(this.selectedTile, clickedTile);
      
      // Deselect previous
      this.grid[this.selectedTile.row][this.selectedTile.col].element.classList.remove('selected');
      
      if (isAdjacent) {
        this.swapTiles(this.selectedTile, clickedTile);
      }
      
      this.selectedTile = null;
    }
  }

  areAdjacent(tile1, tile2) {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  async swapTiles(tile1, tile2) {
    this.isAnimating = true;
    
    // Swap in grid
    const temp = this.grid[tile1.row][tile1.col];
    this.grid[tile1.row][tile1.col] = this.grid[tile2.row][tile2.col];
    this.grid[tile2.row][tile2.col] = temp;
    
    // Update positions
    this.grid[tile1.row][tile1.col].element.dataset.row = tile1.row;
    this.grid[tile1.row][tile1.col].element.dataset.col = tile1.col;
    this.grid[tile2.row][tile2.col].element.dataset.row = tile2.row;
    this.grid[tile2.row][tile2.col].element.dataset.col = tile2.col;
    
    await this.animateSwap(tile1, tile2);
    
    // Check for matches
    const matches = this.findMatches();
    
    if (matches.length === 0) {
      // No matches, swap back
      const temp2 = this.grid[tile1.row][tile1.col];
      this.grid[tile1.row][tile1.col] = this.grid[tile2.row][tile2.col];
      this.grid[tile2.row][tile2.col] = temp2;
      
      await this.animateSwap(tile1, tile2);
      this.isAnimating = false;
    } else {
      // Process matches
      await this.processMatches();
    }
  }

  async animateSwap(tile1, tile2) {
    return new Promise(resolve => {
      const element1 = this.grid[tile1.row][tile1.col].element;
      const element2 = this.grid[tile2.row][tile2.col].element;
      
      const index1 = tile1.row * this.size + tile1.col;
      const index2 = tile2.row * this.size + tile2.col;
      
      // Temporarily swap DOM positions
      const parent = this.container;
      const allTiles = Array.from(parent.children);
      
      parent.insertBefore(element1, allTiles[index2]);
      parent.insertBefore(element2, allTiles[index1]);
      
      setTimeout(resolve, ANIMATION_DURATION.SWAP);
    });
  }

  findMatches() {
    const matches = new Map(); // Use Map to store match details by position
    
    // Check horizontal matches
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size - 2; col++) {
        const color = this.grid[row][col].color;
        
        // Skip elite color for regular matching
        if (color === ELITE_COLOR) continue;
        
        if (color === this.grid[row][col + 1].color && 
            color === this.grid[row][col + 2].color) {
          
          // Find the full length of the match
          let matchLength = 3;
          let endCol = col + 2;
          
          while (endCol + 1 < this.size && this.grid[row][endCol + 1].color === color) {
            matchLength++;
            endCol++;
          }
          
          // Add all tiles in this match
          for (let c = col; c <= endCol; c++) {
            const key = `${row},${c}`;
            matches.set(key, { row, col: c, color, matchLength });
          }
          
          col = endCol; // Skip to end of match
        }
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row < this.size - 2; row++) {
        const color = this.grid[row][col].color;
        
        // Skip elite color for regular matching
        if (color === ELITE_COLOR) continue;
        
        if (color === this.grid[row + 1][col].color && 
            color === this.grid[row + 2][col].color) {
          
          // Find the full length of the match
          let matchLength = 3;
          let endRow = row + 2;
          
          while (endRow + 1 < this.size && this.grid[endRow + 1][col].color === color) {
            matchLength++;
            endRow++;
          }
          
          // Add all tiles in this match
          for (let r = row; r <= endRow; r++) {
            const key = `${r},${col}`;
            const existing = matches.get(key);
            // Keep the larger match length
            if (!existing || matchLength > existing.matchLength) {
              matches.set(key, { row: r, col, color, matchLength });
            }
          }
          
          row = endRow; // Skip to end of match
        }
      }
    }
    
    return Array.from(matches.values());
  }

  async processMatches() {
    const allMatches = this.findMatches();
    
    if (allMatches.length === 0) {
      this.isAnimating = false;
      return;
    }
    
    // Group matches by color and calculate stats
    const matchesByColor = {};
    let hasElite = false;
    
    allMatches.forEach(match => {
      if (!matchesByColor[match.color]) {
        matchesByColor[match.color] = {
          tiles: [],
          maxLength: 0
        };
      }
      
      matchesByColor[match.color].tiles.push(match);
      matchesByColor[match.color].maxLength = Math.max(
        matchesByColor[match.color].maxLength,
        match.matchLength
      );
    });
    
    // Check for elite tiles in matched positions
    allMatches.forEach(({ row, col }) => {
      if (this.grid[row][col].color === ELITE_COLOR) {
        hasElite = true;
      }
    });
    
    // Also check adjacent elite tiles that should be removed
    const elitesToRemove = [];
    allMatches.forEach(({ row, col }) => {
      // Check all 4 directions for elite tiles
      const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
      ];
      
      directions.forEach(({ dr, dc }) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
          if (this.grid[newRow][newCol].color === ELITE_COLOR) {
            const key = `${newRow},${newCol}`;
            if (!elitesToRemove.includes(key)) {
              elitesToRemove.push(key);
              hasElite = true;
            }
          }
        }
      });
    });
    
    // Prepare match data for game logic
    const matchData = [];
    for (const [color, data] of Object.entries(matchesByColor)) {
      matchData.push({
        color,
        count: data.tiles.length,
        maxLength: data.maxLength,
        hasElite
      });
    }
    
    // Remove matches with animation
    await this.removeMatches(allMatches);
    
    // Remove adjacent elite tiles
    for (const key of elitesToRemove) {
      const [row, col] = key.split(',').map(Number);
      if (this.grid[row][col].color === ELITE_COLOR) {
        this.grid[row][col] = { color: null, element: null };
      }
    }
    
    // Apply gravity and fill
    await this.applyGravity();
    await this.fillEmptySpaces();
    
    // Check for chain reactions
    const newMatches = this.findMatches();
    if (newMatches.length > 0) {
      await this.processMatches();
    } else {
      // No more matches, trigger callback
      if (this.onMatchCallback && matchData.length > 0) {
        this.onMatchCallback(matchData);
      }
      this.isAnimating = false;
    }
  }

  async removeMatches(matches) {
    return new Promise(resolve => {
      matches.forEach(({ row, col }) => {
        const tile = this.grid[row][col];
        if (tile.element) {
          tile.element.classList.add('popping');
        }
      });
      
      setTimeout(() => {
        matches.forEach(({ row, col }) => {
          this.grid[row][col] = { color: null, element: null };
        });
        resolve();
      }, ANIMATION_DURATION.POP);
    });
  }

  async applyGravity() {
    return new Promise(resolve => {
      for (let col = 0; col < this.size; col++) {
        let emptyRow = this.size - 1;
        
        for (let row = this.size - 1; row >= 0; row--) {
          if (this.grid[row][col].color !== null) {
            if (row !== emptyRow) {
              this.grid[emptyRow][col] = this.grid[row][col];
              this.grid[row][col] = { color: null, element: null };
              
              // Update element position
              if (this.grid[emptyRow][col].element) {
                this.grid[emptyRow][col].element.dataset.row = emptyRow;
                this.grid[emptyRow][col].element.classList.add('dropping');
              }
            }
            emptyRow--;
          }
        }
      }
      
      this.rerenderBoard();
      setTimeout(resolve, ANIMATION_DURATION.DROP);
    });
  }

  async fillEmptySpaces() {
    return new Promise(resolve => {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          if (this.grid[row][col].color === null) {
            // Random chance for elite
            let color;
            if (Math.random() < ELITE_SPAWN_CHANCE) {
              color = ELITE_COLOR;
            } else {
              color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
            }
            this.grid[row][col] = { color, element: null };
          }
        }
      }
      
      this.rerenderBoard();
      setTimeout(resolve, ANIMATION_DURATION.DROP);
    });
  }

  rerenderBoard() {
    this.container.innerHTML = '';
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const tile = this.grid[row][col];
        if (tile.color) {
          const tileElement = document.createElement('div');
          tileElement.className = `tile ${tile.color}`;
          tileElement.textContent = TILE_ICONS[tile.color];
          tileElement.dataset.row = row;
          tileElement.dataset.col = col;
          
          tileElement.addEventListener('click', () => this.handleTileClick(row, col));
          
          this.container.appendChild(tileElement);
          tile.element = tileElement;
        }
      }
    }
  }

  onMatch(callback) {
    this.onMatchCallback = callback;
  }

  setEnabled(enabled) {
    this.isAnimating = !enabled;
  }
}