import GameEngine from './GameEngine.js';
import MenuScene from '../scenes/MenuScene.js';
import ClassicStackScene from '../scenes/ClassicStackScene.js';
import DecorateScene from '../scenes/DecorateScene.js';

class GameManager {
    constructor() {
        this.currentScene = null;
        this.gameEngine = null;
        this.highScore = 0;

        // Game state
        this.state = 'LOADING'; // LOADING, MENU, PLAYING, GAME_OVER, DECORATING

        // UI Elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.uiOverlay = document.getElementById('ui-overlay');

        // Load saved data
        this.loadGameData();
    }

    async init() {
        console.log('🥞 Initializing Pancake Stack Frenzy...');

        // Initialize game engine
        this.gameEngine = new GameEngine();
        await this.gameEngine.init();

        // Set up button event listeners
        this.setupEventListeners();

        // Hide loading screen and show menu
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            this.showMenu();
        }, 1000);
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('play-button').addEventListener('click', () => {
            this.startClassicMode();
        });

        document.getElementById('decorate-button').addEventListener('click', () => {
            this.startDecorateMode();
        });

        document.getElementById('settings-button').addEventListener('click', () => {
            alert('Settings coming soon!');
        });

        // Game over buttons
        document.getElementById('replay-button').addEventListener('click', () => {
            this.startClassicMode();
        });

        document.getElementById('menu-button').addEventListener('click', () => {
            this.showMenu();
        });
    }

    showMenu() {
        this.state = 'MENU';
        this.menuScreen.classList.remove('hidden');
        this.gameOverScreen.classList.remove('visible');
        this.uiOverlay.style.display = 'none';

        // Update high score display
        document.getElementById('menu-high-score').textContent = this.highScore;

        // Clean up current scene if exists
        if (this.currentScene) {
            this.currentScene.destroy();
            this.currentScene = null;
        }

        // Load menu scene
        this.currentScene = new MenuScene(this.gameEngine);
        this.currentScene.init();
    }

    startClassicMode() {
        this.state = 'PLAYING';
        this.menuScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('visible');
        this.uiOverlay.style.display = 'block';

        // Clean up current scene
        if (this.currentScene) {
            this.currentScene.destroy();
        }

        // Start classic stack scene
        this.currentScene = new ClassicStackScene(this.gameEngine, this);
        this.currentScene.init();
    }

    startDecorateMode() {
        this.state = 'DECORATING';
        this.menuScreen.classList.add('hidden');
        this.uiOverlay.style.display = 'none';

        // Clean up current scene
        if (this.currentScene) {
            this.currentScene.destroy();
        }

        // Start decorate scene
        this.currentScene = new DecorateScene(this.gameEngine, this);
        this.currentScene.init();
    }

    onGameOver(score, pancakeCount) {
        this.state = 'GAME_OVER';

        // Check for new high score (based on pancake count)
        const isNewRecord = pancakeCount > this.highScore;
        if (isNewRecord) {
            this.highScore = pancakeCount;
            this.saveGameData();
        }

        // Update game over screen
        document.getElementById('final-score').textContent = pancakeCount;
        document.getElementById('best-score').textContent = this.highScore;
        document.getElementById('pancake-count').textContent = pancakeCount;

        const newRecordElement = document.getElementById('new-record');
        if (isNewRecord) {
            newRecordElement.style.display = 'block';
        } else {
            newRecordElement.style.display = 'none';
        }

        // Show game over screen with delay
        setTimeout(() => {
            this.gameOverScreen.classList.add('visible');
        }, 2000);
    }

    updateScore(pancakeCount) {
        document.getElementById('score-display').textContent = `Pancakes: ${pancakeCount}`;
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('pancakeStackFrenzy');
            console.log('Loaded game data:', savedData);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.highScore = data.highScore || 0;
                console.log('High score loaded:', this.highScore);
            }
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }

    resetHighScore() {
        this.highScore = 0;
        localStorage.removeItem('pancakeStackFrenzy');
        console.log('High score reset!');
    }

    saveGameData() {
        try {
            const data = {
                highScore: this.highScore,
                lastPlayed: Date.now()
            };
            localStorage.setItem('pancakeStackFrenzy', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
}

export default GameManager;
