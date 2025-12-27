import * as THREE from 'three';

class DecorateScene {
    constructor(gameEngine, gameManager) {
        this.gameEngine = gameEngine;
        this.gameManager = gameManager;

        // Scene elements
        this.pancakeStack = null;
        this.plate = null;
        this.table = null;

        // Current decoration tool
        this.currentTool = 'cream'; // 'sprinkles', 'cream', 'syrup'

        // Decoration objects
        this.decorations = [];

        // Rotation controls
        this.isDragging = false;
        this.previousMouseX = 0;
        this.rotationVelocity = 0;

        // Animation frame
        this.animationId = null;
    }

    init() {
        console.log('Initializing Decorate scene...');

        // Clear scene
        this.gameEngine.clearScene();

        // Create environment
        this.createTable();
        this.createPlate();
        this.createPancakeStack();
        this.createDecorationUI();
        this.setupInputHandlers();

        // Adjust camera for better decoration view
        this.gameEngine.camera.position.set(0, 5, 7);
        this.gameEngine.camera.lookAt(0, 1.5, 0);

        // Start animation loop
        this.animate();
    }

    createTable() {
        // Create a nice wooden table surface
        const tableGeometry = new THREE.CylinderGeometry(4, 4, 0.3, 32);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = -0.15;
        this.table.receiveShadow = true;
        this.gameEngine.scene.add(this.table);
    }

