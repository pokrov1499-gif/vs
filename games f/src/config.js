export const BOARD_SIZE = 8;
export const TILE_COLORS = ['orange', 'pink', 'blue', 'purple', 'green'];
export const ELITE_COLOR = 'elite';
export const ELITE_SPAWN_CHANCE = 0.12; // 12% chance for elite tile

export const TILE_ICONS = {
  orange: '🐱',
  pink: '😺',
  blue: '😸',
  purple: '😻',
  green: '😹',
  elite: '⭐'
};

export const HERO_CONFIG = {
  STRIKER: {
    id: 'striker',
    name: 'Striker Cat',
    maxHP: 200,
    baseAttack: 20,
    defense: 0,
    level1Passive: 0.3, // +30% attack
    level2Passive: 0.6, // +60% attack
    eliteRequired: 4
  },
  HEALER: {
    id: 'healer',
    name: 'Healer Cat',
    maxHP: 200,
    baseAttack: 18,
    defense: 0.1, // 10% damage reduction
    healPercent: 0.15, // Heals 15% max HP
    healColor: 'blue', // Heal triggers on blue match-4+
    eliteRequired: 4
  }
};

export const MATCH_MULTIPLIERS = {
  3: 1.0,
  4: 1.5,
  5: 2.0
};

export const ANIMATION_DURATION = {
  SWAP: 200,
  POP: 500,
  DROP: 400,
  DAMAGE: 400
};

export const ELITE_LEVEL_THRESHOLD = 4; // 4 elite matches to level up