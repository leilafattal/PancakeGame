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
        this.collapseThreshold = 0.8; // More forgiving - about 2/3 of pancake radius
        this.isCollapsing = false;

        // Input
        this.swayPosition = 0;
        this.swayDirection = 1;
        this.swaySpeed = 2; // units per second
        this.controlMode = 'tap'; // 'tap' or 'drag'

        // Touch/mouse tracking
        this.isDragging = false;
        this.dragStartX = 0;

        // Drop line indicator
        this.dropLine = null;
        this.dropLineHeight = 3; // Initial height above stack

        // Walls
        this.walls = [];
        this.wallBounce = 0.8; // How bouncy the walls are (0-1)
    }

    init() {
        console.log('Initializing Classic Stack scene...');

        // Clear scene
        this.gameEngine.clearScene();

        // Set up game environment
        this.createGround();
        this.createWalls();
        this.createBasePancake();
        this.createDropLine();

        // Set up input handlers
        this.setupInputHandlers();

        // Start game
        this.isPlaying = true;
        this.spawnNewPancake();

        // Start update loop
        this.update();
    }

    createDropLine() {
        // Create a red line to show where pancakes drop from
        const lineWidth = 16; // Wide enough to span the wider play area
        const lineGeometry = new THREE.BoxGeometry(lineWidth, 0.05, 0.1);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        this.dropLine = new THREE.Mesh(lineGeometry, lineMaterial);
        this.dropLine.position.set(0, this.lastStackHeight + this.dropLineHeight, 0);
        this.gameEngine.scene.add(this.dropLine);
    }

    updateDropLinePosition() {
        if (this.dropLine) {
            // Move drop line up as stack grows
            this.dropLine.position.y = this.lastStackHeight + this.dropLineHeight;
        }
    }

    createGround() {
        const { mesh, body } = this.gameEngine.createGround(12, 0.5, 12);
        body.position.y = -0.25;
        mesh.position.copy(body.position);

        this.ground = this.gameEngine.addPhysicsBody(mesh, body);
    }

    createWalls() {
        // Create bouncy walls on left and right sides
        const wallHeight = 30; // Tall enough for high stacks
        const wallThickness = 0.5;
        const wallDepth = 12;
        const wallDistance = 8; // Distance from center - wide enough to not be too protective

        // Bouncy wall material
        const wallPhysicsMaterial = new CANNON.Material({
            friction: 0.1,
            restitution: this.wallBounce // Bounciness
        });

        // Left wall
        const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallDepth);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            transparent: true,
            opacity: 0.3
        });
        const leftWallMesh = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWallMesh.position.set(-wallDistance, wallHeight / 2, 0);
        this.gameEngine.scene.add(leftWallMesh);

        const leftWallShape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, wallDepth / 2));
        const leftWallBody = new CANNON.Body({
            mass: 0, // Static
            shape: leftWallShape,
            material: wallPhysicsMaterial
        });
        leftWallBody.position.copy(leftWallMesh.position);
        this.gameEngine.physicsWorld.addBody(leftWallBody);
        this.walls.push({ mesh: leftWallMesh, body: leftWallBody });

        // Right wall
        const rightWallMesh = new THREE.Mesh(leftWallGeometry, wallMaterial);
        rightWallMesh.position.set(wallDistance, wallHeight / 2, 0);
        this.gameEngine.scene.add(rightWallMesh);

        const rightWallBody = new CANNON.Body({
            mass: 0,
            shape: leftWallShape,
            material: wallPhysicsMaterial
        });
        rightWallBody.position.copy(rightWallMesh.position);
        this.gameEngine.physicsWorld.addBody(rightWallBody);
        this.walls.push({ mesh: rightWallMesh, body: rightWallBody });

        // Create contact material for pancake-wall collisions
        const pancakeMaterial = new CANNON.Material();
        const pancakeWallContact = new CANNON.ContactMaterial(pancakeMaterial, wallPhysicsMaterial, {
            friction: 0.1,
            restitution: this.wallBounce
        });
        this.gameEngine.physicsWorld.addContactMaterial(pancakeWallContact);
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

        // Update drop line position first
        this.updateDropLinePosition();

        const { mesh, body } = this.gameEngine.createPancake(this.pancakeRadius, this.pancakeHeight);

        // Start at the drop line height
        const spawnHeight = this.lastStackHeight + this.dropLineHeight;
        body.position.set(0, spawnHeight, 0);
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
            this.swayPosition = (deltaX / window.innerWidth) * 14;
            this.swayPosition = Math.max(-7, Math.min(7, this.swayPosition)); // Clamp to wall range
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

        // Calculate horizontal velocity based on sway direction and speed
        const horizontalVelocity = this.swaySpeed * this.swayDirection * 1.5;

        // Convert to dynamic physics object
        body.type = CANNON.Body.DYNAMIC;
        body.mass = 1;
        body.updateMassProperties();
        body.wakeUp();
        // Conserve horizontal momentum - pancake drifts in the direction it was moving
        body.velocity.set(horizontalVelocity, -5, 0);

        // Add to stacked pancakes
        this.stackedPancakes.push(this.currentPancake);
        this.currentPancake = null;

        // Increment pancake count
        this.pancakeCount++;

        // Spawn next pancake after a delay
        setTimeout(() => {
            if (this.isPlaying && !this.isCollapsing) {
                this.checkPancakeLanded();
            }
        }, 500);
    }

    checkPancakeLanded() {
        // Stop if game is over
        if (!this.isPlaying || this.isCollapsing) return;

        // Check if the last dropped pancake has landed and settled
        const lastPancake = this.stackedPancakes[this.stackedPancakes.length - 1];

        if (lastPancake && lastPancake.body) {
            const velocity = lastPancake.body.velocity.length();

            if (velocity < 0.5) {
                // Pancake has settled
                this.onPancakeLanded(lastPancake);

                // Check if stack is stable (only if not already collapsing)
                if (!this.isCollapsing && !this.checkStackStability()) {
                    this.triggerCollapse();
                } else if (!this.isCollapsing) {
                    this.spawnNewPancake();
                }
            } else {
                // Keep checking (only if game is still playing)
                if (this.isPlaying && !this.isCollapsing) {
                    setTimeout(() => this.checkPancakeLanded(), 100);
                }
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
        // Stack is stable as long as pancakes haven't fallen to the ground
        // Ground collision is checked continuously in update(), so here we just
        // verify the stack hasn't drifted too far horizontally

        // Check if any pancake is way off to the side (sliding off)
        for (let i = 1; i < this.stackedPancakes.length; i++) {
            const { body } = this.stackedPancakes[i];
            const horizontalOffset = Math.sqrt(body.position.x ** 2 + body.position.z ** 2);

            // If pancake center is more than 2x radius from center, it's falling off
            if (horizontalOffset > this.pancakeRadius * 2) {
                return false;
            }
        }

        // Stack is stable - pancakes can be off-center as long as they don't fall
        return true;
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

        // Check if any pancake has fallen to the ground (touched the table)
        if (this.checkForGroundCollision()) {
            this.triggerCollapse();
            return;
        }

        // Update current pancake sway (if in tap mode)
        if (this.currentPancake && this.controlMode === 'tap' && !this.isDragging) {
            this.swayPosition += this.swaySpeed * this.swayDirection * (1 / 60);

            // Bounce at edges (wider range to match wider walls)
            if (Math.abs(this.swayPosition) > 6) {
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

    checkForGroundCollision() {
        // Check if any stacked pancake (except the base) has fallen to the ground
        // Ground surface is at y = 0, so a pancake lying flat on the table
        // would have its center at pancakeHeight/2 (0.125)
        // We detect collision if pancake is at or near table level
        const groundLevel = this.pancakeHeight / 2 + 0.1; // Slightly above table surface

        for (let i = 1; i < this.stackedPancakes.length; i++) {
            const { body } = this.stackedPancakes[i];
            // Check if pancake is at table level (touching or very close to ground)
            if (body.position.y <= groundLevel) {
                console.log('Pancake touched the ground!', body.position.y);
                return true;
            }
        }
        return false;
    }

    destroy() {
        console.log('Destroying Classic Stack scene...');
        this.isPlaying = false;
        this.removeInputHandlers();

        // Remove drop line
        if (this.dropLine) {
            this.gameEngine.scene.remove(this.dropLine);
            this.dropLine = null;
        }

        // Remove walls
        this.walls.forEach(({ mesh, body }) => {
            this.gameEngine.scene.remove(mesh);
            this.gameEngine.physicsWorld.removeBody(body);
        });
        this.walls = [];

        // Clean up will be handled by game engine
        this.stackedPancakes = [];
        this.currentPancake = null;
    }
}

export default ClassicStackScene;