    createPlate() {
        // Main plate
        const plateGeometry = new THREE.CylinderGeometry(2.2, 2, 0.12, 32);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0xFAFAFA,
            roughness: 0.2,
            metalness: 0.3
        });
        this.plate = new THREE.Mesh(plateGeometry, plateMaterial);
        this.plate.position.y = 0.06;
        this.plate.receiveShadow = true;
        this.plate.castShadow = true;
        this.gameEngine.scene.add(this.plate);

        // Plate rim
        const rimGeometry = new THREE.TorusGeometry(2.1, 0.08, 8, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.3,
            metalness: 0.4
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.12;
        this.gameEngine.scene.add(rim);
    }

    createPancakeStack() {
        // Create a group to hold the pancake stack for easy rotation
        this.pancakeStack = new THREE.Group();

        // Create 3 stacked pancakes
        const pancakeColors = [0xFFD166, 0xF4C054, 0xE8B445];

        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.CylinderGeometry(1.4 - i * 0.05, 1.5 - i * 0.05, 0.22, 32);
            const material = new THREE.MeshStandardMaterial({
                color: pancakeColors[i],
                roughness: 0.7,
                metalness: 0.1
            });
            const pancake = new THREE.Mesh(geometry, material);
            pancake.position.y = 0.25 + i * 0.22;
            pancake.castShadow = true;
            pancake.receiveShadow = true;
            this.pancakeStack.add(pancake);
        }

        // Add a pat of butter on top
        const butterGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.4);
        const butterMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFEB99,
            roughness: 0.4,
            metalness: 0.2
        });
        const butter = new THREE.Mesh(butterGeometry, butterMaterial);
        butter.position.y = 0.25 + 3 * 0.22 + 0.08;
        butter.rotation.y = Math.PI / 6;
        butter.castShadow = true;
        this.pancakeStack.add(butter);

        this.gameEngine.scene.add(this.pancakeStack);
    }

    createDecorationUI() {
        // Create UI overlay for decoration tools
        const existingUI = document.getElementById('decorate-ui');
        if (existingUI) existingUI.remove();

        const decorateUI = document.createElement('div');
        decorateUI.id = 'decorate-ui';
        decorateUI.innerHTML = `
            <style>
                #decorate-ui {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 15px;
                    z-index: 200;
                    pointer-events: auto;
                }
                .tool-btn {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    border: 4px solid #8B4513;
                    background: linear-gradient(135deg, #FFF8E7 0%, #FFE5B4 100%);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: all 0.2s ease;
                }
                .tool-btn:active {
                    transform: scale(0.9);
                }
                .tool-btn.active {
                    border-color: #FFD166;
                    box-shadow: 0 0 20px rgba(255, 209, 102, 0.8);
                    transform: scale(1.1);
                }
                .tool-btn span {
                    font-size: 10px;
                    color: #8B4513;
                    margin-top: 2px;
                    font-weight: bold;
                }
                #done-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #FFD166 0%, #FFB627 100%);
                    border: 3px solid #8B4513;
                    border-radius: 20px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #8B4513;
                    cursor: pointer;
                    z-index: 200;
                    pointer-events: auto;
                }
                #done-btn:active {
                    transform: scale(0.95);
                }
                #rotate-hint {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: rgba(139, 69, 19, 0.6);
                    font-size: 16px;
                    pointer-events: none;
                    text-align: center;
                    opacity: 1;
                    transition: opacity 1s;
                }
            </style>
            <button class="tool-btn active" data-tool="cream">🍦<span>Cream</span></button>
            <button class="tool-btn" data-tool="syrup">🍯<span>Syrup</span></button>
            <button class="tool-btn" data-tool="sprinkles">✨<span>Sprinkle</span></button>
        `;

        const doneBtn = document.createElement('button');
        doneBtn.id = 'done-btn';
        doneBtn.textContent = 'DONE';
        doneBtn.onclick = () => this.gameManager.showMenu();

        const rotateHint = document.createElement('div');
        rotateHint.id = 'rotate-hint';
        rotateHint.innerHTML = 'Drag to rotate / Tap to decorate';

        document.getElementById('ui-overlay').appendChild(decorateUI);
        document.getElementById('ui-overlay').appendChild(doneBtn);
        document.getElementById('ui-overlay').appendChild(rotateHint);

        // Hide hint after 3 seconds
        setTimeout(() => {
            rotateHint.style.opacity = '0';
            setTimeout(() => rotateHint.remove(), 1000);
        }, 3000);

        // Tool selection
        decorateUI.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                decorateUI.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
    }

    setupInputHandlers() {
        const canvas = this.gameEngine.renderer.domElement;

        // Track drag for rotation vs tap for decoration
        let startX = 0;
        let startY = 0;
        let hasDragged = false;

        this.pointerDownHandler = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            this.previousMouseX = startX;
            this.isDragging = true;
            hasDragged = false;
        };

        this.pointerMoveHandler = (e) => {
            if (!this.isDragging) return;

            const touch = e.touches ? e.touches[0] : e;
            const deltaX = touch.clientX - this.previousMouseX;

            // If moved significantly, it's a drag
            if (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10) {
                hasDragged = true;
            }

            // Rotate pancake stack
            this.rotationVelocity = deltaX * 0.01;
            this.pancakeStack.rotation.y += this.rotationVelocity;

            // Rotate decorations with the stack
            this.decorations.forEach(dec => {
                if (dec.userData && dec.userData.attachedToStack) {
                    const x = dec.position.x;
                    const z = dec.position.z;
                    const cos = Math.cos(this.rotationVelocity);
                    const sin = Math.sin(this.rotationVelocity);
                    dec.position.x = x * cos - z * sin;
                    dec.position.z = x * sin + z * cos;
                }
            });

            this.previousMouseX = touch.clientX;
        };

        this.pointerUpHandler = (e) => {
            this.isDragging = false;

            // If it was a tap (not a drag), apply decoration
            if (!hasDragged) {
                const touch = e.changedTouches ? e.changedTouches[0] : e;
                this.handleTap(touch.clientX, touch.clientY);
            }
        };

        canvas.addEventListener('mousedown', this.pointerDownHandler);
        canvas.addEventListener('mousemove', this.pointerMoveHandler);
        canvas.addEventListener('mouseup', this.pointerUpHandler);
        canvas.addEventListener('touchstart', this.pointerDownHandler);
        canvas.addEventListener('touchmove', this.pointerMoveHandler);
        canvas.addEventListener('touchend', this.pointerUpHandler);

        // Keyboard shortcuts
        this.keyHandler = (e) => {
            if (e.key === '1') this.selectTool('cream');
            if (e.key === '2') this.selectTool('syrup');
            if (e.key === '3') this.selectTool('sprinkles');
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    selectTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    }

    handleTap(clientX, clientY) {
        const rect = this.gameEngine.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast to find position on pancake
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.gameEngine.camera);

        const intersects = raycaster.intersectObjects(this.pancakeStack.children);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.startPourAnimation(point);
        }
    }

    startPourAnimation(targetPoint) {
        switch (this.currentTool) {
            case 'cream':
                this.pourWhippedCream(targetPoint);
                break;
            case 'syrup':
                this.pourSyrup(targetPoint);
                break;
            case 'sprinkles':
                this.dropSprinkles(targetPoint);
                break;
        }
    }

    pourWhippedCream(targetPoint) {
        // Create whipped cream pour from above
        const startY = 4;
        const particles = [];
        const numParticles = 15;

        for (let i = 0; i < numParticles; i++) {
            const size = 0.08 + Math.random() * 0.06;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: 0xFFFEFA,
                roughness: 0.9,
                metalness: 0.0
            });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.set(
                targetPoint.x + (Math.random() - 0.5) * 0.1,
                startY + i * 0.1,
                targetPoint.z + (Math.random() - 0.5) * 0.1
            );

            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    -0.15 - Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.02
                ),
                targetY: targetPoint.y + 0.1 + Math.random() * 0.15,
                landed: false,
                delay: i * 30
            };

            this.gameEngine.scene.add(particle);
            particles.push(particle);
        }

        const animateCream = () => {
            let allLanded = true;

            particles.forEach((p) => {
                if (p.userData.delay > 0) {
                    p.userData.delay--;
                    p.visible = false;
                    allLanded = false;
                    return;
                }
                p.visible = true;

                if (!p.userData.landed) {
                    allLanded = false;
                    p.userData.velocity.y -= 0.008;
                    p.position.add(p.userData.velocity);

                    if (p.position.y <= p.userData.targetY) {
                        p.position.y = p.userData.targetY;
                        p.userData.landed = true;
                        p.scale.set(1.3, 0.6, 1.3);
                        p.userData.attachedToStack = true;
                        this.decorations.push(p);
                    }
                }
            });

            if (!allLanded) {
                requestAnimationFrame(animateCream);
            } else {
                this.createCreamDollop(targetPoint);
            }
        };

        animateCream();
    }

    createCreamDollop(position) {
        const group = new THREE.Group();

        const baseGeom = new THREE.SphereGeometry(0.25, 16, 16);
        const creamMat = new THREE.MeshStandardMaterial({
            color: 0xFFFEFA,
            roughness: 0.9,
            metalness: 0.0
        });
        const base = new THREE.Mesh(baseGeom, creamMat);
        base.scale.set(1, 0.5, 1);
        base.position.y = 0;
        group.add(base);

        const midGeom = new THREE.SphereGeometry(0.18, 16, 16);
        const mid = new THREE.Mesh(midGeom, creamMat);
        mid.scale.set(1, 0.7, 1);
        mid.position.y = 0.12;
        group.add(mid);

        const topGeom = new THREE.ConeGeometry(0.1, 0.2, 16);
        const top = new THREE.Mesh(topGeom, creamMat);
        top.position.y = 0.28;
        top.rotation.z = Math.PI * 0.05;
        group.add(top);

        group.position.set(position.x, position.y + 0.05, position.z);
        group.userData.attachedToStack = true;

        this.gameEngine.scene.add(group);
        this.decorations.push(group);

        // Scale animation
        group.scale.set(0, 0, 0);
        this.animateScale(group, { x: 1, y: 1, z: 1 }, 300);
    }

    pourSyrup(targetPoint) {
        const startY = 4;
        const streamLength = 20;
        const particles = [];

        for (let i = 0; i < streamLength; i++) {
            const geometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.03, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: 0xD2691E,
                roughness: 0.1,
                metalness: 0.7,
                transparent: true,
                opacity: 0.9
            });
            const drop = new THREE.Mesh(geometry, material);

            drop.position.set(targetPoint.x, startY + i * 0.15, targetPoint.z);
            drop.userData = {
                velocity: new THREE.Vector3(0, -0.2, 0),
                landed: false,
                delay: i * 25,
                stretch: 1
            };

            this.gameEngine.scene.add(drop);
            particles.push(drop);
        }

        const animateSyrup = () => {
            let allLanded = true;

            particles.forEach((p) => {
                if (p.userData.delay > 0) {
                    p.userData.delay--;
                    p.visible = false;
                    allLanded = false;
                    return;
                }
                p.visible = true;

                if (!p.userData.landed) {
                    allLanded = false;
                    p.userData.velocity.y -= 0.012;
                    p.position.add(p.userData.velocity);
                    p.userData.stretch = Math.min(p.userData.stretch + 0.05, 2);
                    p.scale.set(0.8, p.userData.stretch, 0.8);

                    if (p.position.y <= targetPoint.y + 0.1) {
                        p.position.y = targetPoint.y + 0.02;
                        p.userData.landed = true;
                        p.scale.set(1.5, 0.3, 1.5);
                        p.userData.attachedToStack = true;
                        this.decorations.push(p);
                    }
                }
            });

            if (!allLanded) {
                requestAnimationFrame(animateSyrup);
            } else {
                this.createSyrupPuddle(targetPoint);
            }
        };

        animateSyrup();
    }

    createSyrupPuddle(position) {
        const puddleGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.05, 16);
        const puddleMat = new THREE.MeshStandardMaterial({
            color: 0xC06000,
            roughness: 0.05,
            metalness: 0.8,
            transparent: true,
            opacity: 0.85
        });
        const puddle = new THREE.Mesh(puddleGeom, puddleMat);
        puddle.position.set(position.x, position.y + 0.03, position.z);
        puddle.userData.attachedToStack = true;

        this.gameEngine.scene.add(puddle);
        this.decorations.push(puddle);

        // Drip effect
        this.createSyrupDrip(position);

        puddle.scale.set(0.5, 1, 0.5);
        this.animateScale(puddle, { x: 1.2, y: 1, z: 1.2 }, 400);
    }

    createSyrupDrip(position) {
        const numPoints = 8;
        const startAngle = Math.atan2(position.z, position.x);

        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const y = position.y - t * 0.8;
            const radius = 1.4 + t * 0.3;
            const x = Math.cos(startAngle) * radius;
            const z = Math.sin(startAngle) * radius;

            const dropGeom = new THREE.SphereGeometry(0.04 - t * 0.015, 8, 8);
            const dropMat = new THREE.MeshStandardMaterial({
                color: 0xC06000,
                roughness: 0.05,
                metalness: 0.8,
                transparent: true,
                opacity: 0.85
            });
            const drop = new THREE.Mesh(dropGeom, dropMat);
            drop.position.set(x, y, z);
            drop.scale.set(1, 1.5, 1);
            drop.userData.attachedToStack = true;

            drop.visible = false;
            setTimeout(() => {
                drop.visible = true;
            }, i * 80);

            this.gameEngine.scene.add(drop);
            this.decorations.push(drop);
        }
    }

    dropSprinkles(targetPoint) {
        const colors = [0xFF6B9D, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xFF8C42, 0xA855F7];
        const numSprinkles = 25;
        const startY = 3.5;
        const particles = [];

        for (let i = 0; i < numSprinkles; i++) {
            const geometry = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 6);
            const material = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.5,
                metalness: 0.3
            });
            const sprinkle = new THREE.Mesh(geometry, material);

            const spread = 0.6;
            sprinkle.position.set(
                targetPoint.x + (Math.random() - 0.5) * spread,
                startY + Math.random() * 0.5,
                targetPoint.z + (Math.random() - 0.5) * spread
            );

            sprinkle.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            sprinkle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.03,
                    -0.05 - Math.random() * 0.03,
                    (Math.random() - 0.5) * 0.03
                ),
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                ),
                landed: false,
                delay: Math.floor(Math.random() * 15),
                bounce: 2
            };

            this.gameEngine.scene.add(sprinkle);
            particles.push(sprinkle);
        }

        const animateSprinkles = () => {
            let allSettled = true;

            particles.forEach((p) => {
                if (p.userData.delay > 0) {
                    p.userData.delay--;
                    p.visible = false;
                    allSettled = false;
                    return;
                }
                p.visible = true;

                if (p.userData.bounce > 0) {
                    allSettled = false;
                    p.userData.velocity.y -= 0.004;
                    p.position.add(p.userData.velocity);
                    p.rotation.x += p.userData.rotationSpeed.x;
                    p.rotation.y += p.userData.rotationSpeed.y;
                    p.rotation.z += p.userData.rotationSpeed.z;

                    const distFromCenter = Math.sqrt(p.position.x ** 2 + p.position.z ** 2);
                    const landingY = distFromCenter < 1.5 ? targetPoint.y + 0.15 : 0.15;

                    if (p.position.y <= landingY) {
                        p.position.y = landingY;
                        p.userData.bounce--;

                        if (p.userData.bounce > 0) {
                            p.userData.velocity.y = 0.04 * p.userData.bounce;
                            p.userData.velocity.x *= 0.5;
                            p.userData.velocity.z *= 0.5;
                            p.userData.rotationSpeed.multiplyScalar(0.7);
                        } else {
                            p.userData.attachedToStack = distFromCenter < 1.5;
                            this.decorations.push(p);
                        }
                    }
                }
            });

            if (!allSettled) {
                requestAnimationFrame(animateSprinkles);
            }
        };

        this.createSparkleEffect(targetPoint);
        animateSprinkles();
    }

    createSparkleEffect(position) {
        const sparkles = [];

        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.OctahedronGeometry(0.05);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 1
            });
            const sparkle = new THREE.Mesh(geometry, material);

            const angle = (i / 8) * Math.PI * 2;
            sparkle.position.set(
                position.x + Math.cos(angle) * 0.3,
                position.y + 0.5,
                position.z + Math.sin(angle) * 0.3
            );

            sparkle.userData = { angle, startY: position.y + 0.5, life: 1 };

            this.gameEngine.scene.add(sparkle);
            sparkles.push(sparkle);
        }

        const animateSparkles = () => {
            let alive = false;

            sparkles.forEach((s) => {
                if (s.userData.life > 0) {
                    alive = true;
                    s.userData.life -= 0.03;

                    const expand = 1 + (1 - s.userData.life) * 0.5;
                    s.position.x = position.x + Math.cos(s.userData.angle) * 0.3 * expand;
                    s.position.z = position.z + Math.sin(s.userData.angle) * 0.3 * expand;
                    s.position.y = s.userData.startY + (1 - s.userData.life) * 0.3;

                    s.material.opacity = s.userData.life;
                    s.rotation.y += 0.1;

                    if (s.userData.life <= 0) {
                        this.gameEngine.scene.remove(s);
                    }
                }
            });

            if (alive) {
                requestAnimationFrame(animateSparkles);
            }
        };

        animateSparkles();
    }

    animateScale(object, target, duration) {
        const start = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            let t = Math.min(elapsed / duration, 1);

            // Bounce easing with overshoot
            if (t < 0.5) {
                t = 4 * t * t * t;
            } else {
                t = 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            if (t > 0.7 && t < 1) {
                t = 1 + Math.sin((t - 0.7) * Math.PI * 3.33) * 0.1;
            }

            object.scale.set(
                start.x + (target.x - start.x) * t,
                start.y + (target.y - start.y) * t,
                start.z + (target.z - start.z) * t
            );

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animate() {
        if (!this.pancakeStack) return;

        // Apply rotation momentum
        if (!this.isDragging && Math.abs(this.rotationVelocity) > 0.001) {
            this.rotationVelocity *= 0.95;
            this.pancakeStack.rotation.y += this.rotationVelocity;

            this.decorations.forEach(dec => {
                if (dec.userData && dec.userData.attachedToStack) {
                    const x = dec.position.x;
                    const z = dec.position.z;
                    const cos = Math.cos(this.rotationVelocity);
                    const sin = Math.sin(this.rotationVelocity);
                    dec.position.x = x * cos - z * sin;
                    dec.position.z = x * sin + z * cos;
                }
            });
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    removeInputHandlers() {
        const canvas = this.gameEngine.renderer.domElement;
        canvas.removeEventListener('mousedown', this.pointerDownHandler);
        canvas.removeEventListener('mousemove', this.pointerMoveHandler);
        canvas.removeEventListener('mouseup', this.pointerUpHandler);
        canvas.removeEventListener('touchstart', this.pointerDownHandler);
        canvas.removeEventListener('touchmove', this.pointerMoveHandler);
        canvas.removeEventListener('touchend', this.pointerUpHandler);
        window.removeEventListener('keydown', this.keyHandler);
    }

    destroy() {
        console.log('Destroying Decorate scene...');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.removeInputHandlers();

        // Remove UI
        const decorateUI = document.getElementById('decorate-ui');
        if (decorateUI) decorateUI.remove();
        const doneBtn = document.getElementById('done-btn');
        if (doneBtn) doneBtn.remove();
        const rotateHint = document.getElementById('rotate-hint');
        if (rotateHint) rotateHint.remove();

        // Remove decorations
        this.decorations.forEach(decoration => {
            this.gameEngine.scene.remove(decoration);
        });
        this.decorations = [];

        // Remove scene objects
        if (this.pancakeStack) this.gameEngine.scene.remove(this.pancakeStack);
        if (this.plate) this.gameEngine.scene.remove(this.plate);
        if (this.table) this.gameEngine.scene.remove(this.table);
    }
}

export default DecorateScene;
