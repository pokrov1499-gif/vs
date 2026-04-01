import { Board } from './board.js';
import { Game } from './game.js';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create board
  const board = new Board('game-board');
  board.initialize();
  
  // Create game
  const game = new Game(board);
  
  // Restart button
  const restartButton = document.getElementById('restart-button');
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      game.restart();
    });
  }
  
  console.log('😺 Cat Clash - Game Initialized! 😺');
  console.log('Match tiles to attack your opponent!');
  console.log('Match 4 elite stars (⭐) to level up!');
});