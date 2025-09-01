import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createNoise3D } from 'simplex-noise';

class EggYolkVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        
        // Particle system
        this.particleGroup = null;
        this.particleGeometry = null;
        this.particleMaterial = null;
        this.particlePoints = null;
        this.raycastTarget = null;
        
        // Physics arrays
        this.basePositions = null;
        this.positions = null;
        this.velocities = null;
        this.particleCount = 15000;
        
        // Physics parameters
        this.springK = 2.0;
        this.damping = 1.2;
        this.noiseStrength = 0.8;
        this.flowSpeed = 1.0;
        this.pushStrength = 70;
        this.sigma = 0.45;
        
        // Animation
        this.clock = new THREE.Clock();
        this.rotationSpeed = 0.05;
        this.time = 0;
        
        // Noise
        this.noise3D = createNoise3D();
        
        // Settings
        this.settings = {
            particleCount: 15000,
            radius: 120,
            viewMode: 'volume',
            mixRatio: 0.5,
            rotationSpeed: 0.05,
            particleSize: 2,
            noiseStrength: 0.8,
            noiseScale: 0.01,
            flowSpeed: 1.0,
            viscosity: 0.0,
            pushStrength: 70,
            spread: 0.45,
            maxInfluenceAngle: Math.PI,
            viewBias: 0.7,
            color: '#ffd700',
            backgroundColor: '#0a0a0a'
        };
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupParticleSystem();
        this.setupGUI();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading
        document.getElementById('loading').classList.add('hidden');
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 300);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(this.settings.backgroundColor);
        
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableAutoRotate = false;
        this.controls.enablePan = false;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 500;
    }
    
    setupParticleSystem() {
        // Create particle group
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        
        // Create raycast target (invisible sphere)
        const targetGeometry = new THREE.SphereGeometry(this.settings.radius, 32, 32);
        const targetMaterial = new THREE.MeshBasicMaterial({ 
            visible: false,
            transparent: true,
            opacity: 0
        });
        this.raycastTarget = new THREE.Mesh(targetGeometry, targetMaterial);
        this.particleGroup.add(this.raycastTarget);
        
        // Initialize particle arrays
        this.initializeParticles();
        
        // Create particle geometry
        this.particleGeometry = new THREE.BufferGeometry();
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        
        // Create particle material
        this.particleMaterial = new THREE.PointsMaterial({
            color: this.settings.color,
            size: this.settings.particleSize,
            sizeAttenuation: false,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });
        
        // Create particle points
        this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.particleGroup.add(this.particlePoints);
    }
    
    initializeParticles() {
        this.particleCount = this.settings.particleCount;
        
        // Initialize arrays
        this.basePositions = new Float32Array(this.particleCount * 3);
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        
        // Generate particle positions based on view mode
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            
            // Generate random direction
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = 2 * Math.PI * Math.random();
            
            // Calculate radius based on view mode
            let radius = this.settings.radius;
            
            switch (this.settings.viewMode) {
                case 'surface':
                    radius = this.settings.radius;
                    break;
                case 'volume':
                    radius = this.settings.radius * Math.pow(Math.random(), 1/3);
                    break;
                case 'mix':
                    const volumeRadius = this.settings.radius * Math.pow(Math.random(), 1/3);
                    const surfaceRadius = this.settings.radius;
                    radius = volumeRadius * (1 - this.settings.mixRatio) + surfaceRadius * this.settings.mixRatio;
                    break;
            }
            
            // Calculate position
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);
            
            // Set base and current positions
            this.basePositions[index] = x;
            this.basePositions[index + 1] = y;
            this.basePositions[index + 2] = z;
            
            this.positions[index] = x;
            this.positions[index + 1] = y;
            this.positions[index + 2] = z;
            
            // Initialize velocities to zero
            this.velocities[index] = 0;
            this.velocities[index + 1] = 0;
            this.velocities[index + 2] = 0;
        }
        
        // Update geometry
        this.updateParticleGeometry();
    }
    
    updateParticleGeometry() {
        if (this.particleGeometry) {
            this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
            this.particleGeometry.attributes.position.needsUpdate = true;
        }
    }
    
    setupGUI() {
        this.gui = new GUI();
        
        // Yolk Properties
        const yolkFolder = this.gui.addFolder('🥚 Yolk Properties');
        yolkFolder.add(this.settings, 'particleCount', 10000, 60000, 1000)
            .name('Particle Count')
            .onChange(() => this.initializeParticles());
        
        yolkFolder.add(this.settings, 'radius', 50, 200, 5)
            .name('Radius')
            .onChange(() => this.updateRadius());
        
        yolkFolder.add(this.settings, 'viewMode', ['volume', 'surface', 'mix'])
            .name('View Mode')
            .onChange(() => this.initializeParticles());
        
        yolkFolder.add(this.settings, 'mixRatio', 0, 1, 0.01)
            .name('Mix Ratio')
            .onChange(() => this.initializeParticles());
        
        // Animation
        const animFolder = this.gui.addFolder('🔄 Animation');
        animFolder.add(this.settings, 'rotationSpeed', 0, 0.2, 0.01)
            .name('Rotation Speed');
        
        animFolder.add(this.settings, 'particleSize', 1, 3, 0.5)
            .name('Particle Size')
            .onChange(() => {
                this.particleMaterial.size = this.settings.particleSize;
            });
        
        // Physics
        const physicsFolder = this.gui.addFolder('💧 Physics');
        physicsFolder.add(this.settings, 'noiseStrength', 0, 2, 0.1)
            .name('Noise Strength');
        
        physicsFolder.add(this.settings, 'noiseScale', 0.001, 0.1, 0.001)
            .name('Noise Scale');
        
        physicsFolder.add(this.settings, 'flowSpeed', 0, 3, 0.1)
            .name('Flow Speed');
        
        physicsFolder.add(this.settings, 'viscosity', 0, 1, 0.01)
            .name('Viscosity')
            .onChange(() => this.updateViscosity());
        
        // Interaction
        const interactionFolder = this.gui.addFolder('👆 Interaction');
        interactionFolder.add(this.settings, 'pushStrength', 10, 200, 5)
            .name('Push Strength');
        
        interactionFolder.add(this.settings, 'spread', 0.1, 2, 0.05)
            .name('Spread (σ)');
        
        interactionFolder.add(this.settings, 'maxInfluenceAngle', 0, Math.PI, 0.1)
            .name('Max Influence Angle');
        
        interactionFolder.add(this.settings, 'viewBias', 0, 1, 0.05)
            .name('View Bias');
        
        // Appearance
        const appearanceFolder = this.gui.addFolder('🎨 Appearance');
        appearanceFolder.addColor(this.settings, 'color')
            .name('Particle Color')
            .onChange(() => {
                this.particleMaterial.color.setHex(this.settings.color.replace('#', '0x'));
            });
        
        appearanceFolder.addColor(this.settings, 'backgroundColor')
            .name('Background Color')
            .onChange(() => {
                this.scene.background.setHex(this.settings.backgroundColor.replace('#', '0x'));
                this.renderer.setClearColor(this.settings.backgroundColor);
            });
        
        // Reset button
        this.gui.add({
            reset: () => this.resetParticles()
        }, 'reset').name('🔄 Reset Particles');
    }
    
    updateRadius() {
        // Update raycast target
        this.raycastTarget.geometry.dispose();
        this.raycastTarget.geometry = new THREE.SphereGeometry(this.settings.radius, 32, 32);
        
        // Scale existing particles
        const scale = this.settings.radius / 120; // Assuming 120 was original radius
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            this.basePositions[index] *= scale;
            this.basePositions[index + 1] *= scale;
            this.basePositions[index + 2] *= scale;
            this.positions[index] *= scale;
            this.positions[index + 1] *= scale;
            this.positions[index + 2] *= scale;
        }
        
        this.updateParticleGeometry();
    }
    
    updateViscosity() {
        const params = this.viscosityToParams(this.settings.viscosity);
        this.springK = params.springK;
        this.damping = params.damping;
        this.noiseStrength = params.noiseStrength;
        this.flowSpeed = params.flowSpeed;
        this.pushStrength = params.pushStrength;
        this.sigma = params.sigma;
        
        // Update GUI values
        this.gui.controllers.forEach(controller => {
            if (controller.property === 'noiseStrength') controller.setValue(params.noiseStrength);
            if (controller.property === 'flowSpeed') controller.setValue(params.flowSpeed);
            if (controller.property === 'pushStrength') controller.setValue(params.pushStrength);
            if (controller.property === 'spread') controller.setValue(params.sigma);
        });
    }
    
    viscosityToParams(doneness) {
        // Map viscosity slider (0-1) to physics parameters
        // 0 = liquid/runny, 1 = hard-boiled/firm
        
        if (doneness <= 0.5) {
            // Liquid to medium
            const t = doneness * 2; // 0 to 1
            return {
                springK: 2.0 + (t * 1.5), // 2.0 to 3.5
                damping: 1.2 + (t * 1.0), // 1.2 to 2.2
                noiseStrength: 0.8 - (t * 0.35), // 0.8 to 0.45
                flowSpeed: 1.0 - (t * 0.4), // 1.0 to 0.6
                pushStrength: 70 - (t * 30), // 70 to 40
                sigma: 0.45 + (t * 0.15) // 0.45 to 0.6
            };
        } else {
            // Medium to hard-boiled
            const t = (doneness - 0.5) * 2; // 0 to 1
            return {
                springK: 3.5 + (t * 3.5), // 3.5 to 7.0
                damping: 2.2 + (t * 2.3), // 2.2 to 4.5
                noiseStrength: 0.45 - (t * 0.39), // 0.45 to 0.06
                flowSpeed: 0.6 - (t * 0.45), // 0.6 to 0.15
                pushStrength: 40 - (t * 30), // 40 to 10
                sigma: 0.6 + (t * 0.3) // 0.6 to 0.9
            };
        }
    }
    
    setupEventListeners() {
        // Pointer events
        this.renderer.domElement.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
        this.renderer.domElement.addEventListener('touchstart', (event) => this.handleTouchStart(event));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handlePointerDown(event) {
        event.preventDefault();
        this.handleInteraction(event.clientX, event.clientY);
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.handleInteraction(touch.clientX, touch.clientY);
        }
    }
    
    handleInteraction(clientX, clientY) {
        // Convert screen coordinates to normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);
        
        // Raycast against the target sphere
        const intersects = raycaster.intersectObject(this.raycastTarget);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // Transform hit point to group-local space
            const hitWorld = hit.point.clone();
            const hitLocal = hitWorld.clone().applyMatrix4(this.particleGroup.matrixWorld.clone().invert());
            
            // Transform camera to group-local space
            const camWorld = this.camera.position.clone();
            const camLocal = camWorld.clone().applyMatrix4(this.particleGroup.matrixWorld.clone().invert());
            
            // Calculate surface normal at hit point
            const nh = hitLocal.clone().normalize();
            
            // Calculate view direction (from camera to hit)
            const viewDir = hitLocal.clone().sub(camLocal).normalize();
            
            // Front-half filter: ignore back-face hits
            if (nh.dot(viewDir) <= 0) {
                return; // Back face hit, ignore
            }
            
            // Apply impulse to particles
            this.applyImpulse(hitLocal, nh, viewDir);
        }
    }
    
    applyImpulse(hitLocal, nh, viewDir) {
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            
            // Get particle base position
            const baseX = this.basePositions[index];
            const baseY = this.basePositions[index + 1];
            const baseZ = this.basePositions[index + 2];
            
            // Calculate particle normal (direction from center)
            const particleNormal = new THREE.Vector3(baseX, baseY, baseZ).normalize();
            
            // Calculate angular distance to epicenter
            const dotProduct = particleNormal.dot(nh);
            const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
            
            // Check if particle is within influence
            if (angle > this.settings.maxInfluenceAngle) {
                continue;
            }
            
            // Calculate weight (Gaussian on sphere)
            const weight = Math.exp(-(angle / this.settings.sigma) ** 2);
            
            // Calculate impulse direction with perspective
            const impulseDir = new THREE.Vector3()
                .addScaledVector(viewDir, this.settings.viewBias)
                .addScaledVector(particleNormal, 1 - this.settings.viewBias)
                .normalize();
            
            // Apply impulse
            const impulse = this.settings.pushStrength * weight;
            this.velocities[index] += impulseDir.x * impulse;
            this.velocities[index + 1] += impulseDir.y * impulse;
            this.velocities[index + 2] += impulseDir.z * impulse;
        }
    }
    
    updatePhysics(deltaTime) {
        // Clamp delta time
        const dt = Math.min(deltaTime, 0.033);
        
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            
            // Get current values
            const x = this.positions[index];
            const y = this.positions[index + 1];
            const z = this.positions[index + 2];
            
            const baseX = this.basePositions[index];
            const baseY = this.basePositions[index + 1];
            const baseZ = this.basePositions[index + 2];
            
            // Spring force back to base position
            const springX = (baseX - x) * this.springK;
            const springY = (baseY - y) * this.springK;
            const springZ = (baseZ - z) * this.springK;
            
            // Damping force
            const dampX = -this.velocities[index] * this.damping;
            const dampY = -this.velocities[index + 1] * this.damping;
            const dampZ = -this.velocities[index + 2] * this.damping;
            
            // Noise force (coherent drift)
            const noiseX = this.noise3D(
                baseX * this.settings.noiseScale,
                baseY * this.settings.noiseScale,
                (baseZ * this.settings.noiseScale) + (this.time * this.settings.flowSpeed)
            ) * this.settings.noiseStrength;
            
            const noiseY = this.noise3D(
                (baseX * this.settings.noiseScale) + 1000,
                (baseY * this.settings.noiseScale) + 1000,
                (baseZ * this.settings.noiseScale) + (this.time * this.settings.flowSpeed)
            ) * this.settings.noiseStrength;
            
            const noiseZ = this.noise3D(
                (baseX * this.settings.noiseScale) + 2000,
                (baseY * this.settings.noiseScale) + 2000,
                (baseZ * this.settings.noiseScale) + (this.time * this.settings.flowSpeed)
            ) * this.settings.noiseStrength;
            
            // Apply forces
            this.velocities[index] += (springX + dampX + noiseX) * dt;
            this.velocities[index + 1] += (springY + dampY + noiseY) * dt;
            this.velocities[index + 2] += (springZ + dampZ + noiseZ) * dt;
            
            // Update position
            this.positions[index] += this.velocities[index] * dt;
            this.positions[index + 1] += this.velocities[index + 1] * dt;
            this.positions[index + 2] += this.velocities[index + 2] * dt;
            
            // Keep particles within sphere bounds
            const distance = Math.sqrt(
                this.positions[index] ** 2 +
                this.positions[index + 1] ** 2 +
                this.positions[index + 2] ** 2
            );
            
            if (distance > this.settings.radius) {
                const scale = this.settings.radius / distance;
                this.positions[index] *= scale;
                this.positions[index + 1] *= scale;
                this.positions[index + 2] *= scale;
                
                // Bounce back
                this.velocities[index] *= -0.5;
                this.velocities[index + 1] *= -0.5;
                this.velocities[index + 2] *= -0.5;
            }
        }
        
        // Update geometry
        this.updateParticleGeometry();
    }
    
    resetParticles() {
        // Reset all particles to base positions
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            this.positions[index] = this.basePositions[index];
            this.positions[index + 1] = this.basePositions[index + 1];
            this.positions[index + 2] = this.basePositions[index + 2];
            this.velocities[index] = 0;
            this.velocities[index + 1] = 0;
            this.velocities[index + 2] = 0;
        }
        
        this.updateParticleGeometry();
    }
    
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Rotate particle group
        this.particleGroup.rotation.y += this.settings.rotationSpeed * deltaTime;
        
        // Update controls
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new EggYolkVisualizer();
});
