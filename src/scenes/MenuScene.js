import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class MenuScene {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.decorativePancakes = [];
        this.rotationSpeed = 0.5;
    }

    init() {
        console.log('Initializing menu scene...');

        // Clear any existing objects
        this.gameEngine.clearScene();

        // Add decorative pancake stack in background
        this.createDecorativeStack();

        // Add ambient animation
        this.animate();
    }

    createDecorativeStack() {
        // Create a small decorative stack of pancakes
        const stackPositions = [
            { y: 0.5, rotation: 0.1 },
            { y: 0.9, rotation: -0.15 },
            { y: 1.3, rotation: 0.2 },
            { y: 1.7, rotation: -0.1 }
        ];

        stackPositions.forEach((pos, index) => {
            const { mesh, body } = this.gameEngine.createPancake(1.2, 0.25, 0xFFD166);

            // Position
            body.position.y = pos.y;
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), pos.rotation);
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);

            // Make static (no physics simulation)
            body.mass = 0;
            body.type = CANNON.Body.STATIC;

            this.gameEngine.addPhysicsBody(mesh, body);
            this.decorativePancakes.push({ mesh, body });
        });

        // Add a plate at the bottom
        const plateGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.4,
            metalness: 0.3
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.y = 0.3;
        plate.receiveShadow = true;
        this.gameEngine.scene.add(plate);
        this.decorativePancakes.push({ mesh: plate });
    }

    animate() {
        if (!this.decorativePancakes.length) return;

        // Gentle rotation animation for decorative stack
        const time = Date.now() * 0.001;
        this.decorativePancakes.forEach((obj, index) => {
            if (obj.mesh) {
                obj.mesh.rotation.y = Math.sin(time * 0.5 + index * 0.5) * 0.1;
            }
        });

        // Continue animation if still in menu
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        console.log('Destroying menu scene...');
        // The game engine will handle cleanup
        this.decorativePancakes = [];
    }
}

export default MenuScene;
