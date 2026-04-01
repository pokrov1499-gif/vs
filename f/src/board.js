// Updated board.js

// Initialize selectedTile to null
let selectedTile = null;

// Function to handle tile selection
function selectTile(tile) {
    if (!tile) return; // Null check
    if (selectedTile === tile) {
        deselectTile(tile); // Fix same-tile deselection
    } else {
        selectedTile = tile;
        // Handle selection logic
    }
}

function initialize() {
    selectedTile = null; // Reset selectedTile
    // Other initialization logic
}

// Animation state management with error handling
function updateAnimationState(state) {
    try {
        // Update animation logic based on state
    } catch (error) {
        console.error('Animation state error:', error);
    }
}

// Elite tile spawning logic
function spawnEliteTile() {
    const spawnChance = Math.random();
    if (spawnChance < 0.1) { // Reduced elite spawn chance
        // Spawn elite tile
    }
}