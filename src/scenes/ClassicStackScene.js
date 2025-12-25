import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class ClassicStackScene {
    constructor(gameEngine, gameManager) {
        this.gameEngine = gameEngine;
        this.gameManager = gameManager;

        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.pancakeCount = 0;
        this.consecutivePerfectPlacements = 0;
        this.scoreMultiplier = 1;

        // Pancake management
        this.currentPancake = null;
        this.stackedPancakes = [];
        this.ground = null;

        // Pancake properties
        this.pancakeRadius = 1.2;
        this.pancakeHeight = 0.25;

        // Physics tracking
        this.lastStackHeight = 0;
        this.wobbleAngle = 0;
        this.collapseThreshold = 0.3; // radians (~17 degrees)
        this.isCollapsing = false;

        // Input
        this.swayPosition = 0;
        this.swayDirection = 1;
        this.swaySpeed = 2; // units per second
        this.controlMode = 'tap'; // 'tap' or 'drag'

        // Touch/mouse tracking
        this.isDragging = false;
        this.dragStartX = 0;
    }

    init() {
        console.log('Initializing Classic Stack scene...');

        // Clear scene
        this.gameEngine.clearScene();

        // Set up game environment
        this.createGround();
        this.createBasePancake();

        // Set up input handlers
        this.setupInputHandlers();

        // Start game
        this.isPlaying = true;
        this.spawnNewPancake();

        // Start update loop
        this.update();
    }

    createGround() {
        const { mesh, body } = this.gameEngine.createGround(12, 0.5, 12);
        body.position.y = -0.25;
        mesh.position.copy(body.position);

        this.ground = this.gameEngine.addPhysicsBody(mesh, body);
    }

    createBasePancake() {
        // First pancake is static to provide a stable base
        const { mesh, body } = this.gameEngine.createPancake(this.pancakeRadius, this.pancakeHeight);
        body.position.y = this.pancakeHeight / 2;
        mesh.position.copy(body.position);
        body.mass = 0;
        body.type = CANNON.Body.STATIC;

        this.gameEngine.addPhysicsBody(mesh, body);
        this.stackedPancakes.push({ mesh, body });
        this.lastStackHeight = this.pancakeHeight;
    }

    spawnNewPancake() {
        if (!this.isPlaying) return;

        const { mesh, body } = this.gameEngine.createPancake(this.pancakeRadius, this.pancakeHeight);

        // Start high above the stack
        body.position.set(0, this.lastStackHeight + 8, 0);
        mesh.position.copy(body.position);

        // Make it kinematic (controlled by code, not physics) until dropped
        body.mass = 0;
        body.type = CANNON.Body.KINEMATIC;

        this.currentPancake = this.gameEngine.addPhysicsBody(mesh, body);
        this.swayPosition = 0;
    }

    setupInputHandlers() {
        // Mouse/touch input for dropping pancakes
        this.dropHandler = (e) => {
            console.log('Click detected!', { isPlaying: this.isPlaying, currentPancake: !!this.currentPancake, isCollapsing: this.isCollapsing });
            if (!this.isPlaying || !this.currentPancake || this.isCollapsing) return;

            if (this.controlMode === 'tap') {
                this.dropPancake();
            }
        };

        // Touch start for drag mode
        this.touchStartHandler = (e) => {
            if (!this.isPlaying || !this.currentPancake || this.isCollapsing) return;

            if (this.controlMode === 'drag') {
                this.isDragging = true;
                const touch = e.touches ? e.touches[0] : e;
                this.dragStartX = touch.clientX;
            }
        };

        // Touch move for drag mode
        this.touchMoveHandler = (e) => {
            if (!this.isDragging || !this.currentPancake) return;

            const touch = e.touches ? e.touches[0] : e;
            const deltaX = touch.clientX - this.dragStartX;

            // Convert screen space to world space
            this.swayPosition = (deltaX / window.innerWidth) * 10;
            this.swayPosition = Math.max(-4, Math.min(4, this.swayPosition)); // Clamp
        };

        // Touch end for drag mode
        this.touchEndHandler = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.dropPancake();
            }
        };

        // Add event listeners
        const canvas = this.gameEngine.renderer.domElement;
        canvas.addEventListener('click', this.dropHandler);
        canvas.addEventListener('touchstart', this.touchStartHandler);
        canvas.addEventListener('touchmove', this.touchMoveHandler);
        canvas.addEventListener('touchend', this.touchEndHandler);
        canvas.addEventListener('mousedown', this.touchStartHandler);
        canvas.addEventListener('mousemove', this.touchMoveHandler);
        canvas.addEventListener('mouseup', this.touchEndHandler);
    }

    removeInputHandlers() {
        const canvas = this.gameEngine.renderer.domElement;
        canvas.removeEventListener('click', this.dropHandler);
        canvas.removeEventListener('touchstart', this.touchStartHandler);
        canvas.removeEventListener('touchmove', this.touchMoveHandler);
        canvas.removeEventListener('touchend', this.touchEndHandler);
        canvas.removeEventListener('mousedown', this.touchStartHandler);
        canvas.removeEventListener('mousemove', this.touchMoveHandler);
        canvas.removeEventListener('mouseup', this.touchEndHandler);
    }

    dropPancake() {
        if (!this.currentPancake) return;

        console.log('Dropping pancake!');
        const { body } = this.currentPancake;

        // Convert to dynamic physics object
        body.type = CANNON.Body.DYNAMIC;
        body.mass = 1;
        body.updateMassProperties();
        body.wakeUp();
        body.velocity.set(0, -5, 0); // Give it some downward velocity

        // Add to stacked pancakes
        this.stackedPancakes.push(this.currentPancake);
        this.currentPancake = null;

        // Increment pancake count
        this.pancakeCount++;

        // Spawn next pancake after a delay
        setTimeout(() => {
            if (this.isPlaying) {
                this.checkPancakeLanded();
            }
        }, 500);
    }

    checkPancakeLanded() {
        // Check if the last dropped pancake has landed and settled
        const lastPancake = this.stackedPancakes[this.stackedPancakes.length - 1];

        if (lastPancake && lastPancake.body) {
            const velocity = lastPancake.body.velocity.length();

            if (velocity < 0.5) {
                // Pancake has settled
                this.onPancakeLanded(lastPancake);

                // Check if stack is stable
                if (!this.checkStackStability()) {
                    this.triggerCollapse();
                } else {
                    this.spawnNewPancake();
                }
            } else {
                // Keep checking
                setTimeout(() => this.checkPancakeLanded(), 100);
            }
        }
    }

    onPancakeLanded(pancake) {
        // Calculate placement quality
        const offsetFromCenter = Math.abs(pancake.body.position.x) + Math.abs(pancake.body.position.z);
        const isPerfectPlacement = offsetFromCenter < 0.3;

        // Update score
        let points = 10;

        if (isPerfectPlacement) {
            points += 5;
            this.consecutivePerfectPlacements++;

            // Update multiplier
            this.scoreMultiplier = 1 + Math.min(this.consecutivePerfectPlacements * 0.5, 2);
        } else {
            this.consecutivePerfectPlacements = 0;
            this.scoreMultiplier = 1;
        }

        // Apply multiplier
        points = Math.floor(points * this.scoreMultiplier);

        // Height bonus every 10 pancakes
        if (this.pancakeCount % 10 === 0) {
            points += 50;
        }

        this.score += points;
        this.gameManager.updateScore(this.pancakeCount);

        // Update stack height
        this.lastStackHeight = pancake.body.position.y + this.pancakeHeight / 2;
    }

    checkStackStability() {
        // Calculate center of mass and tilt angle
        let totalMass = 0;
        let centerOfMass = new CANNON.Vec3(0, 0, 0);

        this.stackedPancakes.forEach(({ body }) => {
            if (body.mass > 0) {
                totalMass += body.mass;
                centerOfMass.x += body.position.x * body.mass;
                centerOfMass.y += body.position.y * body.mass;
                centerOfMass.z += body.position.z * body.mass;
            }
        });

        if (totalMass > 0) {
            centerOfMass.x /= totalMass;
            centerOfMass.y /= totalMass;
            centerOfMass.z /= totalMass;
        }

        // Calculate tilt (horizontal offset from base)
        const horizontalOffset = Math.sqrt(centerOfMass.x ** 2 + centerOfMass.z ** 2);
        this.wobbleAngle = horizontalOffset;

        // Check if exceeds collapse threshold
        return horizontalOffset < this.collapseThreshold;
    }

    triggerCollapse() {
        console.log('Stack collapsed!');
        this.isCollapsing = true;
        this.isPlaying = false;

        // Make all pancakes dynamic so they fall
        this.stackedPancakes.forEach(({ body }) => {
            if (body.type === CANNON.Body.STATIC) {
                body.type = CANNON.Body.DYNAMIC;
                body.mass = 1;
            }

            // Add some random impulse for dramatic effect
            const randomImpulse = new CANNON.Vec3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            body.applyImpulse(randomImpulse, body.position);
        });

        // Trigger game over
        this.gameManager.onGameOver(this.score, this.pancakeCount);
    }

    update() {
        if (!this.isPlaying) return;

        // Update current pancake sway (if in tap mode)
        if (this.currentPancake && this.controlMode === 'tap' && !this.isDragging) {
            this.swayPosition += this.swaySpeed * this.swayDirection * (1 / 60);

            // Bounce at edges
            if (Math.abs(this.swayPosition) > 3) {
                this.swayDirection *= -1;
            }
        }

        // Update current pancake position
        if (this.currentPancake) {
            this.currentPancake.body.position.x = this.swayPosition;
            this.currentPancake.mesh.position.copy(this.currentPancake.body.position);
        }

        // Continue update loop
        requestAnimationFrame(() => this.update());
    }

    destroy() {
        console.log('Destroying Classic Stack scene...');
        this.isPlaying = false;
        this.removeInputHandlers();

        // Clean up will be handled by game engine
        this.stackedPancakes = [];
        this.currentPancake = null;
    }
}

export default ClassicStackScene;
