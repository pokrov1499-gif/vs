import { Hero } from './hero.js';
import { HERO_CONFIG } from './config.js';

export class Game {
  constructor(board) {
    this.board = board;
    this.heroA = null;
    this.heroB = null;
    this.currentTurn = 'A'; // 'A' or 'B'
    this.roundNumber = 1;
    this.gameOver = false;
    
    this.initializeHeroes();
    this.updateTurnDisplay();
    
    // Set up match callback
    this.board.onMatch((matchData) => this.handleMatches(matchData));
  }

  initializeHeroes() {
    this.heroA = new Hero(HERO_CONFIG.STRIKER, true);
    this.heroB = new Hero(HERO_CONFIG.HEALER, false);
    
    // Initialize displays
    this.heroA.updateHealthDisplay();
    this.heroA.updateLevelDisplay();
    this.heroA.updateAttackDisplay();
    this.heroA.updateEliteDisplay();
    
    this.heroB.updateHealthDisplay();
    this.heroB.updateLevelDisplay();
    this.heroB.updateAttackDisplay();
    this.heroB.updateEliteDisplay();
  }

  handleMatches(matchDataArray) {
    if (this.gameOver) return;
    
    const attacker = this.currentTurn === 'A' ? this.heroA : this.heroB;
    const defender = this.currentTurn === 'A' ? this.heroB : this.heroA;
    
    let allLogs = [];
    
    // Process each color match
    matchDataArray.forEach(matchData => {
      const logs = attacker.processMatch(matchData, defender);
      allLogs = allLogs.concat(logs);
    });
    
    // Display all logs
    this.displayActionLog(allLogs.join(' | '));
    
    // Check win condition
    setTimeout(() => {
      if (!defender.isAlive()) {
        this.endGame(attacker);
      } else {
        // Switch turns
        this.switchTurn();
      }
    }, 1000);
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === 'A' ? 'B' : 'A';
    
    if (this.currentTurn === 'A') {
      this.roundNumber++;
      this.updateRoundDisplay();
    }
    
    this.updateTurnDisplay();
  }

  updateTurnDisplay() {
    const turnText = document.getElementById('turn-text');
    if (turnText) {
      if (this.currentTurn === 'A') {
        turnText.textContent = '🔴 Striker Cat\'s Turn';
        turnText.style.color = '#FF9F68';
      } else {
        turnText.textContent = '🔵 Healer Cat\'s Turn';
        turnText.style.color = '#74B9FF';
      }
    }
  }

  updateRoundDisplay() {
    const roundNumber = document.getElementById('round-number');
    if (roundNumber) {
      roundNumber.textContent = this.roundNumber;
    }
  }

  displayActionLog(text) {
    const actionText = document.getElementById('action-text');
    if (actionText) {
      actionText.textContent = text;
    }
  }

  endGame(winner) {
    this.gameOver = true;
    this.board.setEnabled(false);
    
    setTimeout(() => {
      this.showGameOverModal(winner);
    }, 1500);
  }

  showGameOverModal(winner) {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    const winnerPortrait = document.getElementById('winner-portrait');
    
    if (title) {
      title.textContent = `${winner.name} Wins! 🎉`;
    }
    
    if (message) {
      message.textContent = `Victory achieved in ${this.roundNumber} rounds!`;
    }
    
    if (winnerPortrait) {
      // Clone the winner's SVG avatar
      const winnerPanel = winner.isPlayerA ? '.hero-a' : '.hero-b';
      const avatarElement = document.querySelector(`${winnerPanel} .hero-avatar`);
      if (avatarElement) {
        winnerPortrait.innerHTML = avatarElement.outerHTML;
      }
    }
    
    const finalRounds = document.getElementById('final-rounds');
    if (finalRounds) {
      finalRounds.textContent = this.roundNumber;
    }
    
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  restart() {
    this.gameOver = false;
    this.currentTurn = 'A';
    this.roundNumber = 1;
    
    this.updateRoundDisplay();
    this.updateTurnDisplay();
    
    this.initializeHeroes();
    this.board.initialize();
    this.board.setEnabled(true);
    
    this.displayActionLog('Match tiles to attack!');
    
    const modal = document.getElementById('game-over-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}