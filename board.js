// Fixed board.js

class Board {
  // Other methods...

  initialize() {
    this.selectedTile = null; // Reset selectedTile
    // Rest of the initialization logic...
  }

  deselectTile() {
    // Add same-tile deselection logic
    if (this.selectedTile) {
      this.selectedTile = null;
    }
  }

  matchColors(tileA, tileB) {
    // Null checks for color matching
    if (!tileA || !tileB) return false;
    return tileA.color === tileB.color;
  }

  spawnElite() {
    // Reduce elite spawn chance to 6%
    if (Math.random() < 0.06) {
      this.createEliteTile();
    }
  }

  animateAction() {
    try {
      // Prevent animation lock
      this.performAnimation();
    } catch (error) {
      console.error('Animation error:', error);
    }
  }

  // Other methods...
}
