import { HERO_CONFIG, MATCH_MULTIPLIERS } from './config.js';

export class Hero {
  constructor(config, isPlayerA) {
    this.id = config.id;
    this.name = config.name;
    this.maxHP = config.maxHP;
    this.currentHP = config.maxHP;
    this.baseAttack = config.baseAttack;
    this.defense = config.defense;
    this.level = 1;
    this.eliteMatches = 0;
    this.eliteRequired = config.eliteRequired;
    this.isPlayerA = isPlayerA;
    
    // Striker-specific
    this.level1Passive = config.level1Passive;
    this.level2Passive = config.level2Passive;
    
    // Healer-specific
    this.healPercent = config.healPercent;
    this.healColor = config.healColor;
  }

  getAttack() {
    if (this.id === 'striker') {
      const passiveBonus = this.level === 1 ? this.level1Passive : this.level2Passive;
      return Math.floor(this.baseAttack * (1 + passiveBonus));
    }
    return this.baseAttack;
  }

  takeDamage(amount) {
    const actualDamage = Math.floor(amount * (1 - this.defense));
    this.currentHP = Math.max(0, this.currentHP - actualDamage);
    this.updateHealthDisplay();
    
    // Damage animation
    const prefix = this.isPlayerA ? 'a' : 'b';
    const avatar = document.querySelector(`.hero-${prefix} .hero-avatar`);
    if (avatar) {
      avatar.classList.add('damaged');
      setTimeout(() => avatar.classList.remove('damaged'), 400);
    }
    
    return actualDamage;
  }

  heal(amount) {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    this.updateHealthDisplay();
    
    // Heal animation
    const prefix = this.isPlayerA ? 'a' : 'b';
    const avatar = document.querySelector(`.hero-${prefix} .hero-avatar`);
    if (avatar) {
      avatar.classList.add('heal');
      setTimeout(() => avatar.classList.remove('heal'), 800);
    }
  }

  addEliteMatch() {
    this.eliteMatches++;
    this.updateEliteDisplay();
    
    if (this.eliteMatches >= this.eliteRequired && this.level === 1) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level = 2;
    this.updateLevelDisplay();
    this.updateAttackDisplay();
    
    return {
      success: true,
      message: `${this.name} reached Level 2!`
    };
  }

  processMatch(matchData, opponent) {
    const { color, count, hasElite } = matchData;
    let logs = [];
    
    // Add elite progress
    if (hasElite && this.level === 1) {
      this.addEliteMatch();
      logs.push(`⭐ ${this.name} gained elite progress! (${this.eliteMatches}/${this.eliteRequired})`);
      
      if (this.level === 2) {
        logs.push(`🌟 ${this.name} LEVELED UP to Level 2!`);
      }
    }
    
    // Calculate damage
    const multiplier = MATCH_MULTIPLIERS[Math.min(count, 5)] || 1.0;
    const baseDamage = this.getAttack() * multiplier;
    const actualDamage = opponent.takeDamage(baseDamage);
    
    logs.push(`⚔️ ${this.name} deals ${actualDamage} damage! (Match-${count})`);
    
    // Healer ability check
    if (this.id === 'healer' && color === this.healColor && count >= 4) {
      const healAmount = Math.floor(this.maxHP * this.healPercent);
      this.heal(healAmount);
      logs.push(`💚 ${this.name} heals for ${healAmount} HP!`);
    }
    
    return logs;
  }

  updateHealthDisplay() {
    const prefix = this.isPlayerA ? 'a' : 'b';
    const healthPercentage = (this.currentHP / this.maxHP) * 100;
    const healthFill = document.getElementById(`hero-${prefix}-health-fill`);
    const healthText = document.getElementById(`hero-${prefix}-health-text`);
    
    if (healthFill) {
      healthFill.style.width = `${healthPercentage}%`;
      
      if (healthPercentage > 60) {
        healthFill.style.background = 'linear-gradient(90deg, #00D2FF 0%, #3A47D5 100%)';
      } else if (healthPercentage > 30) {
        healthFill.style.background = 'linear-gradient(90deg, #F7B731 0%, #F79F1F 100%)';
      } else {
        healthFill.style.background = 'linear-gradient(90deg, #EE5A6F 0%, #C23616 100%)';
      }
    }
    
    if (healthText) {
      healthText.textContent = `${this.currentHP}/${this.maxHP}`;
    }
  }

  updateLevelDisplay() {
    const prefix = this.isPlayerA ? 'a' : 'b';
    const levelSpan = document.getElementById(`hero-${prefix}-level`);
    if (levelSpan) {
      levelSpan.textContent = this.level;
    }
  }

  updateAttackDisplay() {
    const prefix = this.isPlayerA ? 'a' : 'b';
    const attackSpan = document.getElementById(`hero-${prefix}-attack`);
    if (attackSpan) {
      attackSpan.textContent = this.getAttack();
    }
    
    const passiveSpan = document.getElementById(`hero-${prefix}-passive`);
    if (passiveSpan && this.id === 'striker') {
      const bonus = this.level === 1 ? '+30% ATK' : '+60% ATK';
      passiveSpan.textContent = bonus;
    }
  }

  updateEliteDisplay() {
    const prefix = this.isPlayerA ? 'a' : 'b';
    const eliteCounter = document.getElementById(`hero-${prefix}-elite`);
    if (eliteCounter) {
      eliteCounter.textContent = `${Math.min(this.eliteMatches, this.eliteRequired)}/${this.eliteRequired}`;
    }
  }

  isAlive() {
    return this.currentHP > 0;
  }
}