import * as THREE from 'three';

class DecorateScene {
    constructor(gameEngine, gameManager) {
        this.gameEngine = gameEngine;
        this.gameManager = gameManager;

        // Scene elements
        this.pancake = null;
        this.plate = null;

        // Current decoration tool
        this.currentTool = null; // 'sprinkles', 'cream', 'syrup'

        // Decoration objects
        this.decorations = [];
    }

    init() {
        console.log('Initializing Decorate scene...');

        // Clear scene
        this.gameEngine.clearScene();

        // Create environment
        this.createPlate();
        this.createPancake();
        this.setupUI();
        this.setupInputHandlers();

        // Adjust camera for better decoration view
        this.gameEngine.camera.position.set(0, 6, 8);
        this.gameEngine.camera.lookAt(0, 1, 0);
    }

    createPlate() {
        const plateGeometry = new THREE.CylinderGeometry(2, 2, 0.15, 32);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.3,
            metalness: 0.4
        });
        this.plate = new THREE.Mesh(plateGeometry, plateMaterial);
        this.plate.position.y = 0.075;
        this.plate.receiveShadow = true;
        this.gameEngine.scene.add(this.plate);
    }

    createPancake() {
        const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD166,
            roughness: 0.7,
            metalness: 0.1
        });
        this.pancake = new THREE.Mesh(geometry, material);
        this.pancake.position.y = 0.3;
        this.pancake.castShadow = true;
        this.pancake.receiveShadow = true;
        this.gameEngine.scene.add(this.pancake);
    }

    setupUI() {
        // Create decoration tool palette (simplified for now)
        // In a full implementation, this would be a proper UI overlay
        console.log('Decoration tools: Sprinkles, Whipped Cream, Maple Syrup');
        console.log('Press 1 for Sprinkles, 2 for Cream, 3 for Syrup');
        console.log('Click "DONE" to return to menu');
    }

    setupInputHandlers() {
        // Keyboard for tool selection (temporary)
        this.keyHandler = (e) => {
            if (e.key === '1') this.selectTool('sprinkles');
            if (e.key === '2') this.selectTool('cream');
            if (e.key === '3') this.selectTool('syrup');
        };

        // Mouse/touch for applying decorations
        this.clickHandler = (e) => {
            if (!this.currentTool) return;

            const coords = this.getMousePosition(e);
            this.applyDecoration(coords.x, coords.y);
        };

        window.addEventListener('keydown', this.keyHandler);
        this.gameEngine.renderer.domElement.addEventListener('click', this.clickHandler);
    }

    removeInputHandlers() {
        window.removeEventListener('keydown', this.keyHandler);
        this.gameEngine.renderer.domElement.removeEventListener('click', this.clickHandler);
    }

    selectTool(tool) {
        this.currentTool = tool;
        console.log(`Selected tool: ${tool}`);
    }

    getMousePosition(event) {
        const rect = this.gameEngine.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return { x, y };
    }

    applyDecoration(x, y) {
        // Cast ray to find position on pancake
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.gameEngine.camera);

        const intersects = raycaster.intersectObject(this.pancake);

        if (intersects.length > 0) {
            const point = intersects[0].point;

            switch (this.currentTool) {
                case 'sprinkles':
                    this.addSprinkles(point);
                    break;
                case 'cream':
                    this.addCream(point);
                    break;
                case 'syrup':
                    this.addSyrup(point);
                    break;
            }
        }
    }

    addSprinkles(position) {
        // Create colorful sprinkles
        const colors = [0xFF6B9D, 0x4ECDC4, 0xFFE66D, 0x95E1D3];

        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
            const material = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)]
            });
            const sprinkle = new THREE.Mesh(geometry, material);

            // Random position near click point
            sprinkle.position.set(
                position.x + (Math.random() - 0.5) * 0.2,
                position.y + 0.05,
                position.z + (Math.random() - 0.5) * 0.2
            );

            // Random rotation
            sprinkle.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.gameEngine.scene.add(sprinkle);
            this.decorations.push(sprinkle);
        }

        console.log('Added sprinkles!');
    }

    addCream(position) {
        // Create whipped cream dollop
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFFAFA,
            roughness: 0.8,
            metalness: 0.1
        });
        const cream = new THREE.Mesh(geometry, material);

        cream.position.set(position.x, position.y + 0.15, position.z);
        cream.scale.set(1, 1.3, 1); // Slightly peaked

        this.gameEngine.scene.add(cream);
        this.decorations.push(cream);

        console.log('Added whipped cream!');
    }

    addSyrup(position) {
        // Create syrup drizzle (simplified as small spheres for now)
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xD2691E,
            roughness: 0.2,
            metalness: 0.6,
            transparent: true,
            opacity: 0.8
        });
        const syrup = new THREE.Mesh(geometry, material);

        syrup.position.set(position.x, position.y + 0.05, position.z);
        syrup.scale.set(1.2, 0.3, 1.2); // Flat puddle

        this.gameEngine.scene.add(syrup);
        this.decorations.push(syrup);

        console.log('Added maple syrup!');
    }

    destroy() {
        console.log('Destroying Decorate scene...');
        this.removeInputHandlers();

        // Remove decorations
        this.decorations.forEach(decoration => {
            this.gameEngine.scene.remove(decoration);
        });
        this.decorations = [];

        // Remove pancake and plate
        if (this.pancake) this.gameEngine.scene.remove(this.pancake);
        if (this.plate) this.gameEngine.scene.remove(this.plate);
    }
}

export default DecorateScene;
