import * as THREE from 'three';

class DecorateScene {
    constructor(gameEngine, gameManager) {
        this.gameEngine = gameEngine;
        this.gameManager = gameManager;

        // Scene elements
        this.pancake = null;
        this.plate = null;
        this.table = null;

        // Bottles
        this.bottles = {};
        this.bottleShelf = null;
        this.selectedBottle = null;
        this.currentTool = 'syrup';

        // Decoration objects
        this.decorations = [];

        // Rotation controls
        this.isDragging = false;
        this.previousMouseX = 0;
        this.rotationVelocity = 0;

        // Animation frame
        this.animationId = null;

        // Bottle pour animation
        this.isPouringAnimation = false;
    }

    init() {
        console.log('Initializing Decorate scene...');

        // Clear scene
        this.gameEngine.clearScene();

        // Create environment
        this.createTable();
        this.createPlate();
        this.createSinglePancake();
        this.createBottleShelf();
        this.createBottles();
        this.createDoneButton();
        this.setupInputHandlers();

        // Adjust camera for better decoration view
        this.gameEngine.camera.position.set(0, 6, 8);
        this.gameEngine.camera.lookAt(0, 1, 0);

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

    createSinglePancake() {
        // Create a single pancake with subtle texture
        const radius = 1.5;
        const height = 0.25;

        this.pancake = this.createSimplePancakeMesh(radius, height);
        this.pancake.position.y = 0.25;
        this.pancake.castShadow = true;
        this.pancake.receiveShadow = true;

        this.gameEngine.scene.add(this.pancake);
    }

    createSimplePancakeMesh(radius, height) {
        const segments = 48;
        const geometry = new THREE.CylinderGeometry(radius, radius * 1.02, height, segments, 1, false);

        // Slight vertex modifications for natural look
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
            const angle = Math.atan2(vertex.z, vertex.x);

            // Subtle irregular edges
            if (distFromCenter > radius * 0.5) {
                const edgeNoise = 0.02 * Math.sin(angle * 7) + 0.015 * Math.sin(angle * 11);
                const scaleFactor = 1 + edgeNoise * (distFromCenter / radius);
                vertex.x *= scaleFactor;
                vertex.z *= scaleFactor;
            }

            // Subtle dome on top
            if (vertex.y > 0) {
                const domeHeight = 0.01 * (1 - Math.pow(distFromCenter / radius, 2));
                vertex.y += domeHeight;
            }

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Simple pancake material with subtle texture
        const material = this.createSimplePancakeMaterial();

        return new THREE.Mesh(geometry, material);
    }

    createSimplePancakeMaterial() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base golden color
        ctx.fillStyle = '#E8B85C';
        ctx.fillRect(0, 0, 512, 512);

        const centerX = 256;
        const centerY = 256;

        // Subtle radial gradient for browning
        const gradient = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, 240);
        gradient.addColorStop(0, 'rgba(235, 195, 110, 0.6)');
        gradient.addColorStop(0.6, 'rgba(210, 160, 80, 0.5)');
        gradient.addColorStop(1, 'rgba(175, 130, 60, 0.7)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Subtle bubble marks
        ctx.fillStyle = 'rgba(160, 110, 50, 0.2)';
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 180 + 20;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            const bubbleRadius = Math.random() * 10 + 4;

            ctx.beginPath();
            ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Light noise
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 8;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);

        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.85,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
    }

    createBottleShelf() {
        // Create a wooden shelf/bar behind the plate to hold bottles
        const shelfGroup = new THREE.Group();

        // Main shelf board
        const shelfGeometry = new THREE.BoxGeometry(4, 0.15, 0.8);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x6B4423,
            roughness: 0.7,
            metalness: 0.1
        });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, 0.6, -3);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);

        // Back panel
        const backGeometry = new THREE.BoxGeometry(4.2, 1.5, 0.1);
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x5D3A1A,
            roughness: 0.8,
            metalness: 0.05
        });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.set(0, 1.2, -3.4);
        shelfGroup.add(back);

        this.bottleShelf = shelfGroup;
        this.gameEngine.scene.add(shelfGroup);
    }

    createBottles() {
        // Create 3D bottle models
        const bottlePositions = {
            syrup: { x: -1.2, y: 0.68, z: -3 },
            cream: { x: 0, y: 0.68, z: -3 },
            sprinkles: { x: 1.2, y: 0.68, z: -3 }
        };

        // Maple Syrup Bottle
        this.bottles.syrup = this.createSyrupBottle();
        this.bottles.syrup.position.set(bottlePositions.syrup.x, bottlePositions.syrup.y, bottlePositions.syrup.z);
        this.bottles.syrup.userData = { type: 'syrup', originalPos: { ...bottlePositions.syrup } };
        this.gameEngine.scene.add(this.bottles.syrup);

        // Whipped Cream Can
        this.bottles.cream = this.createCreamCan();
        this.bottles.cream.position.set(bottlePositions.cream.x, bottlePositions.cream.y, bottlePositions.cream.z);
        this.bottles.cream.userData = { type: 'cream', originalPos: { ...bottlePositions.cream } };
        this.gameEngine.scene.add(this.bottles.cream);

        // Sprinkle Shaker
        this.bottles.sprinkles = this.createSprinkleShaker();
        this.bottles.sprinkles.position.set(bottlePositions.sprinkles.x, bottlePositions.sprinkles.y, bottlePositions.sprinkles.z);
        this.bottles.sprinkles.userData = { type: 'sprinkles', originalPos: { ...bottlePositions.sprinkles } };
        this.gameEngine.scene.add(this.bottles.sprinkles);

        // Select syrup by default
        this.selectBottle('syrup');
    }

    createSyrupBottle() {
        const bottleGroup = new THREE.Group();

        // Bottle body (classic maple syrup bottle shape)
        const bodyGeometry = new THREE.CylinderGeometry(0.22, 0.28, 0.9, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.45;
        bottleGroup.add(body);

        // Syrup inside (visible through bottle)
        const syrupGeometry = new THREE.CylinderGeometry(0.18, 0.24, 0.7, 12);
        const syrupMaterial = new THREE.MeshStandardMaterial({
            color: 0xC06000,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const syrup = new THREE.Mesh(syrupGeometry, syrupMaterial);
        syrup.position.y = 0.4;
        bottleGroup.add(syrup);

        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.08, 0.15, 0.25, 12);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.y = 1.0;
        bottleGroup.add(neck);

        // Cap
        const capGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.3
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 1.18;
        bottleGroup.add(cap);

        // Label
        const labelGeometry = new THREE.CylinderGeometry(0.23, 0.27, 0.4, 12, 1, true);
        const labelMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFF8DC,
            roughness: 0.9,
            metalness: 0.0
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 0.45;
        bottleGroup.add(label);

        bottleGroup.castShadow = true;
        return bottleGroup;
    }

    createCreamCan() {
        const canGroup = new THREE.Group();

        // Can body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.3,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        canGroup.add(body);

        // Red stripe
        const stripeGeometry = new THREE.CylinderGeometry(0.205, 0.205, 0.3, 16, 1, true);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0xCC3333,
            roughness: 0.4,
            metalness: 0.3
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 0.5;
        canGroup.add(stripe);

        // Nozzle top
        const topGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.15, 16);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3,
            metalness: 0.4
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.05;
        canGroup.add(top);

        // Nozzle
        const nozzleGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.15, 8);
        const nozzleMaterial = new THREE.MeshStandardMaterial({
            color: 0xCC3333,
            roughness: 0.5,
            metalness: 0.2
        });
        const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle.position.set(0.1, 1.15, 0);
        nozzle.rotation.z = -Math.PI / 6;
        canGroup.add(nozzle);

        canGroup.castShadow = true;
        return canGroup;
    }

    createSprinkleShaker() {
        const shakerGroup = new THREE.Group();

        // Shaker body (jar shape)
        const bodyGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.35;
        shakerGroup.add(body);

        // Colorful sprinkles inside (visible through glass)
        const colors = [0xFF6B9D, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xFF8C42, 0xA855F7];
        for (let i = 0; i < 30; i++) {
            const sprinkleGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.04, 4);
            const sprinkleMat = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.5
            });
            const sprinkle = new THREE.Mesh(sprinkleGeom, sprinkleMat);

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 0.12;
            sprinkle.position.set(
                Math.cos(angle) * dist,
                0.15 + Math.random() * 0.35,
                Math.sin(angle) * dist
            );
            sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            shakerGroup.add(sprinkle);
        }

        // Metal lid with holes
        const lidGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.1, 12);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: 0xC0C0C0,
            roughness: 0.3,
            metalness: 0.8
        });
        const lid = new THREE.Mesh(lidGeometry, lidMaterial);
        lid.position.y = 0.75;
        shakerGroup.add(lid);

        // Holes in lid (decorative dots)
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const dist = i === 0 ? 0 : 0.08;
            const holeGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.11, 6);
            const holeMat = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.8
            });
            const hole = new THREE.Mesh(holeGeom, holeMat);
            hole.position.set(
                Math.cos(angle) * dist,
                0.75,
                Math.sin(angle) * dist
            );
            shakerGroup.add(hole);
        }

        shakerGroup.castShadow = true;
        return shakerGroup;
    }

    selectBottle(type) {
        // Reset all bottles
        Object.keys(this.bottles).forEach(key => {
            const bottle = this.bottles[key];
            const orig = bottle.userData.originalPos;
            bottle.position.set(orig.x, orig.y, orig.z);
            bottle.rotation.set(0, 0, 0);
            bottle.scale.set(1, 1, 1);
        });

        // Highlight selected bottle
        this.currentTool = type;
        this.selectedBottle = this.bottles[type];

        // Move selected bottle forward and scale up slightly
        this.selectedBottle.position.z += 0.3;
        this.selectedBottle.position.y += 0.1;
        this.selectedBottle.scale.set(1.15, 1.15, 1.15);
    }

    createDoneButton() {
        const existingUI = document.getElementById('decorate-ui');
        if (existingUI) existingUI.remove();

        const doneBtn = document.createElement('button');
        doneBtn.id = 'done-btn';
        doneBtn.textContent = 'DONE';
        doneBtn.style.cssText = `
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
        `;
        doneBtn.onclick = () => this.gameManager.showMenu();
        document.getElementById('ui-overlay').appendChild(doneBtn);

        // Hint text
        const hint = document.createElement('div');
        hint.id = 'rotate-hint';
        hint.innerHTML = 'Tap bottles to select • Drag to rotate • Tap pancake to pour';
        hint.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(139, 69, 19, 0.8);
            font-size: 14px;
            font-weight: bold;
            pointer-events: none;
            text-align: center;
            background: rgba(255, 248, 231, 0.8);
            padding: 10px 20px;
            border-radius: 20px;
            opacity: 1;
            transition: opacity 1s;
        `;
        document.getElementById('ui-overlay').appendChild(hint);

        // Fade hint after 4 seconds
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 1000);
        }, 4000);
    }

    setupInputHandlers() {
        const canvas = this.gameEngine.renderer.domElement;

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

            if (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10) {
                hasDragged = true;
            }

            // Rotate pancake
            this.rotationVelocity = deltaX * 0.01;
            if (this.pancake) {
                this.pancake.rotation.y += this.rotationVelocity;
            }

            // Rotate decorations with pancake
            this.decorations.forEach(dec => {
                if (dec.userData && dec.userData.attachedToPancake) {
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
            if (e.key === '1') this.selectBottle('syrup');
            if (e.key === '2') this.selectBottle('cream');
            if (e.key === '3') this.selectBottle('sprinkles');
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    handleTap(clientX, clientY) {
        const rect = this.gameEngine.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.gameEngine.camera);

        // Check if clicked on a bottle
        const bottleObjects = Object.values(this.bottles).flatMap(b => b.children);
        const bottleHits = raycaster.intersectObjects(bottleObjects, true);

        if (bottleHits.length > 0) {
            // Find which bottle was clicked
            for (const type of Object.keys(this.bottles)) {
                const bottle = this.bottles[type];
                if (bottle.children.some(child => bottleHits.some(hit => hit.object === child))) {
                    this.selectBottle(type);
                    return;
                }
            }
        }

        // Check if clicked on pancake
        const pancakeHits = raycaster.intersectObject(this.pancake);
        if (pancakeHits.length > 0) {
            const point = pancakeHits[0].point;
            this.animateBottlePour(point);
        }
    }

    animateBottlePour(targetPoint) {
        if (this.isPouringAnimation) return;
        this.isPouringAnimation = true;

        const bottle = this.selectedBottle;
        const origPos = { ...bottle.userData.originalPos };
        origPos.z += 0.3; // Account for selection offset
        origPos.y += 0.1;

        // Move bottle above pour point and tilt it
        const pourPos = {
            x: targetPoint.x,
            y: 3,
            z: targetPoint.z + 1
        };

        let frame = 0;
        const totalFrames = 30;

        const animateToPour = () => {
            frame++;
            const t = frame / totalFrames;
            const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            bottle.position.x = origPos.x + (pourPos.x - origPos.x) * easeT;
            bottle.position.y = origPos.y + (pourPos.y - origPos.y) * easeT;
            bottle.position.z = origPos.z + (pourPos.z - origPos.z) * easeT;
            bottle.rotation.x = easeT * Math.PI / 4;

            if (frame < totalFrames) {
                requestAnimationFrame(animateToPour);
            } else {
                // Start pouring
                this.startPourAnimation(targetPoint, () => {
                    // Return bottle to shelf
                    let returnFrame = 0;
                    const returnFrames = 25;

                    const animateReturn = () => {
                        returnFrame++;
                        const rt = returnFrame / returnFrames;
                        const easeRt = rt < 0.5 ? 2 * rt * rt : 1 - Math.pow(-2 * rt + 2, 2) / 2;

                        bottle.position.x = pourPos.x + (origPos.x - pourPos.x) * easeRt;
                        bottle.position.y = pourPos.y + (origPos.y - pourPos.y) * easeRt;
                        bottle.position.z = pourPos.z + (origPos.z - pourPos.z) * easeRt;
                        bottle.rotation.x = (1 - easeRt) * Math.PI / 4;

                        if (returnFrame < returnFrames) {
                            requestAnimationFrame(animateReturn);
                        } else {
                            bottle.rotation.x = 0;
                            this.isPouringAnimation = false;
                        }
                    };

                    animateReturn();
                });
            }
        };

        animateToPour();
    }

    startPourAnimation(targetPoint, onComplete) {
        switch (this.currentTool) {
            case 'cream':
                this.pourWhippedCream(targetPoint, onComplete);
                break;
            case 'syrup':
                this.pourSyrup(targetPoint, onComplete);
                break;
            case 'sprinkles':
                this.dropSprinkles(targetPoint, onComplete);
                break;
        }
    }

    pourWhippedCream(targetPoint, onComplete) {
        const startY = 2.5;
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
                        p.userData.attachedToPancake = true;
                        this.decorations.push(p);
                    }
                }
            });

            if (!allLanded) {
                requestAnimationFrame(animateCream);
            } else {
                this.createCreamDollop(targetPoint);
                if (onComplete) onComplete();
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
        group.userData.attachedToPancake = true;

        this.gameEngine.scene.add(group);
        this.decorations.push(group);

        group.scale.set(0, 0, 0);
        this.animateScale(group, { x: 1, y: 1, z: 1 }, 300);
    }

    pourSyrup(targetPoint, onComplete) {
        const startY = 2.5;
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

            drop.position.set(targetPoint.x, startY + i * 0.12, targetPoint.z);
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
                        p.userData.attachedToPancake = true;
                        this.decorations.push(p);
                    }
                }
            });

            if (!allLanded) {
                requestAnimationFrame(animateSyrup);
            } else {
                this.createSyrupPuddle(targetPoint);
                if (onComplete) onComplete();
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
        puddle.userData.attachedToPancake = true;

        this.gameEngine.scene.add(puddle);
        this.decorations.push(puddle);

        this.createSyrupDrip(position);

        puddle.scale.set(0.5, 1, 0.5);
        this.animateScale(puddle, { x: 1.2, y: 1, z: 1.2 }, 400);
    }

    createSyrupDrip(position) {
        const numPoints = 8;
        const startAngle = Math.atan2(position.z, position.x);

        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const y = position.y - t * 0.6;
            const radius = 1.5 + t * 0.2;
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
            drop.userData.attachedToPancake = true;

            drop.visible = false;
            setTimeout(() => {
                drop.visible = true;
            }, i * 80);

            this.gameEngine.scene.add(drop);
            this.decorations.push(drop);
        }
    }

    dropSprinkles(targetPoint, onComplete) {
        const colors = [0xFF6B9D, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xFF8C42, 0xA855F7];
        const numSprinkles = 25;
        const startY = 2.5;
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
                            p.userData.attachedToPancake = distFromCenter < 1.5;
                            this.decorations.push(p);
                        }
                    }
                }
            });

            if (!allSettled) {
                requestAnimationFrame(animateSprinkles);
            } else {
                this.createSparkleEffect(targetPoint);
                if (onComplete) onComplete();
            }
        };

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

            // Bounce easing
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
        if (!this.pancake) return;

        // Apply rotation momentum
        if (!this.isDragging && Math.abs(this.rotationVelocity) > 0.001) {
            this.rotationVelocity *= 0.95;
            this.pancake.rotation.y += this.rotationVelocity;

            this.decorations.forEach(dec => {
                if (dec.userData && dec.userData.attachedToPancake) {
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
        const doneBtn = document.getElementById('done-btn');
        if (doneBtn) doneBtn.remove();
        const rotateHint = document.getElementById('rotate-hint');
        if (rotateHint) rotateHint.remove();

        // Remove decorations
        this.decorations.forEach(decoration => {
            this.gameEngine.scene.remove(decoration);
        });
        this.decorations = [];

        // Remove bottles
        Object.values(this.bottles).forEach(bottle => {
            this.gameEngine.scene.remove(bottle);
        });

        // Remove scene objects
        if (this.pancake) this.gameEngine.scene.remove(this.pancake);
        if (this.plate) this.gameEngine.scene.remove(this.plate);
        if (this.table) this.gameEngine.scene.remove(this.table);
        if (this.bottleShelf) this.gameEngine.scene.remove(this.bottleShelf);
    }
}

export default DecorateScene;
