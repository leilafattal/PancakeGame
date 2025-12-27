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

    // Helper method to create realistic pancake geometry
    createPancake(radius = 1, height = 0.2) {
        // Create realistic pancake mesh with irregular edges and domed surface
        const mesh = this.createRealisticPancakeMesh(radius, height);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Cannon.js physics body - use shared material for consistent contact behavior
        const shape = new CANNON.Cylinder(radius, radius, height, 32);
        const body = new CANNON.Body({
            mass: 1,
            shape: shape,
            material: this.pancakePhysicsMaterial,
            linearDamping: 0.5,
            angularDamping: 0.7
        });

        return { mesh, body };
    }

    // Create a realistic looking pancake mesh
    createRealisticPancakeMesh(radius, height) {
        const segments = 48;
        const geometry = new THREE.CylinderGeometry(radius, radius * 1.02, height, segments, 1, false);

        // Modify vertices for irregular edges and slight dome
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);

            // Calculate distance from center
            const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
            const angle = Math.atan2(vertex.z, vertex.x);

            // Add irregular edges (wavy outline)
            if (distFromCenter > radius * 0.5) {
                const edgeNoise = 0.03 * Math.sin(angle * 8) + 0.02 * Math.sin(angle * 13 + 1.5);
                const scaleFactor = 1 + edgeNoise * (distFromCenter / radius);
                vertex.x *= scaleFactor;
                vertex.z *= scaleFactor;
            }

            // Add slight dome to top surface
            if (vertex.y > 0) {
                const domeHeight = 0.015 * (1 - Math.pow(distFromCenter / radius, 2));
                vertex.y += domeHeight;
            }

            // Add subtle surface bumps (bubbles)
            if (Math.abs(vertex.y) < height * 0.6) {
                const bumpNoise = 0.008 * Math.sin(vertex.x * 15) * Math.cos(vertex.z * 15);
                vertex.y += bumpNoise;
            }

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Create realistic pancake material with procedural browning
        const material = this.createPancakeMaterial(radius);

        return new THREE.Mesh(geometry, material);
    }

    // Create a procedural pancake material with browning pattern
    createPancakeMaterial(radius) {
        // Create a canvas for the pancake texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color - golden pancake
        const baseColor = '#E8B85C';
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        // Add browning pattern (darker ring around edges, lighter center)
        const centerX = 256;
        const centerY = 256;

        // Radial gradient for browning
        const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 240);
        gradient.addColorStop(0, 'rgba(245, 200, 120, 0.8)');    // Light golden center
        gradient.addColorStop(0.5, 'rgba(220, 165, 80, 0.6)');   // Medium
        gradient.addColorStop(0.75, 'rgba(180, 120, 50, 0.7)');  // Darker ring
        gradient.addColorStop(1, 'rgba(140, 90, 40, 0.9)');      // Dark edge

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Add bubble marks (small darker circles)
        ctx.fillStyle = 'rgba(160, 100, 40, 0.3)';
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 180 + 30;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            const bubbleRadius = Math.random() * 15 + 5;

            ctx.beginPath();
            ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add some lighter spots (butter/oil spots)
        ctx.fillStyle = 'rgba(255, 220, 150, 0.25)';
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 150;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            const spotRadius = Math.random() * 20 + 8;

            ctx.beginPath();
            ctx.arc(x, y, spotRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add subtle noise texture
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Create bump map for surface detail
        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = 256;
        bumpCanvas.height = 256;
        const bumpCtx = bumpCanvas.getContext('2d');

        // Base gray
        bumpCtx.fillStyle = '#808080';
        bumpCtx.fillRect(0, 0, 256, 256);

        // Add bubble bumps
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const bubbleRadius = Math.random() * 8 + 3;

            const bumpGrad = bumpCtx.createRadialGradient(x, y, 0, x, y, bubbleRadius);
            bumpGrad.addColorStop(0, 'rgba(100, 100, 100, 0.5)');
            bumpGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');

            bumpCtx.fillStyle = bumpGrad;
            bumpCtx.beginPath();
            bumpCtx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
            bumpCtx.fill();
        }

        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

        // Create material with all textures
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: bumpTexture,
            bumpScale: 0.02,
            roughness: 0.85,
            metalness: 0.0,
            side: THREE.DoubleSide
        });

        return material;
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
