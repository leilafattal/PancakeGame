import GameManager from './GameManager.js';

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const gameManager = new GameManager();
    gameManager.init();
});
