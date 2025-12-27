import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsWorld = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;

        // Store physics bodies for syncing with Three.js meshes
        this.physicsBodies = new Map();
    }

    async init() {
        console.log('Initializing Three.js and Cannon.js...');

        // Set up Three.js scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        // Set up Cannon.js physics
        this.setupPhysics();

        // Start render loop
        this.start();

        console.log('Game engine initialized!');
    }

    setupScene() {
        this.scene = new THREE.Scene();

        // Load background image
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            // Use base path for production (GitHub Pages) or relative for dev
            import.meta.env.BASE_URL + 'assets/images/background.jpeg',
            (texture) => {
                this.scene.background = texture;
                console.log('Background image loaded!');
            },
            undefined,
            (error) => {
                console.warn('Could not load background image, using fallback color:', error);
                this.scene.background = new THREE.Color(0xFFF8E7);
            }
        );

        // No fog - let the background image show clearly
        // this.scene.fog = new THREE.Fog(0xFFFFFF, 30, 150);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 5, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add canvas to DOM
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 15, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Soft fill light from the side
        const fillLight = new THREE.DirectionalLight(0xFFE5B4, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
    }

    setupPhysics() {
        // Create physics world
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });

        // Set solver iterations for stability
        this.physicsWorld.solver.iterations = 10;
        this.physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e8;
        this.physicsWorld.defaultContactMaterial.contactEquationRelaxation = 3;

        // Allow physics bodies to sleep when not moving
        this.physicsWorld.allowSleep = true;

        // Create shared physics materials for consistent contact behavior
        // Pancakes are soft and floppy - high friction, very low bounce
        this.pancakePhysicsMaterial = new CANNON.Material('pancake');
        this.pancakePhysicsMaterial.friction = 0.9;
        this.pancakePhysicsMaterial.restitution = 0.02; // Almost no bounce - soft and floppy

        // Create pancake-to-pancake contact material for soft stacking
        const pancakePancakeContact = new CANNON.ContactMaterial(
            this.pancakePhysicsMaterial,
            this.pancakePhysicsMaterial,
            {
                friction: 0.98, // Very high friction so they stick and flop together
                restitution: 0.0, // Zero bounce - just flop onto each other
                contactEquationStiffness: 1e5, // Very soft contact
                contactEquationRelaxation: 10 // Very relaxed = floppy feel
            }
        );
        this.physicsWorld.addContactMaterial(pancakePancakeContact);
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap delta time

        // Update physics world
        if (this.physicsWorld) {
            this.physicsWorld.step(1 / 60, deltaTime, 3);

            // Sync Three.js meshes with physics bodies
            this.syncPhysics();
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    syncPhysics() {
        // Update Three.js objects to match physics bodies
        this.physicsBodies.forEach((body, mesh) => {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });
    }

    addPhysicsBody(mesh, body) {
        // Add mesh to scene and body to physics world
        this.scene.add(mesh);
        this.physicsWorld.addBody(body);

        // Store reference for syncing
        this.physicsBodies.set(mesh, body);

        return { mesh, body };
    }

    removePhysicsBody(mesh) {
        const body = this.physicsBodies.get(mesh);
        if (body) {
            this.physicsWorld.removeBody(body);
            this.physicsBodies.delete(mesh);
        }
        this.scene.remove(mesh);
    }

    clearScene() {
        // Remove all physics bodies and meshes
        const meshesToRemove = Array.from(this.physicsBodies.keys());
        meshesToRemove.forEach(mesh => {
            this.removePhysicsBody(mesh);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Helper method to create pancake geometry
    createPancake(radius = 1, height = 0.2, color = 0xFFD166) {
        // Three.js mesh
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Cannon.js physics body - use shared material for consistent contact behavior
        const shape = new CANNON.Cylinder(radius, radius, height, 32);
        const body = new CANNON.Body({
            mass: 1,
            shape: shape,
            material: this.pancakePhysicsMaterial,
            linearDamping: 0.5, // Higher damping - pancakes slow down quickly, floppy feel
            angularDamping: 0.7 // Higher angular damping - less spinning, more floppy
        });

        return { mesh, body };
    }

    // Helper method to create ground/platform
    createGround(width = 10, height = 0.5, depth = 10) {
        // Three.js mesh
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;

        // Cannon.js physics body (static - mass 0)
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            material: new CANNON.Material({
                friction: 0.9,
                restitution: 0.1
            })
        });

        return { mesh, body };
    }
}

export default GameEngine;
